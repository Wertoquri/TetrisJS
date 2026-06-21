const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextContext = nextCanvas.getContext('2d');
const grid = 30;
const previewGrid = 24;
const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 0, 0], [1, 1, 1]], // J
    [[0, 0, 1], [1, 1, 1]]  // L
];

const colors = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];
let board = createBoard();
let currentTetromino;
let currentPosition;
let currentColor;
let currentIndex;
let nextIndex;
let score = 0;
let linesCleared = 0;
let level = 1;
let dropInterval = 1000;
let lastDropTime = 0;
let gameOver = false;

function createBoard() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
}

function cloneTetromino(tetromino) {
    return tetromino.map(row => row.slice());
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x]) {
                context.fillStyle = colors[board[y][x] - 1];
                context.fillRect(x * grid, y * grid, grid, grid);
                context.strokeStyle = '#fff';
                context.strokeRect(x * grid, y * grid, grid, grid);
            }
        }
    }
}

function drawTetromino() {
    if (!currentTetromino || gameOver) return;
    for (let y = 0; y < currentTetromino.length; y++) {
        for (let x = 0; x < currentTetromino[y].length; x++) {
            if (currentTetromino[y][x]) {
                context.fillStyle = currentColor;
                context.fillRect((currentPosition.x + x) * grid, (currentPosition.y + y) * grid, grid, grid);
                context.strokeStyle = '#fff';
                context.strokeRect((currentPosition.x + x) * grid, (currentPosition.y + y) * grid, grid, grid);
            }
        }
    }
}

function drawPreview() {
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextIndex === undefined) return;

    const preview = tetrominoes[nextIndex];
    const offsetX = Math.floor((4 - preview[0].length) / 2) * previewGrid + previewGrid / 2;
    const offsetY = Math.floor((4 - preview.length) / 2) * previewGrid + previewGrid / 2;

    for (let y = 0; y < preview.length; y++) {
        for (let x = 0; x < preview[y].length; x++) {
            if (preview[y][x]) {
                nextContext.fillStyle = colors[nextIndex];
                nextContext.fillRect(offsetX + x * previewGrid, offsetY + y * previewGrid, previewGrid, previewGrid);
                nextContext.strokeStyle = '#fff';
                nextContext.strokeRect(offsetX + x * previewGrid, offsetY + y * previewGrid, previewGrid, previewGrid);
            }
        }
    }
}

function collide(shape = currentTetromino, position = currentPosition) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (!shape[y][x]) continue;

            const boardY = position.y + y;
            const boardX = position.x + x;

            if (boardX < 0 || boardX >= board[0].length || boardY >= board.length) {
                return true;
            }

            if (boardY >= 0 && board[boardY][boardX]) {
                return true;
            }
        }
    }

    return false;
}

function mergeTetromino() {
    for (let y = 0; y < currentTetromino.length; y++) {
        for (let x = 0; x < currentTetromino[y].length; x++) {
            if (currentTetromino[y][x]) {
                const boardY = currentPosition.y + y;
                const boardX = currentPosition.x + x;
                if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
                    board[boardY][boardX] = currentIndex + 1;
                }
            }
        }
    }
}

function rotateTetromino(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
}

function rotate() {
    if (gameOver) return;
    const rotated = rotateTetromino(currentTetromino);
    const kickOffsets = [0, 1, -1, 2, -2];

    for (const offset of kickOffsets) {
        const testPosition = { x: currentPosition.x + offset, y: currentPosition.y };
        if (!collide(rotated, testPosition)) {
            currentTetromino = rotated;
            currentPosition = testPosition;
            return;
        }
    }
}

function move(dir) {
    if (gameOver) return;
    const testPosition = { x: currentPosition.x + dir, y: currentPosition.y };
    if (!collide(currentTetromino, testPosition)) {
        currentPosition = testPosition;
    }
}

function drop() {
    if (gameOver) return;
    const testPosition = { x: currentPosition.x, y: currentPosition.y + 1 };

    if (!collide(currentTetromino, testPosition)) {
        currentPosition = testPosition;
        return;
    }

    mergeTetromino();
    const clearedLines = checkLines();
    updateScore(clearedLines);
    spawnTetromino();
}

function hardDrop() {
    if (gameOver) return;

    while (true) {
        const testPosition = { x: currentPosition.x, y: currentPosition.y + 1 };
        if (collide(currentTetromino, testPosition)) {
            break;
        }
        currentPosition = testPosition;
    }

    mergeTetromino();
    const clearedLines = checkLines();
    updateScore(clearedLines);
    spawnTetromino();
    lastDropTime = performance.now();
}

function checkLines() {
    let lines = 0;

    for (let y = board.length - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(board[0].length).fill(0));
            lines += 1;
            y += 1;
        }
    }

    return lines;
}

function updateScore(lines) {
    if (lines === 0) return;

    const linePoints = [0, 100, 300, 500, 800];
    score += linePoints[lines] || lines * 250;
    linesCleared += lines;

    const requiredLines = level * 10;
    if (linesCleared >= requiredLines) {
        level += 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    }
}

function updateInfo() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('level').textContent = `Level: ${level}`;
    document.getElementById('lines').textContent = `Lines: ${linesCleared}`;
    document.getElementById('nextLevel').textContent = `Lines to next level: ${Math.max(0, level * 10 - linesCleared)}`;
    document.getElementById('gameOver').classList.toggle('hidden', !gameOver);
}

function spawnTetromino() {
    if (nextIndex === undefined) {
        nextIndex = Math.floor(Math.random() * tetrominoes.length);
    }

    currentIndex = nextIndex;
    nextIndex = Math.floor(Math.random() * tetrominoes.length);
    currentTetromino = cloneTetromino(tetrominoes[currentIndex]);
    currentColor = colors[currentIndex];
    currentPosition = {
        x: Math.floor(board[0].length / 2) - Math.floor(currentTetromino[0].length / 2),
        y: 0
    };

    if (collide()) {
        gameOver = true;
    }
}

function resetGame() {
    board = createBoard();
    score = 0;
    linesCleared = 0;
    level = 1;
    dropInterval = 1000;
    lastDropTime = 0;
    gameOver = false;
    nextIndex = Math.floor(Math.random() * tetrominoes.length);
    spawnTetromino();
    updateInfo();
    drawPreview();
}

document.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowDown') drop();
    if (e.key === 'ArrowUp') rotate();
    if (e.key === ' ') hardDrop();
    if (gameOver && e.key === 'Enter') resetGame();
});

function drawGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.65)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '28px Arial';
    context.textAlign = 'center';
    context.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
    context.font = '18px Arial';
    context.fillText('Press Enter to restart', canvas.width / 2, canvas.height / 2 + 24);
}

function gameLoop(timestamp) {
    if (!gameOver && timestamp - lastDropTime > dropInterval) {
        drop();
        lastDropTime = timestamp;
    }

    drawBoard();
    drawTetromino();
    drawPreview();
    updateInfo();

    if (gameOver) {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

resetGame();
requestAnimationFrame(gameLoop);
