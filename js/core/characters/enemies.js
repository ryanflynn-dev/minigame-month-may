import { Character } from "./character.js";
import { getVectorDistance, normaliseVector, offsetVector } from "..utils.js";
import { createExplosion } from "../effects/particles.js";
import { playSound } from "../sound.js";
import { player } from "../game.js";
import { ctx } from "../canvas.js";
import { startScreenShake } from "../effects/screenshake.js";

export class Enemy extends Character {
    constructor({
        name,
        health,
        position,
        speed,
        width,
        height,
        color,
        phase,
    }) {
        super({
            name: name,
            health: health,
            position: position,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            deceleration: 0.95,
            speed: speed,
            width: width,
            height: height,
            color: color,
            damage: 0.1,
            damagePlus: 0.4,
        });
        this.phase = phase;
        this.dropChance = 0.5;
    }
    update(deltatime) {
        super.update(deltatime);
        if (getVectorDistance(this.position, player.position) < 50) {
            const hitDamage = Math.random() * this.damage + this.damagePlus;
            this.attack();
            player.takeDamage(hitDamage, this.phase);
            startScreenShake(0.5, 4);
        }

        if (getVectorDistance(this.position, player.position) < 300) {
            this.moveToPlayer();
        }

        if (this.health <= 0) {
            this.handleDeath();
        }
    }
    attack() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
        ctx.lineTo(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );
        ctx.stroke();
    }
    moveToPlayer() {
        const directionVector = offsetVector(player.position, this.position);
        const normalisedVector = normaliseVector(directionVector);

        this.velocity.x = normalisedVector.x * this.speed;
        this.velocity.y = normalisedVector.y * this.speed;
    }
    handleDeath() {
        playSound("death");
        createExplosion(this.position);
        const index = enemies.indexOf(this);
        if (index > -1) {
            enemies.splice(index, 1);
            score += 1;
            checkIfWaveComplete();

            if (Math.random() < this.dropChance) {
                dropRandomItem(this.position);
            }
        }
    }
}

export class RangedEnemy extends Character {
    constructor({
        name,
        health,
        position,
        speed,
        width,
        height,
        color,
        phase,
    }) {
        super({
            name: name,
            health: health,
            position: position,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            deceleration: 0.95,
            speed: speed,
            width: width,
            height: height,
            color: color,
            damage: 0.1,
            damagePlus: 0.4,
        });
        this.phase = phase;
        this.dropChance = 0.5;
        this.projectiles = [];
        this.interval = 3;
        this.shootTimer = 0;
    }
    update(deltatime) {
        super.update(deltatime);
        this.projectileUpdate(deltatime);
        this.shootTimer += deltatime;

        if (getVectorDistance(this.position, player.position) < 300) {
            this.shoot();
        }

        if (this.health <= 0) {
            this.handleDeath();
        }
    }
    projectileUpdate(deltatime) {
        for (let i = 0; i < this.projectiles.length; i++) {
            const projectileDamage =
                Math.random() * this.damage + this.damagePlus;
            const projectile = this.projectiles[i];
            ctx.fillStyle = projectile.color;
            ctx.beginPath();
            ctx.arc(
                projectile.position.x + projectile.width / 2,
                projectile.position.y + projectile.height / 2,
                projectile.width / 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.closePath();
            projectile.position.x +=
                projectile.velocity.x * projectile.speed * deltatime;
            projectile.position.y +=
                projectile.velocity.y * projectile.speed * deltatime;
            projectile.lifespan -= 1 * deltatime;
            if (projectile.lifespan < 0) {
                this.explode(i);
            }
            if (getVectorDistance(projectile.position, player.position) < 30) {
                player.takeDamage(projectileDamage, projectile.phase);
                startScreenShake(0.5, 4);
                projectile.lifespan = 0;
            }
        }
    }
    shoot() {
        const direction = offsetVector(
            { x: player.position.x, y: player.position.y },
            {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height / 2,
            }
        );
        const normalisedVector = normaliseVector(direction);
        if (this.shootTimer >= this.interval) {
            const projectile = {
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height / 2,
                },
                velocity: {
                    x: normalisedVector.x * 10,
                    y: normalisedVector.y * 10,
                },
                acceleration: { x: 0, y: 0 },
                color: this.color,
                width: 5,
                height: 5,
                lifespan: 2,
                speed: 20,
                phase: this.phase,
            };
            this.projectiles.push(projectile);
            this.shootTimer = 0;
        }
    }
    explode(index) {
        playSound("explosion");
        startScreenShake(0.5, 1);
        this.projectiles.splice(index, 1);
    }
    moveToPlayer() {
        const directionVector = offsetVector(player.position, this.position);
        const normalisedVector = normaliseVector(directionVector);

        this.velocity.x = normalisedVector.x * this.speed;
        this.velocity.y = normalisedVector.y * this.speed;
    }
    handleDeath() {
        playSound("death");
        createExplosion(this.position);
        const index = enemies.indexOf(this);
        if (index > -1) {
            enemies.splice(index, 1);
            score += 1;
            checkIfWaveComplete();

            if (Math.random() < this.dropChance) {
                dropRandomItem(this.position);
            }
        }
    }
}

