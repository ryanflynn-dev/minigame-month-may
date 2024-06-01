import { initControls, getControls } from "./core/control.js";
import { updateUI, resetUI } from "./core/ui.js";
import {
    startScreenShake,
    updateScreenShake,
    resetScreenShake,
} from "./core/effects/screenshake.js";
import {
    offsetVector,
    normaliseVector,
    getVectorDistance,
    getMousePos,
} from "./core/utils.js";
import {
    dropRandomItem,
    updateItems,
    drawItems,
    resetItems,
} from "./core/items.js";
import { generateLevels } from "./core/levels.js";
import { loopingSound, playSound, stopSound } from "./core/sound.js";
import {
    createExplosion,
    updateParticles,
    drawParticles,
} from "./core/effects/particles.js";
import { Character } from "./core/characters/character.js";
import { Player } from "./core/characters/player.js";

document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById("loader");
    const titleScreen = document.getElementById("title-screen");
    const startButton = document.getElementById("start-game");
    const app = document.getElementById("app");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const storyContainer = document.getElementById("story-container");
    const storyText = document.getElementById("story-text");
    const storyImage = document.getElementById("story-image");
    const nextButton = document.getElementById("story-button");
    const showHowToPlayButton = document.getElementById("show-how-to-play");
    const howToPlaySection = document.getElementById("how-to-play");
    const showCreditsButton = document.getElementById("show-credits");
    const creditsSection = document.getElementById("credits");

    const storyData = [
        {
            text: "In a mystical realm, there lived a powerful wizard named Alaric. He was known for his wisdom and mastery over the elements.",
            image: "js/assets/art/wizard.png",
        },
        {
            text: "One day, a strange celestial event occurred. A portal opened in the sky, revealing a fleet of alien ships threatening their world.",
            image: "js/assets/art/portal.png",
        },
        {
            text: "To defend his realm, Alaric used his magic to create a spaceship, merging ancient sorcery with advanced technology.",
            image: "js/assets/art/spaceship.png",
        },
        {
            text: "With his new spaceship, Alaric set off to battle the alien invaders, determined to protect his world from this new threat.",
            image: "js/assets/art/space_battle.png",
        },
    ];

    let currentStep = 0;

    function showStoryStep(step) {
        if (step < storyData.length) {
            storyText.innerHTML = storyData[step].text;
            storyImage.src = storyData[step].image;
        } else {
            storyContainer.style.display = "none";
            titleScreen.style.display = "flex";
            loader.style.display = "none";
        }
    }

    nextButton.addEventListener("click", () => {
        currentStep++;
        showStoryStep(currentStep);
    });

    loader.style.display = "flex";

    setTimeout(() => {
        loader.style.display = "none";
        storyContainer.style.display = "block";
        showStoryStep(currentStep);
    }, 3000);

    showHowToPlayButton.addEventListener("click", () => {
        if (howToPlaySection.style.display === "none")
            howToPlaySection.style.display = "block";
        else howToPlaySection.style.display = "none";
    });

    showCreditsButton.addEventListener("click", () => {
        if (creditsSection.style.display === "none")
            creditsSection.style.display = "block";
        else creditsSection.style.display = "none";
    });

    startButton.addEventListener("click", () => {
        titleScreen.style.display = "none";
        app.style.display = "flex";
        gameInit();
    });

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

    let player = null;
    let enemies = [];
    let phases = ["normal", "fire", "water", "earth", "air"];
    let bossImg = new Image();
    bossImg.src = "js/assets/art/boss.png";

    class Enemy extends Character {
        constructor({
            name,
            health,
            position,
            speed,
            width,
            height,
            color,
            phase,
        }) {
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
            this.phase = phase;
            this.dropChance = 0.5;
            this.img = new Image();
            this.img.src = `js/assets/art/enemy-${this.phase}.png`;
            this.angle = 0;
        }
        update(deltatime) {
            super.update(deltatime);
            if (getVectorDistance(this.position, player.position) < 50) {
                const hitDamage = Math.random() * this.damage + this.damagePlus;
                this.attack();
                player.takeDamage(hitDamage, this.phase);
                startScreenShake(0.5, 4);
            }

            if (getVectorDistance(this.position, player.position) < 300) {
                this.moveToPlayer();
            }

            if (this.health <= 0) {
                this.handleDeath();
            }

            this.angle = Math.atan2(
                player.position.y - this.position.y,
                player.position.x - this.position.x
            );
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(
                this.position.x + this.width / 2,
                this.position.y + this.height / 2
            );
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.drawImage(
                this.img,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.restore();
        }
        attack() {
            ctx.strokeStyle = this.color;
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
        handleDeath() {
            playSound("death");
            createExplosion(this.position);
            const index = enemies.indexOf(this);
            if (index > -1) {
                enemies.splice(index, 1);
                score += 1;
                checkIfWaveComplete();

                if (Math.random() < this.dropChance) {
                    dropRandomItem(this.position);
                }
            }
        }
    }

    class RangedEnemy extends Character {
        constructor({
            name,
            health,
            position,
            speed,
            width,
            height,
            color,
            phase,
        }) {
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
            this.phase = phase;
            this.dropChance = 0.5;
            this.projectiles = [];
            this.interval = 3;
            this.shootTimer = 0;
            this.img = new Image();
            this.img.src = `js/assets/art/Renemy-${this.phase}.png`;
            this.angle = 0;
        }
        update(deltatime) {
            super.update(deltatime);
            this.projectileUpdate(deltatime);
            this.shootTimer += deltatime;

            if (getVectorDistance(this.position, player.position) < 300) {
                this.shoot();
            }

            if (this.health <= 0) {
                this.handleDeath();
            }

            this.angle = Math.atan2(
                player.position.y - this.position.y,
                player.position.x - this.position.x
            );
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(
                this.position.x + this.width / 2,
                this.position.y + this.height / 2
            );
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.drawImage(
                this.img,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.restore();
        }
        projectileUpdate(deltatime) {
            for (let i = 0; i < this.projectiles.length; i++) {
                const projectileDamage =
                    Math.random() * this.damage + this.damagePlus;
                const projectile = this.projectiles[i];
                ctx.fillStyle = projectile.color;
                ctx.beginPath();
                ctx.arc(
                    projectile.position.x + projectile.width / 2,
                    projectile.position.y + projectile.height / 2,
                    projectile.width / 2,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
                ctx.closePath();
                projectile.position.x +=
                    projectile.velocity.x * projectile.speed * deltatime;
                projectile.position.y +=
                    projectile.velocity.y * projectile.speed * deltatime;
                projectile.lifespan -= 1 * deltatime;
                if (projectile.lifespan < 0) {
                    this.explode(i);
                }
                if (
                    getVectorDistance(projectile.position, player.position) < 30
                ) {
                    player.takeDamage(projectileDamage, projectile.phase);
                    startScreenShake(0.5, 4);
                    projectile.lifespan = 0;
                }
            }
        }
        shoot() {
            const direction = offsetVector(
                { x: player.position.x, y: player.position.y },
                {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height / 2,
                }
            );
            const normalisedVector = normaliseVector(direction);
            if (this.shootTimer >= this.interval) {
                const projectile = {
                    position: {
                        x: this.position.x + this.width / 2,
                        y: this.position.y + this.height / 2,
                    },
                    velocity: {
                        x: normalisedVector.x * 10,
                        y: normalisedVector.y * 10,
                    },
                    acceleration: { x: 0, y: 0 },
                    color: this.color,
                    width: 5,
                    height: 5,
                    lifespan: 2,
                    speed: 20,
                    phase: this.phase,
                };
                this.projectiles.push(projectile);
                this.shootTimer = 0;
            }
        }
        explode(index) {
            playSound("explosion");
            startScreenShake(0.5, 1);
            this.projectiles.splice(index, 1);
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
        handleDeath() {
            playSound("death");
            createExplosion(this.position);
            const index = enemies.indexOf(this);
            if (index > -1) {
                enemies.splice(index, 1);
                score += 1;
                checkIfWaveComplete();

                if (Math.random() < this.dropChance) {
                    dropRandomItem(this.position);
                }
            }
        }
    }

    class HealerEnemy extends Character {
        constructor({
            name,
            health,
            position,
            speed,
            width,
            height,
            color,
            phase,
        }) {
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
            this.phase = phase;
            this.dropChance = 0.5;
            this.healAmount = 5;
            this.healingCooldown = 1000;
            this.lastHealTime = Date.now();
            this.healRange = 200;
            this.img = new Image();
            this.img.src = `js/assets/art/Henemy-${this.phase}.png`;
            this.angle = 0;
        }
        update(deltatime) {
            super.update(deltatime);
            const currentTime = Date.now();

            if (currentTime - this.lastHealTime > this.healingCooldown) {
                enemies.forEach((enemy) => {
                    if (
                        enemy !== this &&
                        getVectorDistance(enemy.position, this.position) <
                            this.healRange &&
                        enemy.phase === this.phase &&
                        enemy.health < 100
                    ) {
                        this.healEnemy(enemy);
                        this.angle = Math.atan2(
                            enemy.position.y - this.position.y,
                            enemy.position.x - this.position.x
                        );

                        this.lastHealTime = currentTime;
                    }
                });
            }

            if (this.health <= 0) {
                this.handleDeath();
            }
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(
                this.position.x + this.width / 2,
                this.position.y + this.height / 2
            );
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.drawImage(
                this.img,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.restore();
        }
        healEnemy(enemy) {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(
                this.position.x + this.width / 2,
                this.position.y + this.height / 2
            );
            ctx.lineTo(
                enemy.position.x + enemy.width / 2,
                enemy.position.y + enemy.height / 2
            );
            ctx.stroke();

            enemy.health += this.healAmount;
            enemy.health = Math.min(enemy.health, 100);
        }

        handleDeath() {
            playSound("healerDeath");
            createExplosion(this.position);
            const index = enemies.indexOf(this);
            if (index > -1) {
                enemies.splice(index, 1);
                score += 1;
                checkIfWaveComplete();
            }
        }
    }
    class Boss extends Enemy {
        constructor({
            name,
            health,
            position,
            speed,
            width,
            height,
            color,
            specialAttack,
            damage,
            attackInterval,
            phase,
        }) {
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
                damage: damage,
                damagePlus: damage * 2,
                img: bossImg,
            });
            this.phase = phase;
            this.interval = attackInterval;
            this.specialAttackType = specialAttack;
            this.projectiles = [];
            this.specialAttackInterval(this.interval);
            this.angle = 0;
        }

        update(deltatime) {
            super.update(deltatime);
            this.projectileUpdate(deltatime);

            if (this.health <= 0) {
                const index = enemies.indexOf(this);
                enemies.splice(index, 1);
                score += 10;
                checkIfLevelComplete();
            }
            if (getVectorDistance(this.position, player.position) < 300) {
                this.moveToPlayer();
            }

            this.angle = Math.atan2(
                player.position.y - this.position.y,
                player.position.x - this.position.x
            );
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(
                this.position.x + this.width / 2,
                this.position.y + this.height / 2
            );
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.drawImage(
                this.img,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.restore();
        }

        projectileUpdate(deltatime) {
            for (let i = 0; i < this.projectiles.length; i++) {
                const projectileDamage =
                    Math.random() * this.damage + this.damagePlus;
                const projectile = this.projectiles[i];
                ctx.fillStyle = projectile.color;
                ctx.beginPath();
                ctx.arc(
                    projectile.position.x + projectile.width / 2,
                    projectile.position.y + projectile.height / 2,
                    projectile.width / 2,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
                ctx.closePath();
                projectile.position.x +=
                    projectile.velocity.x * projectile.speed * deltatime;
                projectile.position.y +=
                    projectile.velocity.y * projectile.speed * deltatime;
                projectile.lifespan -= 1 * deltatime;
                if (projectile.lifespan < 0) {
                    this.explode(i);
                }
                if (
                    getVectorDistance(projectile.position, player.position) < 30
                ) {
                    player.takeDamage(projectileDamage, projectile.phase);
                    startScreenShake(0.5, 4);
                }
            }
        }

        explode(index) {
            playSound("explosion");
            startScreenShake(0.5, 4);
            this.projectiles.splice(index, 1);
        }

        specialAttackInterval(interval) {
            const randomInterval = Math.random() * interval + 1000;
            setTimeout(() => {
                this.specialAttack();
                this.specialAttackInterval(interval);
            }, randomInterval);
        }

        specialAttack() {
            const direction = offsetVector(
                { x: player.position.x, y: player.position.y },
                {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height / 2,
                }
            );
            const normalisedVector = normaliseVector(direction);
            if (this.specialAttackType === "fireball") {
                const projectile = {
                    name: "fireball",
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
                    width: 30,
                    height: 30,
                    lifespan: 10,
                    speed: 5,
                    phase: "fire",
                };
                this.projectiles.push(projectile);
            }
        }
    }

    // ENEMY GENERATOR FUNCTIONS

    function randomEnemyGenerator() {
        const randomX = Math.random() * canvas.width;
        const randomY = Math.random() * canvas.height;
        const enemiesVariations = [
            new Enemy({
                name: "enemy",
                health: 100,
                position: { x: randomX, y: randomY },
                speed: Math.random() * 30 + 20,
                width: 40,
                height: 40,
                color: "white",
                phase: phases[
                    Math.floor(Math.random() * (phases.length - 1)) + 1
                ],
            }),
            new RangedEnemy({
                name: "rangedEnemy",
                health: 100,
                position: { x: randomX, y: randomY },
                speed: Math.random() * 30 + 20,
                width: 40,
                height: 40,
                color: "white",
                phase: phases[
                    Math.floor(Math.random() * (phases.length - 1)) + 1
                ],
            }),
            new Enemy({
                name: "enemy",
                health: 100,
                position: { x: randomX, y: randomY },
                speed: Math.random() * 30 + 20,
                width: 40,
                height: 40,
                color: "white",
                phase: phases[
                    Math.floor(Math.random() * (phases.length - 1)) + 1
                ],
            }),
            new RangedEnemy({
                name: "rangedEnemy",
                health: 100,
                position: { x: randomX, y: randomY },
                speed: Math.random() * 30 + 20,
                width: 40,
                height: 40,
                color: "white",
                phase: phases[
                    Math.floor(Math.random() * (phases.length - 1)) + 1
                ],
            }),
            new HealerEnemy({
                name: "healerEnemy",
                health: 100,
                position: { x: randomX, y: randomY },
                speed: Math.random() * 30 + 20,
                width: 40,
                height: 40,
                color: "white",
                phase: phases[
                    Math.floor(Math.random() * (phases.length - 1)) + 1
                ],
            }),
        ];
        const randomEnemy =
            enemiesVariations[
                Math.floor(Math.random() * enemiesVariations.length)
            ];
        enemies.push(randomEnemy);
    }

    function setEnemies(amount = 1, waveTime = 50000) {
        randomEnemyGenerator();
        amount--;

        for (let i = 0; i < amount; i++) {
            let spawnTime = Math.random() * waveTime;
            setTimeout(randomEnemyGenerator, spawnTime);
        }
    }

    // LEVELS

    let currentLevel = 1;
    let waveIndex = 0;
    const levels = generateLevels(10);

    function startNextWave(waves) {
        console.log("Starting wave");
        if (waveIndex < waves.length) {
            let wave = waves[waveIndex];
            setEnemies(wave.numEnemies, wave.waveTime);
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
            if (waveIndex >= levels[currentLevel - 1].waves.length) {
                spawnBoss();
            } else {
                setTimeout(
                    () => startNextWave(levels[currentLevel - 1].waves),
                    wave.breakTime
                );
            }
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
        if (enemies.length === 0) {
            if (currentLevel < levels.length) {
                loadLevel(currentLevel + 1);
            } else {
                loadLevel(1);
            }
        }
    }

    function spawnBoss() {
        const level = levels[currentLevel - 1];
        const bossConfig = level.boss;
        if (bossConfig) {
            const boss = new Boss(bossConfig);
            enemies.push(boss);
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

    const floorTile = new Image();
    floorTile.src = "js/assets/art/floor.png";

    function renderFloor(ctx, levelWidth, levelHeight, tileWidth, tileHeight) {
        for (let x = 0; x < levelWidth; x += tileWidth) {
            for (let y = 0; y < levelHeight; y += tileHeight) {
                ctx.drawImage(floorTile, x, y, tileWidth, tileHeight);
            }
        }
    }

    // CONTROLS

    function initMouseControls() {
        document.removeEventListener("click", handleMouseInput);
        document.addEventListener("click", handleMouseInput);

        document.removeEventListener("mousemove", handleMouseMove);
        document.addEventListener("mousemove", handleMouseMove);
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
        if (keys.shift) {
            const nextPhaseIndex =
                (phases.indexOf(player.phase) + 1) % phases.length;
            player.phaseShift(phases[nextPhaseIndex]);
        }
    }

    let mouseMovePos = { x: 0, y: 0 };

    function handleMouseMove(e) {
        if (!player) return;
        const mousePos = getMousePos(canvas, e, camera);
        mouseMovePos = mousePos;
    }

    // GAME LOOP

    function debug() {
        const debug = console.log;
    }

    function updateEntities(deltatime) {
        enemies.forEach((enemy) => {
            enemy.update(deltatime);
        });
        player.update(deltatime, mouseMovePos);
        updateParticles(deltatime);
        updateItems(player);
        player.bulletUpdate(deltatime, ctx);
    }

    function drawEntites(ctx) {
        enemies.forEach((enemy) => {
            enemy.draw(ctx);
        });
        player.draw(ctx);
        drawParticles(ctx);
        drawItems(ctx);
    }

    function updateGameElements() {
        updateUI(ctx, player.getRoundedHealth(), highScore, score);
        updateCamera();
        updateScreenShake(
            camera.position,
            player.position,
            worldWidth,
            worldHeight,
            canvas,
            deltatime
        );
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
        renderFloor(ctx, worldWidth, worldHeight, 64, 64);
        updateEntities(deltatime);
        drawEntites(ctx);
        debug();
        checkKeys();
        if (player.health <= 0) {
            playSound("playerDeath");
            resetGame();
        }
        ctx.restore();
        updateGameElements();
        animationFrameId = requestAnimationFrame(animate);
    }
    function gameInit() {
        player = new Player({
            name: "player",
            position: { x: 100, y: 100 },
            phase: phases[0],
            enemies: enemies,
        });
        loadLevel(1);
        resetUI(ctx);
        initControls();
        initMouseControls();
        animate(0);
        loopingSound("backgroundSong");
    }

    function resetGame() {
        stopSound("backgroundSong");
        cancelAnimationFrame(animationFrameId);
        player = new Player({
            name: "player",
            position: { x: 100, y: 100 },
            phase: phases[0],
            enemies: enemies,
        });
        enemies = [];
        highScore = Math.max(highScore, score);
        score = 0;
        resetScreenShake();
        resetItems();
        gameInit();
    }
});
