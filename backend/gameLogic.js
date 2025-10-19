// gameLogic.js
const ROWS = 6;
const COLS = 7;
const EMPTY = null;

// Create an empty 7x6 board
function createBoard() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = new Array(COLS).fill(EMPTY);
  }
  return board;
}

// Drop a disc into a column
function dropDisc(board, col, symbol) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      board[row][col] = symbol;
      return { row, col };
    }
  }
  return null; // column full
}

// Check if board is full
function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== EMPTY));
}

// Check 4-in-a-row (horizontal, vertical, diagonal)
function checkWinner(board, symbol) {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === symbol &&
        board[r][c + 1] === symbol &&
        board[r][c + 2] === symbol &&
        board[r][c + 3] === symbol
      ) return true;
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (
        board[r][c] === symbol &&
        board[r + 1][c] === symbol &&
        board[r + 2][c] === symbol &&
        board[r + 3][c] === symbol
      ) return true;
    }
  }

  // Diagonal ↘
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === symbol &&
        board[r + 1][c + 1] === symbol &&
        board[r + 2][c + 2] === symbol &&
        board[r + 3][c + 3] === symbol
      ) return true;
    }
  }

  // Diagonal ↙
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === symbol &&
        board[r - 1][c + 1] === symbol &&
        board[r - 2][c + 2] === symbol &&
        board[r - 3][c + 3] === symbol
      ) return true;
    }
  }

  return false;
}

module.exports = { createBoard, dropDisc, checkWinner, isBoardFull, ROWS, COLS };
