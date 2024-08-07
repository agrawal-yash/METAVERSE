/**********Global Var***********/
var canvas, canvasContext;

// Bricks
const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_GAP = 2;
const BRICK_COLS = 10;
const BRICK_ROWS = 10;
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
var brickCount = 0;
var endScore=0;

// Ball
var ballX = 75;
var ballSpeedX = 8;
var ballY = 75;
var ballSpeedY = 8;

// Main Paddle
var paddleX = 400;
const PADDLE_THICKNESS = 15;
const PADDLE_WIDTH = 100;
const PADDLE_DIST_FROM_EDGE = 60;

// Mouse
var mouseX = 0;
var mouseY = 0;

/**********General GamePlay***********/

window.onload = function () {
  canvas = document.getElementById("gameCanvas");
  canvasContext = canvas.getContext("2d");
  var framesPerSecond = 30;

  hideEndContainer();
  hidePlayAgainButton();
  document.getElementById("start-button").addEventListener("click", function () {
    document.getElementById("start-container").style.display = "none";
    setInterval(updateAll, 1000 / framesPerSecond);
    canvas.addEventListener("mousemove", updateMousePos);
    brickReset();
    ballRest();
    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove);
  });
  setupPlayAgainButton(); // Call the setup function for play again button
  document.getElementById("start-button").addEventListener("click", startGame); 
};

function updateAll() {
  movement();
  playArea();
}

function ballRest() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2.5;
}

function brickReset() {
  brickCount = 0;
  var i;
  for (var i = 0; i < 3 * BRICK_COLS; i++) {
    brickGrid[i] = false;
  }
  for (; i < BRICK_COLS * BRICK_ROWS; i++) {
    if (Math.random() < 0.5) {
      brickGrid[i] = true;
    } else {
      brickGrid[i] = false;
    }
    brickGrid[i] = true;
    brickCount++;
  }
}

function ballMove() {
  // ballMovement
  ballX += ballSpeedX;
  ballY += ballSpeedY;
  // ballY
  if (ballY > canvas.height) {
    showEndContainer(); // Show end container when the ball is missed
    showPlayAgainButton(); // Show play again button when the ball is missed
    // ballRest();
    brickReset();
  } else if (ballY <= 0) {
    ballSpeedY *= -1;   
  }
  // ballx
  if (ballX >= canvas.width && ballSpeedX >= 0.0) {   
    ballSpeedX *=-1;
  } else if (ballX <= 0 && ballSpeedX <= 0.0) {
    ballSpeedX *=-1;
  }
}

function isBrickAtColRow(col, row) {
  if (col >= 0 && col < BRICK_COLS && row >= 0 && row < BRICK_ROWS) {
    var brickIndexUnderCoord = rowColToArrayIndex(col, row);
    return brickGrid[brickIndexUnderCoord];
  } else {
    return false;
  }
}

function ballBrickColl() {
  var ballBrickCol = Math.floor(ballX / BRICK_W);
  var ballBrickRow = Math.floor(ballY / BRICK_H);
  var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);
  if (
    ballBrickCol >= 0 &&
    ballBrickCol < BRICK_COLS &&
    ballBrickRow >= 0 &&
    ballBrickRow < BRICK_ROWS
  ) {
    if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
      brickGrid[brickIndexUnderBall] = false;
      brickCount--;
      endScore = brickCount; // variable for end score

      var prevBallX = ballX - ballSpeedX;
      var prevBallY = ballY - ballSpeedY;
      var prevBrickCol = Math.floor(prevBallX / BRICK_W);
      var prevBrickRow = Math.floor(prevBallY / BRICK_H);

      var bothTestFailed = true;

      if (prevBrickCol !== ballBrickCol) {
        if (isBrickAtColRow(prevBrickCol, ballBrickRow) == false) {
          ballSpeedX = -ballSpeedX;
          bothTestFailed = false;
        }
      }

      if (prevBrickRow !== ballBrickRow) {
        if (isBrickAtColRow(ballBrickCol, prevBrickRow) == false) {
          ballSpeedY = -ballSpeedY;
          bothTestFailed = false;
        }
      }

      if (bothTestFailed) {
        ballSpeedX = -ballSpeedX;
        ballSpeedY = -ballSpeedY;
      }
    }
  }
  if (brickCount === 0) {
    brickReset();
    updateScore(0); // Reset the score to 0 when all bricks are destroyed
  } else {
    updateScore(brickCount); // Update the score with the remaining brick count
  }
}

