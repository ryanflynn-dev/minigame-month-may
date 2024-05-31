import { Character } from "./character.js";
import { getVectorDistance, normaliseVector, offsetVector } from "../utils.js";
import { createExplosion } from "../effects/particles.js";
import { playSound } from "../sound.js";

/**
 * Player character.
 *
 * @extends {Character}
 * @param {Object} - Player options.
 * @param {string} - Player name.
 * @param {Object} - Player position.
 * @param {string} - Player phase.
 * @param {Array} - Array of enemies.
 * @returns {Player}
 *
 */
export class Player extends Character {
    constructor({ name, position, phase, enemies, img }) {
        super({
            name: name,
            health: 100,
            position: position,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            deceleration: 0.95,
            speed: 5,
            width: 40,
            height: 40,
            color: "white",
            damage: 10,
            damagePlus: 10,
            img: img,
        });
        this.phase = phase;
        this.phaseCooldown = 1;
        this.lastPhaseShift = 0;
        this.bullets = [];
        this.enemies = enemies;
        this.angle = 0;
    }

    update(deltatime, mouseMovePos) {
        super.update(deltatime);
        const direction = offsetVector(mouseMovePos, {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        });
        const normalisedVector = normaliseVector(direction);

        this.angle = Math.atan2(normalisedVector.y, normalisedVector.x);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }

    bulletUpdate(deltatime, ctx) {
        for (let i = 0; i < this.bullets.length; i++) {
            const bulletDamage = Math.random() * this.damage + this.damagePlus;
            const bullet = this.bullets[i];
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(
                bullet.position.x + bullet.width / 2,
                bullet.position.y + bullet.height / 2,
                bullet.width / 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.closePath();

            bullet.position.x += bullet.velocity.x * bullet.speed * deltatime;
            bullet.position.y += bullet.velocity.y * bullet.speed * deltatime;
            bullet.lifespan -= 1 * deltatime;
            switch (bullet.phase) {
                case "normal":
                    bullet.color = "white";
                    break;
                case "water":
                    bullet.color = "blue";
                    break;
                case "earth":
                    bullet.color = "green";
                    break;
                case "fire":
                    bullet.color = "red";
                    break;
                case "air":
                    bullet.color = "yellow";
                    break;
            }
            if (bullet.lifespan < 0) {
                this.removeBullet(i);
            }
            if (this.enemies) {
                const enemies = this.enemies;
                for (let j = 0; j < enemies.length; j++) {
                    const enemy = enemies[j];
                    const distance = getVectorDistance(
                        {
                            x: bullet.position.x + bullet.width / 2,
                            y: bullet.position.y + bullet.height / 2,
                        },
                        {
                            x: enemy.position.x + enemy.width / 2,
                            y: enemy.position.y + enemy.height / 2,
                        }
                    );
                    if (distance <= bullet.width / 2 + enemy.width / 2) {
                        enemy.takeDamage(bulletDamage, bullet.phase);
                        this.removeBullet(i);
                    }
                }
            }
        }
    }
    shoot(mousePosition) {
        playSound("shoot");
        createExplosion(this.position, 1, this.color);
        const direction = offsetVector(mousePosition, {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        });
        const normalisedVector = normaliseVector(direction);

        const bullet = {
            name: "bullet",
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height / 2,
            },
            velocity: {
                x: normalisedVector.x * 10,
                y: normalisedVector.y * 10,
            },
            acceleration: { x: 0, y: 0 },
            color: "white",
            width: 5,
            height: 5,
            lifespan: 1,
            speed: 50,
            phase: this.phase,
        };
        this.bullets.push(bullet);
    }

    removeBullet(index) {
        this.bullets.splice(index, 1);
    }

    phaseShift(phase) {
        const currentTime = Date.now() / 1000;
        if (currentTime - this.lastPhaseShift >= this.phaseCooldown) {
            if (this.phase !== phase) {
                this.phase = phase;
                this.lastPhaseShift = currentTime;
            }
        }
    }
}
