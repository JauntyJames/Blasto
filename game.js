let collision = (obj1, obj2) => {
  return distanceBetween(obj1, obj2) < (obj1.radius + obj2.radius);
}

let distanceBetween = (obj1, obj2) => {
  return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}

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
    this.healthIndicator = new Indicator("health", 5, 5, 100, 10)
    this.massDestroyed = 500;
    this.score = 0;
    this.scoreIndicator = new NumberIndicator("score", this.canvas.width - 10, 5);
    this.fpsIndicator = new NumberIndicator(
      "fps", 
      this.canvas.width - 10,
      this.canvas.height - 15,
      {digits: 2}
    )
    this.gameOver = false;
    this.message = new Message(this.canvas.width / 2, this.canvas.height * 0.4)
    window.requestAnimationFrame(this.frame.bind(this));
    this.resetGame();
  }

  movingAsteroid(elapsed) {
    let asteroid = this.newAsteroid();
    this.pushAsteroid(asteroid, elapsed);
    return asteroid;
  }

  newAsteroid() {
    return new Asteroid(
      this.asteroidMass,
      this.canvas.width * Math.random(),
      this.canvas.height * Math.random()
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

  keyHandler(e, value) {
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
        if (this.gameOver) {
          this.resetGame();
        } else {
          this.ship.trigger = value;
        }
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
    this.fps = 1000 / elapsed;
    this.update(elapsed / 1000);
    this.draw();
    this.previous = timestamp;
    window.requestAnimationFrame(this.frame.bind(this));
  }

  update(elapsed) {
    this.ship.compromised = false;
    this.asteroids.forEach((a) => {
      a.update(elapsed, this.c);
      if (collision(a, this.ship)) {
        this.ship.compromised = true;
      }
    }, this);
    if (this.ship.health <= 0) {
      this.gameOver = true;
      return;
    }
    this.ship.update(elapsed, this.c);
    this.projectiles.forEach((p, i, projectiles) => {
      p.update(elapsed, this.c);
      if (p.life <= 0) {
        projectiles.splice(i, 1);
      } else {
        this.asteroids.forEach((a, j) => {
          if (collision(a, p)) {
            projectiles.splice(i, 1);
            this.asteroids.splice(j, 1);
            this.splitAsteroid(a, elapsed);
          }
        }, this)
      }
    }, this);
    if (this.ship.trigger && this.ship.loaded) {
      this.projectiles.push(this.ship.projectile(elapsed));
    }
  }

  splitAsteroid(asteroid, elapsed) {
    asteroid.mass -= this.massDestroyed;
    this.score += this.massDestroyed;
    let split = 0.25 + 0.5 * Math.random(); // split unevenly
    let ch1 = asteroid.child(asteroid.mass * split);
    let ch2 = asteroid.child(asteroid.mass * (1 - split));
    [ch1, ch2].forEach((child) => {
      if (child.mass < this.massDestroyed) {
        this.score += child.mass;
      } else {
        this.pushAsteroid(child, elapsed);
        this.asteroids.push(child)
      }
    }, this)
  }

  draw() {
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.guide) {
      draw_grid(this.c);
      this.asteroids.forEach((a) => {
        drawLine(this.c, a, this.ship);
        this.projectiles.forEach((p) => {
          drawLine(this.c, asteroid, p);
        }, this);
      }, this);
      this.fpsIndicator.draw(this.c, this.fps)
    }
    this.asteroids.forEach((a) => {
      a.draw(this.c, this.guide);
    }, this);
    if (this.gameOver) {
      this.message.draw(this.c, "GAME OVER", "Press space to play again")
      return;
    }
    this.ship.draw(this.c, this.guide);
    this.projectiles.forEach((p) => {
      p.draw(this.c);
    }, this);
    this.healthIndicator.draw(this.c, this.ship.health, this.ship.maxHealth);
    this.scoreIndicator.draw(this.c, this.score);
  }

  resetGame() {
    this.gameOver = false;
    this.score = 0;
    this.ship = new Ship(
      this.canvas.width / 2,
      this.canvas.height / 2,
      1000,
      200
    );
    this.projectiles = [];
    this.asteroids = [];
    this.asteroids.push(this.movingAsteroid());
  }
}
