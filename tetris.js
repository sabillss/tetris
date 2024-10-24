const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 15;
const COLS = 10;
const BLOCK_SIZE = 30;

// Definisikan warna untuk setiap bentuk
const shapeColors = [
    '#664c65', // O shape
    '#f63e7b',   // I shape
    '#3cacae', // T shape
    '#fbd160',  // S shape
    '#898989',    // Z shape
    '#776391',   // J shape
    '#bc3a41'  // L shape
];

const shapes = [
    // O shape
    [[1, 1],
     [1, 1]],
    
    // I shape
    [[0, 0, 0, 0],
     [1, 1, 1, 1]],
    
    // T shape
    [[0, 1, 0],
     [1, 1, 1]],
    
    // S shape
    [[0, 1, 1],
     [1, 1, 0]],
    
    // Z shape
    [[1, 1, 0],
     [0, 1, 1]],
    
    // J shape
    [[1, 0, 0],
     [1, 1, 1]],
    
    // L shape
    [[0, 0, 1],
     [1, 1, 1]]
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentShape, currentX, currentY, currentColor;
let gameInterval;
let score = 0;
let playerName = '';

function drawGrayBackground() {
    ctx.fillStyle = '#E6E6FA'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar grid
    ctx.strokeStyle = '#4B0082'; 
    ctx.lineWidth = 1;

    // Gambar garis horizontal
    for (let y = 0; y <= canvas.height; y += BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Gambar garis vertikal
    for (let x = 0; x <= canvas.width; x += BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

// Menggambar blok dengan warna tertentu
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Menggambar papan permainan
function drawBoard() {
    drawGrayBackground(); // Gambar latar belakang abu-abu dengan grid terlebih dahulu
    board.forEach((row, y) => row.forEach((color, x) => {
        if (color) drawBlock(x, y, color);
    }));
}

// Menggambar bentuk saat ini
function drawShape() {
    currentShape.forEach((row, y) => row.forEach((value, x) => {
        if (value) drawBlock(currentX + x, currentY + y, currentColor);
    }));
}

// Memutar bentuk
function rotateShape() {
    const rotated = currentShape[0].map((_, i) => currentShape.map(row => row[i]).reverse());
    if (isValidPosition(rotated, currentX, currentY)) {
        currentShape = rotated;
    }
}

// Mengecek apakah posisi bentuk valid
function isValidPosition(shape, offsetX, offsetY) {
    return shape.every((row, y) => row.every((value, x) => {
        const newX = offsetX + x;
        const newY = offsetY + y;
        return value === 0 || (newX >= 0 && newX < COLS && newY < ROWS && board[newY][newX] === null);
    }));
}

// Menempatkan bentuk pada papan
function placeShape() {
    currentShape.forEach((row, y) => row.forEach((value, x) => {
        if (value) board[currentY + y][currentX + x] = currentColor;
    }));
    clearFullRows();
    currentShape = shapes[Math.floor(Math.random() * shapes.length)];
    currentColor = shapeColors[shapes.indexOf(currentShape)];
    currentX = Math.floor(COLS / 2) - Math.floor(currentShape[0].length / 2);
    currentY = 0;
    if (!isValidPosition(currentShape, currentX, currentY)) {
        clearInterval(gameInterval);
        
        // Mainkan suara game over
        const gameOverSound = document.getElementById('gameOverSound');
        gameOverSound.play();

        // Simpan skor
        saveScore();

        // Tampilkan pesan game over dan tombol replay
        alert(`Game Over\nNama Pemain: ${playerName}\nSkor: ${score}`);
        document.getElementById('replayButton').style.display = 'block'; // Tampilkan tombol replay
    }
    
}

function replayGame() {
    // Sembunyikan tombol replay
    document.getElementById('replayButton').style.display = 'none';
    startGame(); // Panggil fungsi startGame untuk memulai permainan kembali


}
document.getElementById('replayButton').addEventListener('click', replayGame);

// Menyimpan skor jika lebih tinggi dari skor tertinggi
function saveScore() {
    const highScore = localStorage.getItem('highScore') || 0;
    if (score > highScore) {
        localStorage.setItem('highScore', score);
    }
}

// Mengambil skor tertinggi
function loadHighScore() {
    return localStorage.getItem('highScore') || 0;
}



// Menghapus baris yang penuh
function clearFullRows() {
    let newBoard = board.filter(row => row.some(cell => cell === null));
    const linesCleared = ROWS - newBoard.length;
    
    // Tambah baris kosong di atas papan jika ada baris yang dihapus
    while (newBoard.length < ROWS) {
        newBoard.unshift(Array(COLS).fill(null));
    }
    board = newBoard;
    
    // Tambah skor berdasarkan jumlah baris yang dihapus
    score += linesCleared * 100; // Tambahkan skor per baris yang dihapus
    updateScore();

    // Mainkan suara hapus baris
    if (linesCleared > 0) {
        const lineClearSound = document.getElementById('lineClearSound');
        lineClearSound.play();
}
}
// Menggambar permainan
function draw() {
    drawBoard();
    drawShape();
}

// Memindahkan bentuk ke bawah
function moveShapeDown() {
    if (isValidPosition(currentShape, currentX, currentY + 1)) {
        currentY++;
    } else {
        placeShape();
    }
    draw();
}

// Loop permainan
function gameLoop() {
    moveShapeDown();
    draw();
}

// Memulai permainan
function startGame() {
    playerName = document.getElementById('nameInput').value.trim(); // Ambil nama pemain dari input dan hapus spasi

    // Validasi input nama
    if (playerName === '') {
        alert('Silakan masukkan nama pemain!');
        return; // Hentikan eksekusi fungsi jika nama kosong
    }

    document.getElementById('playerName').textContent = `Player: ${playerName}`;
     
    score = 0; // Inisialisasi skor saat memulai permainan
    updateScore(); // Tampilkan skor awal
    document.getElementById('highScore').textContent = `Skor Tertinggi: ${loadHighScore()}`;


    
    // Tampilkan canvas dan sembunyikan layar start
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('startScreen').style.display = 'none';

    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    currentShape = shapes[Math.floor(Math.random() * shapes.length)];
    currentColor = shapeColors[shapes.indexOf(currentShape)];
    currentX = Math.floor(COLS / 2) - Math.floor(currentShape[0].length / 2);
    currentY = 0;
    gameInterval = setInterval(gameLoop, 500);
}


// Memperbarui skor
function updateScore() {
    document.getElementById('score').innerText = `Score: ${score.toString().padStart(5, ' ')}`;
}

// Event listeners untuk tombol dan keyboard
document.getElementById('startButton').addEventListener('click', startGame);


document.addEventListener('keydown', (event) => {
    if (!gameInterval) return; // Hanya tangani input saat permainan aktif
    if (event.key === 'ArrowLeft' && isValidPosition(currentShape, currentX - 1, currentY)) {
        currentX--;
    } else if (event.key === 'ArrowRight' && isValidPosition(currentShape, currentX + 1, currentY)) {
        currentX++;
    } else if (event.key === 'ArrowDown') {
        moveShapeDown();
    } else if (event.key === 'ArrowUp') {
        rotateShape();
    }
    draw();
});