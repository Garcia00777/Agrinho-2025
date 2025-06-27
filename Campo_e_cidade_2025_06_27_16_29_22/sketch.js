let player;
let vitality = 100; // Vitalidade do Campo
let urbanAttraction = 0; // Atração Urbana
let gameState = 'playing'; // 'playing', 'gameOver'

let objects = []; // Array para guardar os objetos que caem
let lastObjectTime = 0;
let objectInterval = 60; // Frequência com que novos objetos aparecem (em frames)
let maxObjects = 20; // Número máximo de objetos na tela
let objectSpeed = 1;
function setup() {
2
  createCanvas(400, 400);
3
}
4

5
function draw() {
6
  background(220);
7
}
function setup() {
  createCanvas(600, 400);
  player = new Player();
  textSize(16);
  textAlign(CENTER, CENTER);
}

function draw() {
  if (gameState === 'playing') {
    background(100, 150, 50); 

    // Geração de objetos
    if (frameCount - lastObjectTime > objectInterval && objects.length < maxObjects) {
      objects.push(new FallingObject());
      lastObjectTime = frameCount;
      // Aumenta a dificuldade com o tempo
      if (objectInterval > 15) {
        objectInterval -= 0.5;
      }
      objectSpeed += 0.01;
    }

    // Atualiza e desenha objetos
    for (let i = objects.length - 1; i >= 0; i--) {
      objects[i].update();
      objects[i].display();

      // Colisão com o player
      if (player.collides(objects[i])) {
        objects[i].applyEffect();
        objects.splice(i, 1); // Remove o objeto
      } else if (objects[i].y > height + objects[i].size / 2) {
        // Remove objetos que saem da tela
        objects.splice(i, 1);
      }
    }

    player.update();
    player.display();

    // Exibe scores
    fill(255);
    text(`Vitalidade do Campo: ${vitality.toFixed(0)}`, width / 2, 20);
    text(`Atração Urbana: ${urbanAttraction.toFixed(0)}`, width / 2, 40);

    // Checa condição de fim de jogo
    if (vitality <= 0) {
      gameState = 'gameOver';
      background(200, 50, 50); // Fundo vermelho para game over
      fill(255);
      text("GAME OVER!", width / 2, height / 2 - 30);
      text("Você não resistiu às dificuldades do campo.", width / 2, height / 2);
      text("Pressione 'R' para reiniciar", width / 2, height / 2 + 30);
    } else if (urbanAttraction >= 200) { // Limite de atração urbana
      gameState = 'gameOver';
      background(50, 50, 200); // Fundo azul para game over
      fill(255);
      text("GAME OVER!", width / 2, height / 2 - 30);
      text("A cidade te chamou!", width / 2, height / 2);
      text("Pressione 'R' para reiniciar", width / 2, height / 2 + 30);
    }

  } else if (gameState === 'gameOver') {
    // Apenas aguarda o input 'R' para reiniciar
  }
}

function keyPressed() {
  if (gameState === 'playing') {
    if (keyCode === LEFT_ARROW) {
      player.move(-1);
    } else if (keyCode === RIGHT_ARROW) {
      player.move(1);
    }
  } else if (gameState === 'gameOver' && key === 'r') {
    resetGame();
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.stop();
  }
}

function resetGame() {
  vitality = 100;
  urbanAttraction = 0;
  objects = [];
  player = new Player();
  lastObjectTime = 0;
  objectInterval = 60;
  objectSpeed = 1;
  gameState = 'playing';
}

// --- Classes do Jogo ---

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 30;
    this.size = 20;
    this.speed = 5;
    this.dir = 0; // -1 for left, 1 for right, 0 for stop
  }

  update() {
    this.x += this.dir * this.speed;
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
  }

  display() {
    fill(255); // Branco para o player
    ellipse(this.x, this.y, this.size);
    // Pequeno chapéu de palha para simbolizar o campo
    fill(139, 69, 19); // Cor de palha
    arc(this.x, this.y - this.size / 2, this.size * 1.2, this.size / 2, PI, TWO_PI);
  }

  move(direction) {
    this.dir = direction;
  }

  stop() {
    this.dir = 0;
  }

  collides(obj) {
    let d = dist(this.x, this.y, obj.x, obj.y);
    return d < (this.size / 2 + obj.size / 2);
  }
}

class FallingObject {
  constructor() {
    this.x = random(width);
    this.y = -20;
    this.size = random(15, 30);
    this.type = floor(random(4)); // 0: leaf, 1: rock, 2: money, 3: building
    this.color = color(0);
    this.effect = 0; // Quantidade de efeito no score

    switch (this.type) {
      case 0: // Folha (benefício rural)
        this.color = color(0, 180, 0);
        this.effect = 5; // Aumenta vitalidade
        break;
      case 1: // Pedra (dificuldade rural)
        this.color = color(100, 100, 100);
        this.effect = -10; // Diminui vitalidade
        break;
      case 2: // Símbolo de dinheiro (atração urbana)
        this.color = color(255, 200, 0);
        this.effect = 10; // Aumenta atração urbana
        this.size = random(30, 50); // Prédio maior
        break;
    }
  }

  update() {
    this.y += objectSpeed;
  }

  display() {
    fill(this.color);
    noStroke();
    if (this.type === 0) { // Leaf
      ellipse(this.x, this.y, this.size, this.size * 1.5); // Slightly elongated
    } else if (this.type === 1) { // Rock
      rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size); // Simple square rock
    } else if (this.type === 2) { // Money
      rect(this.x - this.size / 2, this.y - this.size / 2, this.size * 0.8, this.size * 0.5); // Rectangle for money bag
      fill(0);
      textSize(this.size * 0.5);
      text('$', this.x, this.y + 2); // Money symbol
    } else if (this.type === 3) { // Building
      rect(this.x - this.size / 4, this.y - this.size / 2, this.size / 2, this.size); // Tall, thin rectangle
      fill(200, 200, 0); // Window light
      rect(this.x - this.size / 8, this.y - this.size / 4, this.size / 4, this.size / 8);
    }
  }

  applyEffect() {
    if (this.type === 0 || this.type === 1) { // Afeta vitalidade
      vitality += this.effect;
      vitality = constrain(vitality, 0, 100); // Vitalidade entre 0 e 100
    } else if (this.type === 2 || this.type === 3) { // Afeta atração urbana
      urbanAttraction += this.effect;
      urbanAttraction = constrain(urbanAttraction, 0, 200); // Atração entre 0 e 200
    }
  }
}
