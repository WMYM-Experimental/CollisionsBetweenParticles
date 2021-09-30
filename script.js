const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let gravity = 1;
let friction = 0.85;
let numberOfParticles = 100;
const colorArray = [
  "#457b9d",
  "#023047",
  "#219ebc",
  "#4895ef",
  "#2a9d8f",
  "#0077b6",
  "#264653",
];

let mouse = {
  x: undefined,
  y: undefined,
  radius: (canvas.height / 100) * (canvas.width / 100),
};

//mouse out event "no repultion"
window.addEventListener("mouseout", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

canvas.addEventListener("mouseup", function(event) {
  mouse.x = event.x;
  mouse.y = event.y;
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init();
});

//keydown spacebar event
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
  }
});

function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomColor(colorsArray) {
  return colorArray[Math.floor(Math.random() * colorArray.length)];
}

function getDistance(x1, y1, x2, y2) {
  const xDististance = x2 - x1;
  const yDististance = y2 - y1;
  return Math.hypot(xDististance, yDististance);
}

class Particle {
  constructor(x, y, radius, color, mass) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: getRandomInt(0, 10),
      y: getRandomInt(0, 10),
    };
    this.radius = radius;
    this.color = color;
    this.mass = mass;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.closePath();
  }

  update(particlesArray) {
    this.draw();
    for (let index = 0; index < particlesArray.length; index++) {
      if (this == particlesArray[index]) continue;
      if (
        getDistance(
          this.x,
          this.y,
          particlesArray[index].x,
          particlesArray[index].y
        ) -
          2 * this.radius <
        0
      ) {
        resolveCollision(this, particlesArray[index]);
      }
    }

    //wall collision
    if (
      this.y + this.velocity.y + this.radius >= canvas.height ||
      this.y - this.radius <= 0
    ) {
      this.velocity.y = -this.velocity.y;
    }
    if (
      this.x + this.velocity.x + this.radius >= canvas.width ||
      this.x - this.radius <= 0
    ) {
      this.velocity.x = -this.velocity.x;
    }
    //mouse collision
    if (
      getDistance(mouse.x, mouse.y, this.x, this.y) <
      this.radius + mouse.radius
    ) {
      if (mouse.x < this.x && this.x < canvas.width - this.radius * 10) {
        this.velocity.x += 30;
      }
      if (mouse.x > this.x && this.x > this.radius * 10) {
        this.velocity.x -= 30;
      }
      if (mouse.y < this.y && this.y < canvas.height - this.radius * 10) {
        this.velocity.y += 30;
      }
      if (mouse.y > this.y && this.y > this.radius * 10) {
        this.velocity.y -= 30;
      }
    }

    this.y += this.velocity.y;
    this.x += this.velocity.x;
  }
}

// Implementation
let particlesArray;
function init() {
  particlesArray = [];
  for (let i = 0; i < numberOfParticles; i++) {
    let radius = getRandomInt(5, canvas.width / 50); //put values
    let x = getRandomInt(radius, canvas.width - radius); //the min value could change
    let y = getRandomInt(radius, canvas.height - radius); //the min value could change
    let mass = radius;
    let color = getRandomColor(colorArray);
    if (i !== 0) {
      //kind a collision statements
      for (let k = 0; k < particlesArray.length; k++) {
        if (
          getDistance(x, y, particlesArray[k].x, particlesArray[k].y) -
            2 * radius <=
          0
        ) {
          x = getRandomInt(radius, canvas.width - radius);
          y = getRandomInt(radius, canvas.height - radius);

          k = -1;
        }
      }
    }
    particlesArray.push(new Particle(x, y, radius, color, mass));
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height); //refresh canvas
  particlesArray.forEach((ptcl) => {
    ptcl.update(particlesArray); //animation of every "particle (ptcl) in the particlesArray"
  });
}

init();
animate();
