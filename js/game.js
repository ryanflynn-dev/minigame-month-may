import { initControls, getControls } from "./core/control.js";

document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.addEventListener("mouseenter", () => {
    canvas.classList.add("canvas-shoot");
  });

  canvas.addEventListener("mouseleave", () => {
    canvas.classList.remove("canvas-shoot");
  });

  initControls()

  canvas.width = 1280;
  canvas.height = 720;
  let lasttime = 0;
  let score = 0;
  let highScore = 0;
  let enemyLength = 1;

  //UTILS
  function offsetVector(a, b) {
    const offset = { x: a.x - b.x, y: a.y - b.y };
    return offset;
  }
  function getVectorLength(a) {
    const length = Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
    return length;
  }
  function getVectorDistance(a, b) {
    return getVectorLength(offsetVector(a, b));
  }
  function normaliseVector(v) {
    const length = getVectorLength(v);
    return { x: v.x / length, y: v.y / length };
  }

  // CLASSES

  class Character {
    constructor({
      name,
      health,
      position,
      velocity,
      acceleration,
      deceleration,
      speed,
      width,
      height,
      color,
      damage,
      damagePlus,
    }) {
      this.name = name;
      this.health = health;
      this.position = position;
      this.velocity = velocity;
      this.acceleration = acceleration;
      this.deceleration = deceleration;
      this.speed = speed;
      this.width = width;
      this.height = height;
      this.color = color;
      this.damage = damage;
      this.damagePlus = damagePlus;
    }
    update(deltatime) {
      this.draw();
      this.checkBoundaries();

      this.velocity.x += this.acceleration.x * this.speed;
      this.velocity.y += this.acceleration.y * this.speed;

      this.velocity.x *= this.deceleration;
      this.velocity.y *= this.deceleration;

      this.position.x += this.velocity.x * deltatime;
      this.position.y += this.velocity.y * deltatime;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2,
        this.width / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
    checkBoundaries() {
      if (this.position.x < 0) {
        this.position.x = 0;
      } else if (this.position.x + this.width > canvas.width) {
        this.position.x = canvas.width - this.width;
      }
      if (this.position.y < 0) {
        this.position.y = 0;
      } else if (this.position.y + this.height > canvas.height) {
        this.position.y = canvas.height - this.height;
      }
    }
    takeDamage(damage) {
      this.health -= damage;
    }
  }

  class Player extends Character {
    constructor({ name, position }) {
      super({
        name: name,
        health: 100,
        position: position,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        deceleration: 0.95,
        speed: 5,
        width: 20,
        height: 20,
        color: "cyan",
        damage: 10,
        damagePlus: 10,
      });
      this.bullets = [];
    }

    update(deltatime) {
      super.update(deltatime);
      this.bulletUpdate(deltatime);
    }

    bulletUpdate(deltatime) {
      for (let i = 0; i < this.bullets.length; i++) {
        const bulletDamage = Math.random() * this.damage + this.damagePlus;
        const bullet = this.bullets[i];
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(
          bullet.position.x + bullet.width / 2,
          bullet.position.y + bullet.height / 2,
          bullet.width / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.closePath();

        bullet.position.x += bullet.velocity.x * bullet.speed * deltatime;
        bullet.position.y += bullet.velocity.y * bullet.speed * deltatime;
        bullet.lifespan -= 1 * deltatime;
        if (bullet.lifespan < 0) {
          this.removeBullet(i);
        }
        if (enemies) {
          for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const distance = getVectorDistance(
              {
                x: bullet.position.x + bullet.width / 2,
                y: bullet.position.y + bullet.height / 2,
              },
              {
                x: enemy.position.x + enemy.width / 2,
                y: enemy.position.y + enemy.height / 2,
              }
            );
            if (distance <= bullet.width / 2 + enemy.width / 2) {
              enemy.takeDamage(bulletDamage);
              this.removeBullet(i);
            }
          }
        }
      }
    }
    shoot(mousePosition) {
      const direction = offsetVector(mousePosition, {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2,
      });
      const normalisedVector = normaliseVector(direction);

      const bullet = {
        name: "bullet",
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2,
        },
        velocity: { x: normalisedVector.x * 10, y: normalisedVector.y * 10 },
        acceleration: { x: 0, y: 0 },
        color: "red",
        width: 5,
        height: 5,
        lifespan: 1,
        speed: 50,
      };
      this.bullets.push(bullet);
    }

    removeBullet(index) {
      this.bullets.splice(index, 1);
    }
  }

  class Enemy extends Character {
    constructor({ name, health, position, speed, width, height, color }) {
      super({
        name: name,
        health: health,
        position: position,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        deceleration: 0.95,
        speed: speed,
        width: width,
        height: height,
        color: color,
        damage: 0.1,
        damagePlus: 0.4,
      });
    }
    update(deltatime) {
      super.update(deltatime);
      if (getVectorDistance(this.position, player.position) < 50) {
        const hitDamage = Math.random() * this.damage + this.damagePlus;
        this.attack();
        player.takeDamage(hitDamage);
      }

      if (getVectorDistance(this.position, player.position) < 300) {
        this.moveToPlayer();
      }

      if (this.health <= 0) {
        enemies.splice(enemies.indexOf(this), 1);
        score += 1;
      }
    }
    attack() {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2
      );
      ctx.lineTo(
        player.position.x + player.width / 2,
        player.position.y + player.height / 2
      );
      ctx.stroke();
    }
    moveToPlayer() {
      const directionVector = offsetVector(player.position, this.position);
      const normalisedVector = normaliseVector(directionVector);

      this.velocity.x = normalisedVector.x * this.speed;
      this.velocity.y = normalisedVector.y * this.speed;
    }
  }

  const player = new Player({ name: "player", position: { x: 100, y: 100 } });
  const enemies = [];

  // FUNCTIONS

  function randomEnemyGenerator() {
    const randomX = Math.random() * canvas.width;
    const randomY = Math.random() * canvas.height;
    const colors = [
      "red",
      "green",
      "blue",
      "yellow",
      "purple",
      "orange",
      "magenta",
      "white",
      "black",
    ];
    enemies.push(
      new Enemy({
        name: "enemy",
        health: 100,
        position: { x: randomX, y: randomY },
        speed: Math.random() * 30 + 20,
        width: 20,
        height: 20,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    );
  }

  function setAmountOfEnemies(amount = 1) {
    enemies.length = 0;
    for (let i = 0; i < amount; i++) {
      randomEnemyGenerator();
    }
  }

  function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  // CONTROLS

  document.addEventListener("click", function (e) {
    const mousePos = getMousePos(canvas, e);
    player.shoot(mousePos);
  });

  // const keys = {
  //   left: false,
  //   right: false,
  //   up: false,
  //   down: false,
  // };

  // document.addEventListener("keydown", function movePlayer(e) {
  //   e.preventDefault();
  //   switch (e.keyCode) {
  //     case 37: // Left
  //       keys.left = true;
  //       break;
  //     case 65: // Left
  //       keys.left = true;
  //       break;
  //     case 39: // Right
  //       keys.right = true;
  //       break;
  //     case 68: // Right
  //       keys.right = true;
  //       break;
  //     case 38: // Up
  //       keys.up = true;
  //       break;
  //     case 87: // Up
  //       keys.up = true;
  //       break;
  //     case 83: // Down
  //       keys.down = true;
  //       break;
  //     case 40: // Down
  //       keys.down = true;
  //       break;
  //   }
  // });

  // document.addEventListener("keyup", function stopPlayer(e) {
  //   switch (e.keyCode) {
  //     case 37: // Left
  //       keys.left = false;
  //       break;
  //     case 65: // Left
  //       keys.left = false;
  //       break;
  //     case 39: // Right
  //       keys.right = false;
  //       break;
  //     case 68: // Right
  //       keys.right = false;
  //       break;
  //     case 38: // Up
  //       keys.up = false;
  //       break;
  //     case 87: // Up
  //       keys.up = false;
  //       break;
  //     case 83: // Down
  //       keys.down = false;
  //       break;
  //     case 40: // Down
  //       keys.down = false;
  //       break;
  //   }
  // });

  function checkKeys() {
    const keys = getControls()
    if (keys.left) {
      player.acceleration.x = -player.speed;
    } else if (keys.right) {
      player.acceleration.x = player.speed;
    } else {
      player.acceleration.x = 0;
    }
    if (keys.up) {
      player.acceleration.y = -player.speed;
    } else if (keys.down) {
      player.acceleration.y = player.speed;
    } else {
      player.acceleration.y = 0;
    }
  }

  // GAME LOOP

  function showScore() {
    ctx.fillStyle = "black";
    ctx.font = "30px Impact";
    ctx.fillText("Score: " + score, 12, 32);
    ctx.fillStyle = "white";
    ctx.font = "30px Impact";
    ctx.fillText("Score: " + score, 10, 30);
  }

  function showHighScore() {
    ctx.fillStyle = "black";
    ctx.font = "30px Impact";
    ctx.fillText("High Score: " + highScore, 12, 62);
    ctx.fillStyle = "white";
    ctx.font = "30px Impact";
    ctx.fillText("High Score: " + highScore, 10, 60);
  }

  function debug() {
    const debug = console.log;
    debug("player", player.health);
  }

  function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let deltatime = (timestamp - lasttime) / 1000;
    lasttime = timestamp;
    enemies.forEach((enemy) => {
      enemy.update(deltatime);
    });
    player.update(deltatime);
    showScore();
    showHighScore();
    debug();
    checkKeys();
    if (enemies.length < 1) {
      enemyLength += 1;
      setAmountOfEnemies(enemyLength);
    }
    if (player.health <= 0) {
      alert("GAME OVER");
      resetGame();
    }
    requestAnimationFrame(animate);
  }

  function gameInit() {
    setAmountOfEnemies();
    animate(0);
  }

  function resetGame() {
    player.health = 100;
    enemies.length = 0;
    highScore = Math.max(highScore, score);
    score = 0;
    setAmountOfEnemies();
    gameInit();
  }

  gameInit();
});
