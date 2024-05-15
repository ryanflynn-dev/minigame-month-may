/**
 * Duration of the screen shake effect.
 * @type {number}
 */
let shakeDuration = 0;

/**
 * Magnitude of the screen shake effect.
 * @type {number}
 */
let shakeMagnitude = 0;

/**
 * Timer for the screen shake effect.
 * @type {number}
 */
let shakeTimer = 0;

/**
 * Starts the screen shake effect.
 *
 * @param number - Duration.
 * @param number - Magnitude.
 * @return null
 */
export const startScreenShake = (duration, magnitude) => {
    shakeDuration = duration;
    shakeMagnitude = magnitude;
    shakeTimer = duration;
};

/**
 * Updates the screen shake effect.
 *
 * @param Object- Camera position.
 * @param Object - Player position.
 * @param number - World width.
 * @param number - World height.
 * @param HTMLCanvasElement - Canvas element.
 * @param number - Time since last update.
 * @return null
 */
export const updateScreenShake = (
    cameraPos,
    playerPos,
    worldWidth,
    worldHeight,
    canvas,
    deltaTime
) => {
    if (shakeTimer > 0) {
        shakeTimer -= deltaTime;
        const shakeAmount = shakeMagnitude * (shakeTimer / shakeDuration);
        const offsetX = (Math.random() * 2 - 1) * shakeAmount;
        const offsetY = (Math.random() * 2 - 1) * shakeAmount;
        cameraPos.x += offsetX;
        cameraPos.y += offsetY;
    } else {
        shakeTimer = 0;
        cameraPos.x = Math.max(
            0,
            Math.min(playerPos.x - canvas.width / 2, worldWidth - canvas.width)
        );
        cameraPos.y = Math.max(
            0,
            Math.min(
                playerPos.y - canvas.height / 2,
                worldHeight - canvas.height
            )
        );
    }
};

/**
 * Resets the screen shake effect to defaults.
 *
 * @return null
 */
export const resetScreenShake = () => {
    shakeDuration = 0;
    shakeMagnitude = 0;
    shakeTimer = 0;
};
