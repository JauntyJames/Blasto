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

class PacMan {
  constructor(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.angle = 0;
    this.xSpeed = speed;
    this.ySpeed = 0;
    this.time = 0;
    this.mouth = 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    draw_pacman(ctx, this.radius, this.mouth);
    ctx.restore();
  }

  turn(direction) {
    if(this.ySpeed) {
      // if we are travelling vertically
      // set the horizontal speed and apply the direction
      this.xSpeed = -direction * this.ySpeed;
      // clear the vertidcal speed and rotate
      this.ySpeed = 0;
      this.angle = this.xSpeed > 0 ? 0 : Math.PI;
    } else {
      // if we are travelling horizontally
      // set the vertical speed and apply the direction
      this.ySpeed = direction * this.xSpeed;
      // clear the horizontal speed and rotate;
      this.xSpeed = 0;
      this.angle = this.ySpeed > 0 ? 0.5 * Math.PI : 1.5 * Math.PI;
    }
  }

  turnLeft() {
    this.turn(-1);
  }

  turnRight() {
    this.turn(1);
  }

  update(elapsed, width, height) {
    // an average of once per 100 frames
    if (Math.random() <= 0.01) {
      if (Math.random() < 0.5) {
        this.turnLeft();
      } else {
        this.turnRight();
      }
    }

    if (this.x - this.radius + elapsed * this.xSpeed > width) {
      this.x = -this.radius;
    }
    if (this.x + this.radius + elapsed * this.xSpeed < 0) {
      this.x = width + this.radius;
    }
    if (this.y - this.radius + elapsed * this.ySpeed > height) {
      this.y = -this.radius;
    }
    if (this.y + this.radius + elapsed * this.ySpeed < 0) {
      this.y = height + this.radius;
    }
    this.x += this.xSpeed * elapsed;
    this.y += this.ySpeed * elapsed;
    this.time += elapsed;
    this.mouth = Math.abs(Math.sin(2 * Math.PI * this.time));
  }
}

class Ghost {
  constructor(x, y, radius, speed, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.color = color;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    draw_ghost(ctx, this.radius, {
      fill: this.color
    })
    ctx.restore();
  }

  update(target, elapsed) {
    var angle = Math.atan2(target.y - this.y, target.x - this.x)
    var xSpeed = Math.cos(angle) * this.speed;
    var ySpeed = Math.sin(angle) * this.speed;
    this.x += xSpeed * elapsed;
    this.y += ySpeed * elapsed;
  }
}
