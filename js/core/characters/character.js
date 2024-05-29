export class Character {
    constructor({
        name,
        health,
        position,
        velocity,
        acceleration,
        deceleration,
        speed,
        width,
        height,
        color,
        damage,
        damagePlus,
    }) {
        this.name = name;
        this.health = health;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.deceleration = deceleration;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.color = color;
        this.damage = damage;
        this.damagePlus = damagePlus;
        this.phase = "normal";
    }
    update(deltatime) {
        this.checkBoundaries();

        this.velocity.x += this.acceleration.x * this.speed;
        this.velocity.y += this.acceleration.y * this.speed;

        this.velocity.x *= this.deceleration;
        this.velocity.y *= this.deceleration;

        this.position.x += this.velocity.x * deltatime;
        this.position.y += this.velocity.y * deltatime;

        switch (this.phase) {
            case "normal":
                this.color = "white";
                break;
            case "water":
                this.color = "blue";
                break;
            case "earth":
                this.color = "green";
                break;
            case "fire":
                this.color = "red";
                break;
            case "air":
                this.color = "yellow";
                break;
        }
    }

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
    checkBoundaries() {
        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > canvas.width) {
            this.position.x = canvas.width - this.width;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
        } else if (this.position.y + this.height > canvas.height) {
            this.position.y = canvas.height - this.height;
        }
    }
    takeDamage(damage, phase) {
        if (this.isImmuneTo(phase)) {
            return;
        } else {
            this.health -= damage;
        }
    }
    getHealth() {
        return this.health;
    }
    getRoundedHealth() {
        return Math.floor(this.getHealth());
    }
    phaseShift(phase) {
        if (this.phase !== phase) {
            this.phase = phase;
        }
    }
    isImmuneTo(phase) {
        return this.phase === phase;
    }
}
