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
        this.width = 20;
        this.height = 20;
        this.color = "black";
        this.isCollected = false;
    }

    /**
     * Draw the item on the canvas.
     * @param {CanvasRenderingContext2D} - 2D canvas context.
     */
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2,
            this.width / 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
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
