//board
let tileSize = 30;
let rows = 10;
let columns = 20;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let board;
let context;
let groundLine;

//dinosaur dimensions and position
let dinoWidth = tileSize * 2 + tileSize / 2;
let dinoHeight = tileSize * 3;
let dinoX = tileSize / 2;
let dinoY = tileSize * rows - tileSize * 3;
let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}
let dinoImg;
let jumpDino = false;

//ball
let ballsArray = [];
let numberOfBalls = 8;
let ballRows = 1;
let ballColumns = 20;
let ballsCount = 0;
let nextBallDimensions = tileSize;
let maxBallDimensions = 2 * tileSize;
let minBallDimensions = tileSize;
let ballX = tileSize * columns;
let ballY = tileSize * rows - nextBallDimensions;
let ballImg;
let colision = false;

//time animation for dinosaur
let second = 1000;
let secondsPassed = 0;
let oldTimeStamp = 0;
let timeStamp = 0;
let gameOver = false;
let startTime = Date.now();
let playTime = 0;
let loopTime;
let dinoMovingSpeed = 0.3;
let dinoTimePassed = 0;
let dinoSecondPassed = 0;
let dinoDecrementSpeed = 0.2;
let dinoDirectionDown = false;

//ball drawing limits
let min = Math.ceil(900);
let max = Math.floor(2000);
let nextBall;
let reDrawBallID;
let ballVelocityX = 3;

//score
let highScore = -1;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");
    groundLine = board.getContext("2d");

    //load and draw the dino
    dinoImg = new Image();
    dinoImg.src = "./dino.png";
    dinoImg.onload = function() {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }
    ballImg = new Image();
    ballImg.src = "./ball.png";
    createBalls();
    requestAnimationFrame(gameLoop);
    document.addEventListener('keydown', jump);
    document.addEventListener('keydown', restartGame);
}

function gameLoop(timeStamp) {
    // Calculate how much time has passed
    secondsPassed = (timeStamp - oldTimeStamp) / second;
    oldTimeStamp = timeStamp;
    updateDino(secondsPassed);
    drawDino();
    drawBalls();
    displayScore();
    dinoCollision();
    if (gameOver) {
        return;
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function updateDino(secondsPassed) {
    dinoSecondPassed = Math.min(secondsPassed, 0.1);
    dinoTimePassed += dinoSecondPassed;
    context.clearRect(0, 0, board.width, board.height);

    //calculates the movement of the dino from the bottom to the maximum jump position and then back down
    if (jumpDino) {
        if (!dinoDirectionDown && dino.y > boardHeight / 4) {
            dino.y = easeLinear(dinoTimePassed, dinoY, - boardHeight / 2, dinoMovingSpeed);
        }
        if (dino.y < boardHeight / 3) {
            dinoTimePassed = 0;
            dinoDirectionDown = true;
            dino.y = boardHeight / 3;
        }
        if (dinoDirectionDown && dino.y < dinoY) {
            dino.y = easeLinear(dinoTimePassed, dino.y, 5, dinoMovingSpeed);
        }
        if (dino.y >= dinoY) {
            dino.y = dinoY;
            dinoDirectionDown = false;
            jumpDino = false;
            dinoTimePassed = 0;
        }
    }
}

//generating types of movements:
//t - the time at which the animation starts, time that make the animation progress
//b - coordinate of the Starting position on the x or y axis
//c - the number of intermediate frames until the end position on the x or y axis
//d - the time in seconds for making the animation from position 'b' to position 'c'
function easeLinear(t, b, c, d) {
    return c * t / d + b;
}

function drawDino() {
    loopTime = Date.now();
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
}

function drawBalls() {
    for (let i = 0; i < ballsArray.length; ++i) {
        let ball = ballsArray[i];
        if (ball.alive) {
            ball.x -= ballVelocityX;
            context.drawImage(ballImg, ball.x, ball.y, ball.width, ball.height);
        }
        if (ball.x < - tileSize) {
            ball.alive = false;
        }
    }
}

function displayScore() {
    playTime = Math.round((loopTime - startTime) / 1000);

    //displays the running time of the game
    context.fillStyle = "black";
    context.font = "bold 20px courier";
    context.fillText(playTime, 550, 15);

    //display the highest score
    if (highScore > 0) {
        context.fillStyle = "red";
        context.font = "bold 20px courier";
        context.fillText("HI  " + highScore, 450, 15);
    }
}

function jump(e) {
    if (e.code == 'Space') {
        jumpDino = true;
        dinoTimePassed = 0;
    }
}

function restartGame(e) {
    if (e.code == 'KeyS' || e.code == 'Keys') {
        if (gameOver) {
            //calculate the highest score
            if (highScore < playTime) {
                highScore = playTime;
            }
            secondsPassed = 0;
            startTime = Date.now();
            loopTime = 0;
            endTime = 0;
            playTime = 0;
            gameOver = false;
            dinoMovingSpeed = 0.3;
            context.clearRect(0, 0, board.width, board.height);
            ballsArray = [];
            createBalls();
            requestAnimationFrame(gameLoop);
        }
    }
}

function dinoCollision() {
    for (let i = 0; i < ballsArray.length; ++i) {
        let ball = ballsArray[i];
        if (ball.alive && detectCollision(ball, dino)) {
            ball.alive = false;
            gameOver = true;
        }
    }
    if (gameOver) {
        context.fillStyle = "red";
        context.font = "bold 100px courier";
        context.fillText("GAME OVER", 34, 170);
    }
}

function detectCollision(a, b) {
    return a.x <= b.x + tileSize * 2 && a.x >= b.x - tileSize / 2 && a.y <= b.y + tileSize * 2;
}

function createBalls() {
    clearInterval(reDrawBallID);
    ballDimensions();
    nextBalls();
    ballY = tileSize * rows - nextBallDimensions;
    reDrawBallID = setInterval(createBalls, nextBall);
    let ball = {
            img : ballImg,
            x : ballX,
            y : ballY,
            width : nextBallDimensions,
            height : nextBallDimensions,
            alive : true
    }
    ballsArray.push(ball);
    ballsCount = ballsArray.length;
}

function nextBalls() {
    nextBall = Math.floor(Math.random() * (max - min) + min);
}

function ballDimensions() {
    nextBallDimensions = Math.floor(Math.random() * (maxBallDimensions - minBallDimensions) + minBallDimensions);
}
