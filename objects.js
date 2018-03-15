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

  child(mass) {
    return new Asteroid(
      mass,
      this.x,
      this.y,
      this.xSpeed,
      this.ySpeed,
      this.rotationSpeed
    )
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
  constructor(x, y, power, weaponPower) {
    super(x, y, 10, 20, 1.5 * Math.PI);
    this.thrusterPower = power;
    this.steeringPower = power / 20;
    this.rightThruster = false;
    this.leftThruster = false;
    this.thrusterOn = false;
    this.retroOn = false;
    this.weaponPower = weaponPower || 200;
    this.loaded = false;
    this.weaponReloadTime = 0.25;
    this.timeUntilReload = this.weaponReloadTime;
    this.compromised = false;
    this.maxHealth = 2.0;
    this.health = this.maxHealth;
  }

  update(elapsed, c) {
    this.push(this.angle, (this.thrusterOn - this.retroOn) * this.thrusterPower, elapsed);
    this.twist((this.rightThruster - this.leftThruster) * this.steeringPower, elapsed);
    this.loaded = this.timeUntilReload === 0;
    if (!this.loaded) {
      this.timeUntilReload -= Math.min(elapsed, this.timeUntilReload);
    }
    if (this.compromised) {
      this.health -= Math.min(elapsed, this.health);
    }
    super.update.apply(this, arguments);
  }

  draw(c, guide) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    if (guide && this.compromised) {
      c.save();
      c.fillStyle = "red"
      c.beginPath();
      c.arc(0, 0, this.radius, 0, 2 * Math.PI);
      c.fill();
      c.restore();
    }
    draw_ship(c, this.radius, {
      guide: guide,
      thruster: this.thrusterOn
    })
    c.restore();
  }

  projectile(elapsed) {
    let p = new Projectile(0.025, 1,
      this.x + Math.cos(this.angle) * this.radius,
      this.y + Math.sin(this.angle) * this.radius,
      this.xSpeed,
      this.ySpeed,
      this.rotationSpeed
    )
    p.push(this.angle, this.weaponPower, elapsed);
    this.push(this.angle + Math.PI, this.weaponPower, elapsed);
    this.timeUntilReload = this.weaponReloadTime;
    return p;
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

  moveRight() {
    this.xSpeed = this.speed;
    this.ySpeed = 0;
    this.angle = 0;
  }

  moveDown() {
    this.xSpeed = 0;
    this.ySpeed = this.speed;
    this.angle = 0.5 * Math.PI
  }

  moveLeft() {
    this.xSpeed = -this.speed;
    this.ySpeed = 0;
    this.angle = Math.PI;
  }

  moveUp() {
    this.xSpeed = 0;
    this.ySpeed = -this.speed;
    this.angle = 1.5 * Math.PI;
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

class Projectile extends Mass {
  constructor(mass, lifetime, x, y, xSpeed, ySpeed, rotationSpeed) {
    let density = 0.001
    let radius = Math.sqrt((mass / density) / Math.PI);
    super(x, y, mass, radius, 0, xSpeed, ySpeed, rotationSpeed);
    this.lifetime = lifetime;
    this.life = 1.0;
  }

  update(elapsed, c) {
    this.life -= (elapsed / this.lifetime);
    super.update.apply(this, arguments);
  }
}

class Indicator {
  constructor(label, x, y, width, height) {
    this.label = `${label}: `;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(c, max, level) {
    c.save();
    c.strokeStyle = "white";
    c.fillStyle = "white";
    c.font = `${this.height}pt Arial`
    let offset = c.measureText(this.label).width;
    c.fillText(this.label, this.x, this.y + this.height - 1);
    c.beginPath();
    c.rect(offset + this.x, this.y, this.width, this.height);
    c.stroke();
    c.beginPath();
    c.rect(offset + this.x, this.y, this.width * (max / level), this.height)
    c.fill();
    c.restore();
  }
}

class NumberIndicator {
  constructor(label, x, y, options) {
    options = options || {};
    this.label = `${label}: `;
    this.x = x;
    this.y = y;
    this.digits = options.digits || 0;
    this.pt = options.pt || 10;
    this.align = options.align || 'end';
  }

  draw(c, value) {
    c.save();
    c.fillStyle = "white";
    c.font = `${this.pt}pt Arial`;
    c.textAlign = this.align;
    c.fillText(
      this.label + value.toFixed(this.digits),
      this.x,
      this.y + this.pt -1
    );
    c.restore();
  }
}
