const DEFAULT_HEALTH = 100;
const DEFAULT_SCORE = 0;
const TEXT_COLOUR = "white";
const SHADOW_COLOUR = "black";
const FONT = "30px Impact";
const SHADOW_OFFSET = 2;

const ELEMENTS = [
    {
        label: "Health",
        position: {
            x: 10,
            y: 30
        },
    },
    {
        label: "High score",
        position: {
            x: 300,
            y: 30
        },
    },
    {
        label: "Score",
        position: {
            x: 175,
            y: 30
        },
    }
]

/**
 * Draws shadow for UI elements
 *
 * @param CanvasRenderingContext2D - 2D Canvas
 * @param string - Element label
 * @param number - Element value
 * @param Object - X and Y coordinates for element
 * @return null
 */
const drawTextShadow = (ctx, label, value, position) => {
    ctx.fillStyle = SHADOW_COLOUR;
    ctx.font = FONT;
    ctx.fillText(`${label} ${value}`, position.x - SHADOW_OFFSET, position.y - SHADOW_OFFSET);
}

/**
 * Draws text for UI elements
 *
 * @param CanvasRenderingContext2D - 2D Canvas
 * @param string - Element label
 * @param number - Element value
 * @param Object - X and Y coordinates for element
 * @return null
 */
const drawText = (ctx, label, value, position) => {
    ctx.fillStyle = TEXT_COLOUR;
    ctx.font = FONT;
    ctx.fillText(`${label} ${value}`, position.x, position.y);
}

/**
 * Draws and updates UI elements
 *
 * @param CanvasRenderingContext2D - 2D Canvas
 * @param number - Player health
 * @param number - Highscore
 * @param number - Current game score
 * @return null
 */
const showUIElements = (ctx, health, highScore, score) => {
    const values = [
        health,
        highScore,
        score
    ]
    ELEMENTS.forEach((element, i) => {
        drawTextShadow(ctx, element.label, values[i], element.position)
        drawText(ctx, element.label, values[i], element.position)
    })
}

/**
 * Draws and updates UI elements
 *
 * @param CanvasRenderingContext2D - 2D Canvas
 * @param number - Player health
 * @param number - Highscore
 * @param number - Current game score
 * @return null
 */
export const updateUI = (ctx, health, highScore, score) => {
    showUIElements(ctx, health, highScore, score)
}

/**
 * Resets UI values to defaults
 *
 * @param CanvasRenderingContext2D - 2D Canvas
 * @return null
 */
export const resetUI = (ctx) => {
    showUIElements(ctx, DEFAULT_HEALTH, DEFAULT_SCORE, DEFAULT_SCORE)
}