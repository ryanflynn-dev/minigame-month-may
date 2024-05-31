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
    shoot: loadSound("/sound/fx/shoot.wav"),
    death: loadSound("/sound/fx/death.wav"),
    explosion: loadSound("/sound/fx/explosion.wav"),
    playerDeath: loadSound("/sound/fx/playerDeath.wav"),
    backgroundSong: loadSound("/sound/music/backgroundSong.wav"),
};
