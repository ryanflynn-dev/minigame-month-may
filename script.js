document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1280;
  canvas.height = 720;
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
    }
    update() {
      this.draw();
      this.move();
      this.checkBoundaries();
    }

    move() {
      this.velocity.x += this.acceleration.x;
      this.velocity.y += this.acceleration.y;

      this.velocity.x *= this.deceleration;
      this.velocity.y *= this.deceleration;

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
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
        speed: 0.5,
        width: 20,
        height: 20,
        color: "cyan",
      });
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
      });
    }
    update() {
      super.update();
      console.log(getVectorDistance(this.position, player.position));
      if (getVectorDistance(this.position, player.position) < 50) {
        this.attack();
      }

      if (getVectorDistance(this.position, player.position) < 200) {
        this.moveToPlayer();
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
        speed: 0.5,
        width: 20,
        height: 20,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    );
  }

  function setAmountOfEnemies() {
    enemies.length = 0;
    for (let i = 0; i < 1000; i++) {
      randomEnemyGenerator();
    }
  }

  // KEYS
  const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  document.addEventListener("keydown", function movePlayer(e) {
    e.preventDefault();
    switch (e.keyCode) {
      case 37: // Left
        keys.left = true;
        break;
      case 65: // Left
        keys.left = true;
        break;
      case 39: // Right
        keys.right = true;
        break;
      case 68: // Right
        keys.right = true;
        break;
      case 38: // Up
        keys.up = true;
        break;
      case 87: // Up
        keys.up = true;
        break;
      case 83: // Down
        keys.down = true;
        break;
      case 40: // Down
        keys.down = true;
        break;
    }
  });

  document.addEventListener("keyup", function stopPlayer(e) {
    switch (e.keyCode) {
      case 37: // Left
        keys.left = false;
        break;
      case 65: // Left
        keys.left = false;
        break;
      case 39: // Right
        keys.right = false;
        break;
      case 68: // Right
        keys.right = false;
        break;
      case 38: // Up
        keys.up = false;
        break;
      case 87: // Up
        keys.up = false;
        break;
      case 83: // Down
        keys.down = false;
        break;
      case 40: // Down
        keys.down = false;
        break;
    }
  });

  function checkKeys() {
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

  function debug() {}

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enemies.forEach((enemy) => {
      enemy.update();
    });
    player.update();

    debug();
    checkKeys();
    requestAnimationFrame(animate);
  }

  function gameInit() {
    setAmountOfEnemies();
    animate();
  }

  gameInit();
});
