// Récupération du canvas et du contexte 2D
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Chargement de l'image de fond
const backgroundImage = new Image();
backgroundImage.src = 'image/brick-3671612_1280.jpg'; // Chemin de votre image

// Objet représentant la balle
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: 'red',
    speed: 5,
    direction: { x: 0, y: -1 }  // direction initiale
};

// Objet représentant le plateau
const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    width: 100,
    height: 10,
    color: 'blue',
    speed: 5,
    direction: 0  // -1 pour gauche, 1 pour droite, 0 pour arrêt
};

// Objet représentant le jeu
const game = {
    width: canvas.width,
    height: canvas.height,
    color: '#f0f0f0',
    start: false,
    pause: false,
    gameOver: false
};

// Tableau des briques
const bricks = [];
const brickRowCount = 5;  // Plus de rangées de briques
const brickColumnCount = 9;  // Moins de colonnes de briques
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Initialiser les briques
function initBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// Fonction pour dessiner les briques
function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = 'green';
                context.fill();
                context.closePath();
            }
        }
    }
}

// Fonction pour détecter les collisions avec les briques
function collisionDetection() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status == 1) {
                if(ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.direction.y = -ball.direction.y;
                    b.status = 0;
                }
            }
        }
    }
}

// Fonction pour dessiner la balle
function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = ball.color;
    context.fill();
    context.closePath();
}

// Fonction pour dessiner le plateau
function drawPaddle() {
    context.beginPath();
    context.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    context.fillStyle = paddle.color;
    context.fill();
    context.closePath();
}

// Fonction pour dessiner un cadre autour du canvas
function drawFrame() {
    context.beginPath();
    context.rect(0, 0, game.width, game.height);
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    context.stroke();
    context.closePath();
}

// Fonction pour réinitialiser le Canvas et afficher la balle, le plateau et les briques
function displayGame() {
    context.clearRect(0, 0, game.width, game.height);

    // Dessiner l'image de fond
    context.drawImage(backgroundImage, 0, 0, game.width, game.height);

    drawFrame();
    drawBricks();
    drawBall();
    drawPaddle();
}

// Fonction pour initialiser les positions de la balle et du plateau
function initPositions() {
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.y = canvas.height - 30;
    ball.x = canvas.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.direction = { x: 0, y: -1 };
}

// Fonction pour gérer les événements clavier
function keyboardEvent(event) {
    if (event.key === "ArrowRight") {
        paddle.direction = (event.type === "keydown") ? 1 : 0;
    } else if (event.key === "ArrowLeft") {
        paddle.direction = (event.type === "keydown") ? -1 : 0;
    } else if (event.key === " ") {  // Barre d'espace pour pause/démarrer/recommencer
        if (event.type === "keydown") {
            if (game.gameOver) {
                game.gameOver = false;
                initPositions();
                initBricks();
                game.start = true;
                game.pause = false;
            } else if (!game.start) {
                game.start = true;
                game.pause = false;
            } else {
                game.pause = !game.pause;
            }
        }
    }
}

// Fonction pour initialiser le jeu
function initGame() {
    document.addEventListener('keydown', keyboardEvent);
    document.addEventListener('keyup', keyboardEvent);
    initPositions();
    initBricks();
    playGame();
}

// Fonction pour lancer l'animation
function playGame() {
    if (!game.pause) {
        if (game.start) {
            // Déplacement de la balle
            ball.x += ball.direction.x * ball.speed;
            ball.y += ball.direction.y * ball.speed;

            // Vérification des collisions avec les bords du Canvas
            if (ball.x + ball.radius > game.width || ball.x - ball.radius < 0) {
                ball.direction.x = -ball.direction.x;  // Inverser la direction horizontale
            }
            if (ball.y - ball.radius < 0) {
                ball.direction.y = -ball.direction.y;  // Inverser la direction verticale
            }
            if (ball.y + ball.radius > game.height) {
                game.gameOver = true;
                game.start = false;
                game.pause = true;
            }

            // Vérification


            // Vérification des collisions avec le plateau
            if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                ball.direction.y = -ball.direction.y;

                // Changer l'angle de la balle en fonction de la position où elle frappe le plateau
                let hitPosition = (ball.x - paddle.x) / paddle.width;
                if (hitPosition < 0.33) {
                    ball.direction.x = -1;  // Frappe à gauche
                } else if (hitPosition < 0.66) {
                    ball.direction.x = 0;  // Frappe au centre
                } else {
                    ball.direction.x = 1;  // Frappe à droite
                }
            }

            // Déplacement du plateau
            paddle.x += paddle.direction * paddle.speed;

            // Vérification des collisions du plateau avec les bords du Canvas
            if (paddle.x < 0) {
                paddle.x = 0;
            } else if (paddle.x + paddle.width > game.width) {
                paddle.x = game.width - paddle.width;
            }

            // Détection des collisions avec les briques
            collisionDetection();
        } else {
            // Positionner la balle au centre du plateau si le jeu n'a pas commencé
            ball.x = paddle.x + paddle.width / 2;
        }
    }

    displayGame();  // Affichage du jeu
    requestAnimationFrame(playGame);  // Rappel de la fonction playGame
}



// Lancement du jeu après le chargement du DOM
document.addEventListener('DOMContentLoaded', initGame);
