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
    const distance = getVectorLength(offsetVector(a, b));
    return distance;
  }
  function normaliseVector(v) {
    const length = getVectorLength(v);
    return { x: v.x / length, y: v.y / length };
  }

  // VARIABLES

  const player = {
    x: 50,
    y: 50,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    deceleration: 0.95,
    width: 20,
    height: 20,
    color: "cyan",
    speed: 0.5,
  };
  const enemies = [
    {
      x: 200,
      y: 300,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      deceleration: 0.95,
      width: 20,
      height: 20,
      color: "blue",
      speed: 2,
    },
  ];

  // PLAYER FUNCTIONS

  function drawPlayer() {
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.arc(
      player.x + player.width / 2,
      player.y + player.height / 2,
      player.width / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.closePath();
  }
  function updatePlayer() {
    drawPlayer();
    player.vx += player.ax;
    player.vy += player.ay;

    player.vx *= player.deceleration;
    player.vy *= player.deceleration;

    player.x += player.vx;
    player.y += player.vy;
  }

  // ENEMY FUNCTIONS

  function enemyAttack(enemy) {
    player.color = "red";
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.stroke();
  }
  function updateEnemies() {
    enemies.forEach(function (enemy) {
      const distance = getVectorDistance(player, enemy);

      drawEnemy(enemy);
      moveEnemy(enemy);
      checkBoundariesEnemes(enemy);

      if (distance < 50) {
        enemyAttack(enemy);
      } else {
        player.color = "cyan";
      }

      if (distance < 200) {
        moveEnemy(enemy);
      } else {
        enemy.vx = 0;
        enemy.vy = 0;
      }

      enemy.vx += enemy.ax;
      enemy.vy += enemy.ay;

      enemy.vx *= enemy.deceleration;
      enemy.vy *= enemy.deceleration;

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
    });
  }
  function drawEnemy(enemy) {
    ctx.beginPath();
    ctx.fillStyle = enemy.color;
    ctx.arc(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      enemy.width / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.closePath();
  }
  function moveEnemy(enemy) {
    const directionVector = offsetVector(player, enemy);
    const normalisedVector = normaliseVector(directionVector);

    enemy.vx = normalisedVector.x * enemy.speed;
    enemy.vy = normalisedVector.y * enemy.speed;
  }
  function checkBoundariesEnemes(enemy) {
    if (enemy.x < 0) {
      enemy.x = 0;
    } else if (enemy.x + enemy.width > canvas.width) {
      enemy.x = canvas.width - enemy.width;
    }
    if (enemy.y < 0) {
      enemy.y = 0;
    } else if (enemy.y + enemy.height > canvas.height) {
      enemy.y = canvas.height - enemy.height;
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
      player.ax = -player.speed;
    } else if (keys.right) {
      player.ax = player.speed;
    } else {
      player.ax = 0;
    }
    if (keys.up) {
      player.ay = -player.speed;
    } else if (keys.down) {
      player.ay = player.speed;
    } else {
      player.ay = 0;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateEnemies();
    updatePlayer();
    checkKeys();
    requestAnimationFrame(animate);
  }

  animate();
});