function updateScore(score) {
  var scoreElement = document.getElementById("score");
  scoreElement.textContent = "Bricks Remaining: " + score;

  if (score === 0) {
    showEndContainer(); // Show end container when score becomes 0
    showPlayAgainButton(); // Show play again button when score becomes 0
}
}

function paddleMove() {
  // paddle
  var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
  var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
  var paddleLeftEdgeX = paddleX;
  var paddleRightEdgeX = paddleX + PADDLE_WIDTH;
  if (
    ballY > paddleTopEdgeY && // top of paddle
    ballY < paddleBottomEdgeY && // bottom of paddle
    ballX > paddleLeftEdgeX && // left half of paddle
    ballX < paddleRightEdgeX // right half of paddle
  ) {
    ballSpeedY = -ballSpeedY;

    var paddleCenterX = paddleX + PADDLE_WIDTH / 2;
    var ballDistFromCenterX = ballX - paddleCenterX;
    ballSpeedX = ballDistFromCenterX * 0.35;

    if (brickCount == 0) {
      brickReset();
    }
  }
}

function movement() {
  ballMove();
  ballBrickColl();
  paddleMove();
}

function updateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;

  mouseX = evt.clientX - rect.left - root.scrollLeft;
  mouseY = evt.clientY - rect.top - root.scrollTop;

  paddleX = mouseX - PADDLE_WIDTH / 2;

}
function touchStart(evt) {
  var touch = evt.touches[0];
  mouseX = touch.clientX;
  mouseY = touch.clientY;
  evt.preventDefault(); // Prevent default touch event behavior
}

function touchMove(evt) {
  var touch = evt.touches[0];
  mouseX = touch.clientX;
  mouseY = touch.clientY;
  paddleX = mouseX - PADDLE_WIDTH / 2;
  evt.preventDefault(); // Prevent default touch event behavior
}


/**********GamePlay Draw functions***********/
function playArea() {
  // gameCanvas
  colorRect(0, 0, canvas.width, canvas.height, "white");
  // ball
  colorCircle();
  // paddle
  colorRect(
    paddleX,
    canvas.height - PADDLE_DIST_FROM_EDGE,
    PADDLE_WIDTH,
    PADDLE_THICKNESS,
    "black"
  );

  drawbricks();
}

function colorRect(leftX, topY, width, height, color) {
  canvasContext.fillStyle = color;
  canvasContext.fillRect(leftX, topY, width, height);
}

function colorText(showWords, textX, textY, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillText(showWords, textX, textY);
}

function rowColToArrayIndex(col, row) {
  return col + BRICK_COLS * row;
}

function drawbricks() {
  for (var eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
    for (var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
      var arrayIndex = rowColToArrayIndex(eachCol, eachRow);
      if (brickGrid[arrayIndex]) {
        colorRect(
          BRICK_W * eachCol,
          BRICK_H * eachRow,
          BRICK_W - BRICK_GAP,
          BRICK_H - BRICK_GAP,
          "green"
        );
      } // if brick
    } // each brick
  } // each brickrow
} // drawbricks

function colorCircle() {
  var gradient = canvasContext.createRadialGradient(
    ballX,
    ballY,
    0,
    ballX,
    ballY,
    10
  );
  gradient.addColorStop(0, "blue");
  gradient.addColorStop(0.5, "grey");
  gradient.addColorStop(1, "black");

  canvasContext.fillStyle = gradient;
  canvasContext.beginPath();
  canvasContext.arc(ballX, ballY, 10, 0, Math.PI * 2, true);
  canvasContext.fill();
}

function showEndContainer() {
if(endScore===0){
  endScore=70;
}
  document.getElementById("end-container").style.display = "flex";
  var remainingBricksElement = document.getElementById("remaining-bricks");
  remainingBricksElement.textContent = "Your Score: " + (70 - endScore); 
}

function hideEndContainer() {
  document.getElementById("end-container").style.display = "none";
}

function showPlayAgainButton() {
  document.getElementById("play-again-button").style.display = "block";
}

function hidePlayAgainButton() {
  document.getElementById("play-again-button").style.display = "none";
}

function setupPlayAgainButton() {
  document.getElementById("play-again-button").addEventListener("click", function () {
      hideEndContainer();
      hidePlayAgainButton();
      ballRest();
      brickReset();
  });
}


