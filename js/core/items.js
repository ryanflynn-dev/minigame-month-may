import { getVectorDistance } from "./utils.js";

class Item {
    /**
     * Create an item.
     * @param {string} - type of the item.
     * @param {Object} - position x and y.
     */
    constructor({ type, position }) {
        this.type = type;
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.color = "black";
        this.isCollected = false;
        this.img = new Image();
        this.img.src = `js/assets/art/${this.type}.png`;
    }

    /**
     * Draw the item on the canvas.
     * @param {CanvasRenderingContext2D} - 2D canvas context.
     */
    draw(ctx) {
        ctx.drawImage(
            this.img,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    /**
     * Update the item's state.
     * @param {Object} - player object.
     */
    update(player) {
        if (!this.isCollected && this.collected(player)) {
            this.isCollected = true;
            this.applyEffect(player);
        } else if (this.isCollected) {
            const index = items.indexOf(this);
            items.splice(index, 1);
        }
    }

    /**
     * Check if the item has been collected by the player.
     * @param {Object} - player object.
     * @returns {boolean} - collected or not.
     */
    collected(player) {
        return getVectorDistance(this.position, player.position) < 30;
    }

    /**
     * Apply the item's effect to the player.
     * @param {Object} -player object.
     */
    applyEffect(player) {
        if (this.type === "health") {
            const amount = Math.random() * 5 + 7;
            player.health += amount;
            if (player.health >= 100) {
                player.health = 100;
            }
        }
    }
}

export let items = [];

/**
 * Drop a random item at the position.
 * @param {Object} - position x and y.
 */
export const dropRandomItem = (position) => {
    const types = ["health"];
    const type = types[Math.floor(Math.random() * types.length)];
    const item = new Item({
        type: type,
        position: position,
    });
    items.push(item);
};

/**
 * Update all items.
 * @param {Object} - player object.
 */
export const updateItems = (player) => {
    items.forEach((item) => {
        item.update(player);
    });
};

/**
 * Draw all items.
 * @param {CanvasRenderingContext2D} - 2D canvas context.
 */
export const drawItems = (ctx) => {
    items.forEach((item) => {
        item.draw(ctx);
    });
};

export const resetItems = () => {
    items = [];
};
