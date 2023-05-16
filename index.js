'use strict';

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const reset = document.getElementById('reset');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const RUN_SPEED_MS = 150;
const gridSize = 20;
const w = canvas.width;
const h = canvas.height;

let score = 0;
let request;

reset.addEventListener('click', resetGame);

class Food {
  constructor() {
    [this.x, this.y] = getRandomCoordinates();
    if (this.x === w / 2 && this.y === h / 2) this.x = w / 2 - 3 * gridSize;
  }
  display() {
    ctx.save();
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x + 2, this.y + 2, gridSize - 4, gridSize - 4);
    ctx.restore();
  }
}

class Snake {
  constructor(x, y) {
    this.head = { x, y, prevX: undefined, prevY: undefined };
    this.body = [];
    this.dx = 0;
    this.dy = 0;
  }
  display() {
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.fillRect(this.head.x + 2, this.head.y + 2, gridSize - 4, gridSize - 4);
    ctx.restore();
    for (const bodyPart of this.body) {
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(bodyPart.x + 2, bodyPart.y + 2, gridSize - 4, gridSize - 4);
      ctx.restore();
    }
  }
  update() {
    this.head.x += this.dx * gridSize;
    this.head.y += this.dy * gridSize;
    if (this.head.x >= w) this.head.x = 0;
    if (this.head.x < 0) this.head.x = w - gridSize;
    if (this.head.y >= h) this.head.y = 0;
    if (this.head.y < 0) this.head.y = h - gridSize;
  }
}

// SETUP
localStorage.setItem('highscore', 0);
const snake = new Snake(w / 2, h / 2);
const food = new Food();

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' && snake.dx !== -1) {
    snake.dx = 1;
    snake.dy = 0;
  }
  if (e.key === 'ArrowLeft' && snake.dx !== 1) {
    snake.dx = -1;
    snake.dy = 0;
  }
  if (e.key === 'ArrowDown' && snake.dy !== -1) {
    snake.dx = 0;
    snake.dy = 1;
  }
  if (e.key === 'ArrowUp' && snake.dy !== 1) {
    snake.dx = 0;
    snake.dy = -1;
  }
});

function draw() {
  ctx.fillStyle = 'lightgray';
  ctx.fillRect(0, 0, w, h);
  drawBoard();

  food.display();
  snake.display();

  snake.head.prevX = snake.head.x;
  snake.head.prevY = snake.head.y;

  snake.update();

  if (snake.head.x === food.x && snake.head.y === food.y) {
    score++;
    snake.body.unshift({ x: snake.head.prevX, y: snake.head.prevY, prevX: undefined, prevY: undefined });
    snake.head.x = food.x;
    snake.head.y = food.y;
    scoreDisplay.textContent = `Score: ${score}`;
    [food.x, food.y] = getRandomCoordinates();
  }

  for (let i = 0; i < snake.body.length; i++) {
    if (!i) {
      snake.body[i].prevX = snake.body[i].x;
      snake.body[i].prevY = snake.body[i].y;
      snake.body[i].x = snake.head.prevX;
      snake.body[i].y = snake.head.prevY;
    } else {
      snake.body[i].prevX = snake.body[i].x;
      snake.body[i].prevY = snake.body[i].y;
      snake.body[i].x = snake.body[i - 1].prevX;
      snake.body[i].y = snake.body[i - 1].prevY;
    }
  }

  if (checkCollision()) {
    console.log('hit!');
    cancelAnimationFrame(request);
    scoreDisplay.textContent = 'GAME OVER!';
    if (score > +localStorage.getItem('highscore')) localStorage.setItem('highscore', score);
    highScoreDisplay.textContent = `Highscore: ${localStorage.getItem('highscore')}`;
    reset.classList.toggle('hidden');
    return;
  }

  // === //
  setTimeout(() => {
    request = requestAnimationFrame(draw);
  }, RUN_SPEED_MS);
}

request = requestAnimationFrame(draw);

function line(x1, y1, x2, y2, strokeWeight = 4, strokeStyle = 'black') {
  ctx.save();
  ctx.lineWidth = strokeWeight;
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawBoard() {
  for (let i = 0; i <= w; i += gridSize) {
    line(i, 0, i, h, 1);
  }
  for (let i = 0; i <= h; i += gridSize) {
    line(0, i, w, i, 1);
  }
}

function getRandomCoordinates() {
  const candidates = [];
  for (let i = 0; i < w; i += gridSize) {
    for (let j = 0; j < h; j += gridSize) {
      if (snake.head.x === i && snake.head.y === j) continue;
      for (const bodyPart of snake.body) {
        if (bodyPart.x === i && bodyPart.y === j) j += gridSize;
      }
      candidates.push({ x: i, y: j });
    }
  }
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const x = candidates[randomIndex].x;
  const y = candidates[randomIndex].y;
  return [x, y];
}

function checkCollision() {
  for (const [index, bodyPart] of snake.body.entries()) {
    if (index && snake.head.x === bodyPart.x && snake.head.y === bodyPart.y) return true;
  }
  return false;
}

function resetGame() {
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  snake.head.x = w / 2;
  snake.head.y = h / 2;
  snake.head.prevX = undefined;
  snake.head.prevY = undefined;
  snake.dx = 0;
  snake.dy = 0;
  snake.body.splice(0, snake.body.length);
  [food.x, food.y] = getRandomCoordinates();
  reset.classList.toggle('hidden');
  request = requestAnimationFrame(draw);
}
