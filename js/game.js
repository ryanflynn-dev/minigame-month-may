import { initControls, getControls } from "./core/control.js";
import { updateUI, resetUI } from "./core/ui.js";

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.addEventListener("mouseenter", () => {
        canvas.classList.add("canvas-shoot");
    });

    canvas.addEventListener("mouseleave", () => {
        canvas.classList.remove("canvas-shoot");
    });

    // GLOBAL VARIABLES
    canvas.width = 960;
    canvas.height = 540;
    let lasttime = 0;
    let score = 0;
    let highScore = 0;
    let worldWidth = 1280;
    let worldHeight = 720;

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
    function getMousePos(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left + camera.position.x,
            y: e.clientY - rect.top + camera.position.y,
        };
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
        getHealth() {
            return this.health;
        }
        getRoundedHealth() {
            return Math.floor(this.getHealth())
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
                const bulletDamage =
                    Math.random() * this.damage + this.damagePlus;
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

                bullet.position.x +=
                    bullet.velocity.x * bullet.speed * deltatime;
                bullet.position.y +=
                    bullet.velocity.y * bullet.speed * deltatime;
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
                velocity: {
                    x: normalisedVector.x * 10,
                    y: normalisedVector.y * 10,
                },
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
                const index = enemies.indexOf(this);
                if (index > -1) {
                    enemies.splice(index, 1);
                    score += 1;
                    checkIfWaveComplete();
                }
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
            const directionVector = offsetVector(
                player.position,
                this.position
            );
            const normalisedVector = normaliseVector(directionVector);

            this.velocity.x = normalisedVector.x * this.speed;
            this.velocity.y = normalisedVector.y * this.speed;
        }
    }

    let player = null;
    let enemies = [];

    // ENEMY GENERATOR FUNCTIONS

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

    function setEnemies(amount = 1, waveTime = 50000, immediateSpawn = false) {
        if (immediateSpawn) {
            randomEnemyGenerator();
            amount--;
        }

        for (let i = 0; i < amount; i++) {
            let spawnTime = Math.random() * waveTime;
            setTimeout(randomEnemyGenerator, spawnTime);
        }
    }

    // LEVELS

    let currentLevel = 1;

    const levels = [
        {
            id: 1,
            waves: [
                { numEnemies: 10, waveTime: 10000, breakTime: 5000 },
                { numEnemies: 20, waveTime: 20000, breakTime: 10000 },
            ],
            levelWidth: 1280,
            levelHeight: 720,
        },
        {
            id: 2,
            waves: [
                { numEnemies: 20, waveTime: 15000, breakTime: 7000 },
                { numEnemies: 30, waveTime: 25000, breakTime: 10000 },
            ],
            levelWidth: 1280,
            levelHeight: 720,
        },
    ];

    let waveIndex = 0;
    function startNextWave(waves) {
        console.log("Starting wave");
        if (waveIndex < waves.length) {
            let wave = waves[waveIndex];
            setEnemies(wave.numEnemies, wave.waveTime, waveIndex === 0);
            waveIndex++;
        } else {
            waveIndex = 0;
            checkIfLevelComplete();
        }
    }

    function checkIfWaveComplete() {
        if (enemies.length === 0) {
            console.log("Wave complete");
            let wave = levels[currentLevel - 1].waves[waveIndex - 1];
            setTimeout(
                () => startNextWave(levels[currentLevel - 1].waves),
                wave.breakTime
            );
        }
    }

    function loadLevel(levelId) {
        const level = levels.find((l) => l.id === levelId);
        if (!level) {
            loadLevel(1);
            return;
        }
        currentLevel = levelId;
        worldWidth = level.levelWidth;
        worldHeight = level.levelHeight;
        waveIndex = 0;
        startNextWave(level.waves);
    }

    function checkIfLevelComplete() {
        if (enemies.length === 0 && currentLevel < levels.length) {
            loadLevel(currentLevel + 1);
        }
    }

    // CAMERA
    const camera = {
        position: { x: 0, y: 0 },
        width: canvas.width,
        height: canvas.height,
    };

    function updateCamera() {
        camera.position.x = Math.max(
            0,
            Math.min(
                player.position.x - canvas.width / 2,
                worldWidth - canvas.width
            )
        );
        camera.position.y = Math.max(
            0,
            Math.min(
                player.position.y - canvas.height / 2,
                worldHeight - canvas.height
            )
        );
    }

    // CONTROLS

    function initMouseControls() {
        document.removeEventListener("click", handleMouseInput);
        document.addEventListener("click", handleMouseInput);
    }

    function handleMouseInput(e) {
        if (!player) return;
        const mousePos = getMousePos(canvas, e, camera);
        player.shoot(mousePos);
    }

    function checkKeys() {
        const keys = getControls();
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

    function debug() {
        const debug = console.log;
        debug("player", player.health);
    }

    let deltatime = 0;
    let animationFrameId;
    function animate(timestamp) {
        cancelAnimationFrame(animationFrameId);
        if (!lasttime) lasttime = timestamp;
        deltatime = (timestamp - lasttime) / 1000;
        lasttime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-camera.position.x, -camera.position.y);
        enemies.forEach((enemy) => {
            enemy.update(deltatime);
        });
        player.update(deltatime);
        debug();
        checkKeys();
        if (player.health <= 0) {
            resetGame();
        }
        ctx.restore();
        updateUI(ctx, player.getRoundedHealth(), highScore, score)
        updateCamera();
        animationFrameId = requestAnimationFrame(animate);
    }

    function gameInit() {
        player = new Player({ name: "player", position: { x: 100, y: 100 } });
        loadLevel(1);
        resetUI(ctx);
        initControls();
        initMouseControls();
        animate(0);
    }

    function resetGame() {
        cancelAnimationFrame(animationFrameId);
        player = new Player({ name: "player", position: { x: 100, y: 100 } });
        enemies = [];
        highScore = Math.max(highScore, score);
        score = 0;
        gameInit();
    }

    gameInit();
});