export class HealerEnemy extends Character {
    constructor({
        name,
        health,
        position,
        speed,
        width,
        height,
        color,
        phase,
    }) {
        super({
            name: name,
            health: health,
            position: position,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            deceleration: 0.95,
            speed: speed,
            width: width,
            height: height,
            color: color,
        });
        this.phase = phase;
        this.dropChance = 0.5;
        this.healAmount = 5;
        this.healingCooldown = 1000;
        this.lastHealTime = Date.now();
        this.healRange = 200;
    }
    update(deltatime) {
        super.update(deltatime);
        const currentTime = Date.now();

        if (currentTime - this.lastHealTime > this.healingCooldown) {
            enemies.forEach((enemy) => {
                if (
                    enemy !== this &&
                    getVectorDistance(enemy.position, this.position) <
                        this.healRange &&
                    enemy.phase === this.phase &&
                    enemy.health < 100
                ) {
                    console.log("healing" + enemy.health);
                    this.healEnemy(enemy);
                    console.log("healing" + enemy.health);

                    this.lastHealTime = currentTime;
                }
            });
        }

        if (this.health <= 0) {
            this.handleDeath();
        }
    }
    healEnemy(enemy) {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
        ctx.lineTo(
            enemy.position.x + enemy.width / 2,
            enemy.position.y + enemy.height / 2
        );
        ctx.stroke();

        enemy.health += this.healAmount;
        enemy.health = Math.min(enemy.health, 100);
    }

    handleDeath() {
        playSound("healerDeath");
        createExplosion(this.position);
        const index = enemies.indexOf(this);
        if (index > -1) {
            enemies.splice(index, 1);
            score += 1;
            checkIfWaveComplete();
        }
    }
}

export class Boss extends Enemy {
    constructor({
        name,
        health,
        position,
        speed,
        width,
        height,
        color,
        specialAttack,
        damage,
        attackInterval,
        phase,
    }) {
        super({
            name: name,
            health: health,
            position: position,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            deceleration: 0.95,
            speed: speed,
            width: width,
            height: height,
            color: color,
            damage: damage,
            damagePlus: damage * 2,
        });
        this.phase = phase;
        this.interval = attackInterval;
        this.specialAttackType = specialAttack;
        this.projectiles = [];
        this.specialAttackInterval(this.interval);
    }

    update(deltatime) {
        super.update(deltatime);
        this.projectileUpdate(deltatime);

        if (this.health <= 0) {
            const index = enemies.indexOf(this);
            enemies.splice(index, 1);
            score += 10;
            checkIfLevelComplete();
        }
        if (getVectorDistance(this.position, player.position) < 300) {
            this.moveToPlayer();
        }
    }

    projectileUpdate(deltatime) {
        for (let i = 0; i < this.projectiles.length; i++) {
            const projectileDamage =
                Math.random() * this.damage + this.damagePlus;
            const projectile = this.projectiles[i];
            ctx.fillStyle = projectile.color;
            ctx.beginPath();
            ctx.arc(
                projectile.position.x + projectile.width / 2,
                projectile.position.y + projectile.height / 2,
                projectile.width / 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.closePath();
            projectile.position.x +=
                projectile.velocity.x * projectile.speed * deltatime;
            projectile.position.y +=
                projectile.velocity.y * projectile.speed * deltatime;
            projectile.lifespan -= 1 * deltatime;
            if (projectile.lifespan < 0) {
                this.explode(i);
            }
            if (getVectorDistance(projectile.position, player.position) < 30) {
                player.takeDamage(projectileDamage, projectile.phase);
                startScreenShake(0.5, 4);
            }
        }
    }

    explode(index) {
        playSound("explosion");
        startScreenShake(0.5, 4);
        this.projectiles.splice(index, 1);
    }

    specialAttackInterval(interval) {
        const randomInterval = Math.random() * interval + 1000;
        setTimeout(() => {
            this.specialAttack();
            this.specialAttackInterval(interval);
        }, randomInterval);
    }

    specialAttack() {
        const direction = offsetVector(
            { x: player.position.x, y: player.position.y },
            {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height / 2,
            }
        );
        const normalisedVector = normaliseVector(direction);
        if (this.specialAttackType === "fireball") {
            const projectile = {
                name: "fireball",
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height / 2,
                },
                velocity: {
                    x: normalisedVector.x * 10,
                    y: normalisedVector.y * 10,
                },
                acceleration: { x: 0, y: 0 },
                color: "red",
                width: 30,
                height: 30,
                lifespan: 10,
                speed: 5,
                phase: "fire",
            };
            this.projectiles.push(projectile);
        }
    }
}
