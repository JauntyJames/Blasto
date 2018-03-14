class Asteroid {
  constructor(segments, radius, noise) {
    this.x = context.canvas.width * Math.random();
    this.y = context.canvas.height * Math.random();
    this.angle = 0;
    this.xSpeed = context.canvas.width * (Math.random() - 0.5);
    this.ySpeed = context.canvas.height * (Math.random() - 0.5);
    this.rotationSpeed = 2 * Math.PI * (Math.random() - 0.5);
    this.radius = radius;
    this.noise = noise;
    this.shape = [];
    for (let i = 0; i < segments; i++) {
      this.shape.push(Math.random() - 0.5);
    }
  }


  update(elapsed) {
    if (this.x - this.radius + elapsed * this.xSpeed > context.canvas.width) {
      this.x = -this.radius;
    }
    if (this.x + this.radius + elapsed * this.xSpeed < 0) {
      this.x = context.canvas.width + this.radius;
    }
    if (this.y - this.radius + elapsed * this.ySpeed > context.canvas.height) {
      this.y = -this.radius;
    }
    if (this.y + this.radius + elapsed * this.ySpeed < 0) {
      this.y = context.canvas.height + this.radius;
    }
    this.x += elapsed * this.xSpeed;
    this.y += elapsed * this.ySpeed;
    this.angle = (this.angle + this.rotationSpeed * elapsed) % (2 * Math.PI)
  }

  draw(ctx, guide) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    draw_asteroid(ctx, this.radius, this.shape, {
      guide: guide,
      noise: this.noise
    })
    ctx.restore();
  }
}
