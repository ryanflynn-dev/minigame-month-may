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
import { dropRandomItem, updateItems, drawItems } from "./core/items.js";
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

    setTimeout(() => {
        loader.style.display = "none";
        titleScreen.style.display = "flex";
    }, 3000);

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
                width: 20,
                height: 20,
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
                width: 20,
                height: 20,
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
                width: 20,
                height: 20,
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
                width: 20,
                height: 20,
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
                width: 20,
                height: 20,
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
        if (keys.shift) {
            const nextPhaseIndex =
                (phases.indexOf(player.phase) + 1) % phases.length;
            player.phaseShift(phases[nextPhaseIndex]);
        }
    }

    // GAME LOOP

    function debug() {
        const debug = console.log;
    }

    function updateEntities(deltatime) {
        enemies.forEach((enemy) => {
            enemy.update(deltatime);
        });
        player.update(deltatime);
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
        player = new Player({ name: "player", position: { x: 100, y: 100 } });
        enemies = [];
        highScore = Math.max(highScore, score);
        score = 0;
        resetScreenShake();
        gameInit();
    }
});
