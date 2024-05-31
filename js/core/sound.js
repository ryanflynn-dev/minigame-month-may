/**
 *  Load a sound.
 *
 * @param {string} - sound src.
 * @returns {Audio}
 */
const loadSound = (src) => {
    const path = "../sound/" + src;
    const sound = new Audio();
    sound.src = src;
    return sound;
};

/**
 * Play given sound.
 *
 * @param {string} - sound name.
 * @returns {Audio}
 */
export const playSound = (name) => {
    if (!sounds[name]) return;
    sounds[name].currentTime = 0;
    sounds[name].play();
};

/**
 * Loop given sound.
 *
 * @param {string} - sound name.
 * @returns {Audio}
 */
export const loopingSound = (name) => {
    if (!sounds[name]) return;
    sounds[name].currentTime = 0;
    sounds[name].loop = true;
    sounds[name].play();
};

/**
 * Stop given sound.
 *
 * @param {string} - sound name.
 * @returns {Audio}
 */
export const stopSound = (name) => {
    sounds[name].pause();
};

/**
 * Load all sounds.
 *
 * @returns {Object} - sounds object.
 */
const sounds = {
    shoot: loadSound("js/assets/sound/fx/shoot.wav"),
    death: loadSound("js/assets/sound/fx/death.wav"),
    explosion: loadSound("js/assets/sound/fx/explosion.wav"),
    playerDeath: loadSound("js/assets/sound/fx/playerDeath.wav"),
    backgroundSong: loadSound("js/assets/sound/music/backgroundSong.wav"),
};
