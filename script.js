const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const grid = 30;
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
let board = Array(20).fill(null).map(() => Array(10).fill(0));
let currentTetromino;
let currentPosition;
let currentColor;
let level = 1;
let pointsToNextLevel = 1000;
let dropInterval = 1000; // milliseconds
let lastDropTime = 0;
let levelScore = 0; // Очки на рівні

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

function collide() {
    for (let y = 0; y < currentTetromino.length; y++) {
        for (let x = 0; x < currentTetromino[y].length; x++) {
            if (currentTetromino[y][x] && (board[currentPosition.y + y] && board[currentPosition.y + y][currentPosition.x + x]) !== 0) {
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
                board[currentPosition.y + y][currentPosition.x + x] = colors.indexOf(currentColor) + 1;
            }
        }
    }
}

function rotate() {
    const temp = currentTetromino;
    currentTetromino = currentTetromino[0].map((_, i) => currentTetromino.map(row => row[i])).reverse();
    if (collide()) {
        currentTetromino = temp;
    }
}

function move(dir) {
    currentPosition.x += dir;
    if (collide()) {
        currentPosition.x -= dir;
    }
}

function drop() {
    currentPosition.y++;
    if (collide()) {
        currentPosition.y--;
        mergeTetromino();
        checkLines();
        spawnTetromino();
    }
}

function checkLines() {
    for (let y = board.length - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(board[0].length).fill(0));
            levelScore += 100;
            updateLevel();
        }
    }
}

function updateLevel() {
    const newLevel = Math.floor(levelScore / pointsToNextLevel) + 1;
    if (newLevel > level) {
        level = newLevel;
        pointsToNextLevel *= 2; // Подвоюємо кількість очок для переходу на наступний рівень
        dropInterval = Math.max(100, 1000 - level * 50); // Зменшення інтервалу до мінімуму 100 мс
        clearBoard(); // Очистка ігрового поля при переході на новий рівень
        levelScore = 0; // Обнулення очок на рівні
    }
}

function clearBoard() {
    board = Array(20).fill(null).map(() => Array(10).fill(0));
}

function spawnTetromino() {
    const index = Math.floor(Math.random() * tetrominoes.length);
    currentTetromino = tetrominoes[index];
    currentColor = colors[index];
    currentPosition = { x: Math.floor(board[0].length / 2) - Math.floor(currentTetromino[0].length / 2), y: 0 };
    if (collide()) {
        // Game over
        board = Array(20).fill(null).map(() => Array(10).fill(0));
        level = 1;
        pointsToNextLevel = 1000;
        dropInterval = 1000;
        levelScore = 0;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowDown') drop();
    if (e.key === 'ArrowUp') rotate();
});

function updateInfo() {
    document.getElementById('score').textContent = `Score: ${levelScore}`;
    document.getElementById('level').textContent = `Level: ${level}`;
    document.getElementById('nextLevel').textContent = `Points to next level: ${pointsToNextLevel}`;
}

function gameLoop(timestamp) {
    if (timestamp - lastDropTime > dropInterval) {
        drop();
        lastDropTime = timestamp;
    }
    drawBoard();
    drawTetromino();
    updateInfo();
    requestAnimationFrame(gameLoop);
}

spawnTetromino();
requestAnimationFrame(gameLoop);
