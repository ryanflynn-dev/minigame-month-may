import { getRandomInt } from "../core/utils.js";

const BOSSSPECIALS = [
    "fireball",
    "iceshard",
    "lightningstrike",
    "poisonblob",
    "earthquake",
    "windstorm",
];

/**
 * Generates a random level.
 *
 * @param {number} - id.
 * @returns {Object} - level object.
 */
const generateRandomLevel = (id) => {
    const numWaves = getRandomInt(2, 4);
    const waves = [];
    for (let i = 0; i < numWaves; i++) {
        const numEnemies = getRandomInt(10, 30);
        const waveTime = getRandomInt(10000, 30000);
        const breakTime = getRandomInt(5000, 10000);
        waves.push({ numEnemies, waveTime, breakTime });
    }
    const boss = {
        name: `Boss${id}`,
        health: getRandomInt(500, 10000),
        position: { x: 640, y: 360 },
        speed: getRandomInt(0.5, 40),
        width: getRandomInt(30, 100),
        height: getRandomInt(30, 100),
        color: `rgb(${getRandomInt(0, 255)}, ${getRandomInt(
            0,
            255
        )}, ${getRandomInt(0, 255)})`,
        specialAttack: BOSSSPECIALS[getRandomInt(0, 5)],
        damage: getRandomInt(1, 6),
        attackInterval: getRandomInt(500, 2000),
    };

    return {
        id,
        waves,
        boss,
        levelWidth: getRandomInt(1280, 2560),
        levelHeight: getRandomInt(720, 1080),
    };
};

/**
 * Generates an array of levels.
 *
 * @param {number} - number of levels.
 * @returns {Array} - array of levels.
 */
export const generateLevels = (numLevels) => {
    const levels = [];
    for (let i = 1; i <= numLevels; i++) {
        levels.push(generateRandomLevel(i));
    }
    return levels;
};