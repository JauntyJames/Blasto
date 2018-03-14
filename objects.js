class Mass {
  constructor(x, y, mass, radius, angle, xSpeed, ySpeed, rotationSpeed) {
    this.x = x;
    this.y = y;
    this.mass = mass || 1;
    this.radius = radius || 50;
    this.angle = angle || 0;
    this.xSpeed = xSpeed || 0;
    this.ySpeed = ySpeed || 0;
    this.rotationSpeed = rotationSpeed || 0;
  }

  update(elapsed, ctx) {
    this.x += this.xSpeed * elapsed;
    this.y += this.ySpeed * elapsed;
    this.angle += this.rotationSpeed * elapsed;
    this.angle %= (2 * Math.PI);
    if (this.x - this.radius > ctx.canvas.width) {
      this.x = -this.radius;
    }
    if (this.x + this.radius < 0) {
      this.x = ctx.canvas.width + this.radius;
    }
    if (this.y - this.radius > ctx.canvas.height) {
      this.y = -this.radius;
    }
    if (this.y + this.radius < 0) {
      this.y = ctx.canvas.height + this.radius;
    }
  }

  push(angle, force, elapsed) {
    this.xSpeed += elapsed * (Math.cos(angle) * force) / this.mass;
    this.ySpeed += elapsed * (Math.sin(angle) * force) / this.mass;
  }

  twist(force, elapsed) {
    this.rotationSpeed += elapsed * force / this.mass;
  }

  speed() {
    return Math.sqrt(Math.pow(this.xSpeed, 2) + Math.pow(this.ySpeed, 2));
  }

  movementAngle() {
    return Math.atan2(this.ySpeed, this.xSpeed);
  }

  draw(c) {
    c.save();
    c.translate(this.x, this.y)
    c.rotate(this.angle);
    c.beginPath();
    c.arc(0, 0, this.radius, 0, 2 * Math.PI);
    c.lineTo(0, 0);
    c.strokeStyle = "#FFF";
    c.stroke();
    c.restore();
  }
}

class Asteroid extends Mass {
  constructor(mass, x, y, xSpeed, ySpeed, rotationSpeed) {
    let density = 1; // kg per square pixel
    let radius = Math.sqrt((mass / density) / Math.PI);
    super(x, y, mass, radius, 0, xSpeed, ySpeed, rotationSpeed)
    this.circumference = 2 * Math.PI * this.radius;
    this.segments = Math.ceil(this.circumference / 15);
    this.segemnts = Math.min(25, Math.max(5, this.segments));
    this.noise = 0.2;
    this.shape = [];
    for (let i = 0; i < this.segments; i++) {
      this.shape.push(Math.random() - 0.5);
    }
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

class Ship extends Mass {
  constructor(x, y) {
    super(x, y, 10, 20, 1.5 * Math.PI);
  }

  draw(c, guide) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    c.strokeStyle = "white";
    c.lineWidth - 2;
    c.fillStyle - "black";
    draw_ship(c, this.radius, {
      guide: guide
    })
    c.restore();
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

