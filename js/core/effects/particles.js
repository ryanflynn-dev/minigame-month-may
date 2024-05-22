class Particle {
    constructor({ position, velocity, acceleration, lifespan, color }) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.lifespan = lifespan;
        this.color = color;
        this.width = 5;
        this.height = 5;
        this.speed = 4;
    }

    update(deltatime) {
        this.velocity.x += this.acceleration.x * this.speed;
        this.velocity.y += this.acceleration.y * this.speed;

        this.position.x += this.velocity.x * deltatime;
        this.position.y += this.velocity.y * deltatime;

        this.lifespan -= 1 * deltatime;
        this.width -= 3 * deltatime;
        this.height -= 3 * deltatime;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2,
            this.width / 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
        ctx.closePath();
    }
}

const particles = [];

export const createExplosion = (position, amount = 50, color = "white") => {
    for (let i = 0; i < amount; i++) {
        const particle = new Particle({
            position: {
                x: position.x,
                y: position.y,
            },
            velocity: {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
            },
            acceleration: {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5,
            },
            lifespan: 0.5,
            color: color,
        });
        particles.push(particle);
    }
};

export const updateParticles = (deltatime) => {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(deltatime);
        if (particles[i].lifespan < 0) {
            particles.splice(i, 1);
        }
    }
};

export const drawParticles = (ctx) => {
    for (let i = 0; i < particles.length; i++) {
        particles[i].draw(ctx);
    }
};
