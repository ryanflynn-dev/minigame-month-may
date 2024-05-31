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
    const levelWidth = getRandomInt(1280, 2560);
    const levelHeight = getRandomInt(720, 1080);
    const bossSize = getRandomInt(60, 200);
    const boss = {
        name: `Boss${id}`,
        health: getRandomInt(500, 1000),
        position: { x: levelWidth / 2, y: levelHeight / 2 },
        speed: getRandomInt(0.5, 40),
        width: bossSize,
        height: bossSize,
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
        levelWidth,
        levelHeight,
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
