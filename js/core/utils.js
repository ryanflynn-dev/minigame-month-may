/**
 * Calculates the offset vector between two points.
 * @param {Object} - a x and y.
 * @param {Object} - b x and y.
 * @returns {Object} offset vector with properties x and y.
 */
export const offsetVector = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });

/**
 * Calculates the length of a vector.
 * @param {Object} - a x and y.
 * @returns {number} length of the vector.
 */
export const getVectorLength = (a) => Math.sqrt(a.x ** 2 + a.y ** 2);

/**
 * Calculates the distance between two points.
 * @param {Object} - a x and y.
 * @param {Object} - b x and y.
 * @returns {number} distance between the two points.
 */
export const getVectorDistance = (a, b) => getVectorLength(offsetVector(a, b));

/**
 * Normalizes a vector, scaling it to a unit vector.
 * @param {Object} - v x and y.
 * @returns {Object} normalized vector x and y.
 */
export const normaliseVector = (v) => {
    const length = getVectorLength(v);
    return { x: v.x / length, y: v.y / length };
};

/**
 * Gets the mouse position relative to the canvas, accounting for camera position.
 * @param {HTMLCanvasElement} - canvas element.
 * @param {MouseEvent} - mouse event.
 * @param {Object} - camera object with property position containing x and y.
 * @returns {Object} mouse position x and y.
 */
export const getMousePos = (canvas, e, camera) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left + camera.position.x,
        y: e.clientY - rect.top + camera.position.y,
    };
};

/**
 * Returns a random integer between min (inclusive) and max (exclusive).
 * @param {number} - min
 * @param {number} - max
 * @returns {number}
 */
export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
};
