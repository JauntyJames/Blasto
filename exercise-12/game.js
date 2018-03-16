class AsteroidsGame {
  constructor(id) {
    this.canvas = document.getElementById(id);
    this.c = this.canvas.getContext("2d");
    this.canvas.focus();
    this.guide = false;
    this.shipMass = 10;
    this.shipRadius = 15;
    this.asteroidMass = 5000;
    this.asteroidPush = 500000;
    this.ship = new Ship(
      this.canvas.width / 2,
      this.canvas.height / 2,
      1000,
      200
    );
    this.projectiles = [];
    this.asteroids = [];
    this.asteroids.push(this.movingAsteroid());
    this.canvas.addEventListener("keydown", this.keyDown.bind(this), true);
    this.canvas.addEventListener("keyup", this.keyUp.bind(this), true);
    window.requestAnimationFrame(this.frame.bind(this));
  }

  movingAsteroid(elapsed) {
    let asteroid = this.newAsteroid();
    this.pushAsteroid(asteroid, elapsed);
    return asteroid;
  }

  newAsteroid() {
    return new Asteroid(
      this.canvas.width * Math.random(),
      this.canvas.height * Math.random(),
      this.asteroidMass
    )
  }

  pushAsteroid(asteroid, elapsed) {
    elapsed = elapsed || 0.015;
    asteroid.push(2 * Math.PI * Math.random(), this.asteroidPush, elapsed);
    asteroid.twist(
      (Math.random() - 0.5) * Math.PI * this.asteroidPush * 2, elapsed
    )
  }
  keyDown(e) {
    this.keyHandler(e, true);
  }

  keyUp(e) {
    this.keyHandler(e, false);
  }

  keyHandler() {
    var nothingHandled = false;
    switch(e.key || e.keyCode) {
      case "ArrowLeft":
      case 37:
        this.ship.leftThruster = value;
        break;
      case "ArrowUp":
      case 38:
        this.ship.thrusterOn = value;
        break;
      case "ArrowRight":
        this.ship.rightThruster = value;
        break;
      case "ArrowDown":
      case 39:
        this.ship.retroOn = value;
        break;
      case " ":
      case 32:
        this.ship.trigger = value;
        break;
      case "g":
      case 71:
        if(value) this.guide = !this.guide;
        break;
      default:
        nothingHandled = true;
    }
    if (!nothingHandled) e.preventDefault();
  }

  frame(timestamp) {
    if (!this.previous) this.previous = timestamp;
    let elapsed = timestamp - this.previous;
    this.update(elapsed / 1000);
    this.draw();
    this.previous = timestamp;
    window.requestAnimationFrame(this.frame.bind(this));
  }

  update(elapsed) {
    this.ship.compromised = false;
    this.asteroids.forEach((a) => {
      a.update(elapsed, this.c);
    }, this);
    this.ship.update(elaped, this.c);
    this.projectiles.forEach((p, i, projectiles) => {
      p.update(elapsed, this.c);
      if (p.life <= 0) {
        projectiles.splice(i, 1);
      }
    }, this);
    if (this.ship.trigger && this.ship.loaded) {
      this.projectiles.push(this.ship.projectile(elapsed));
    }
  }

  draw() {
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.guide) {
      draw_grid(this.c);
      this.asteroids.forEach((a) => {
        drawLine(this.c, a, this.ship);
      }, this);
    }
    this.asteroids.forEach((a) => {
      asteroid.draw(this.c, this.guide);
    }, this);
    this.ship.draw(this.c, this.guide);
    this.projectiles.forEach((p) => {
      p.draw(this.c);
    }, this);
  }
}
