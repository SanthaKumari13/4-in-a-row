// game.js
const { createBoard, dropDisc, checkWinner, isBoardFull } = require('./gameLogic');
const { incrementWins, saveGame } = require('./db');
const { v4: uuidv4 } = require('uuid');

class Game {
  constructor(player1, player2, isBot = false) {
    this.id = uuidv4();
    this.board = createBoard();
    this.players = [player1, player2];
    this.symbols = { [player1.username]: 'R', [player2.username]: 'Y' };
    this.currentTurn = player1.username;
    this.isBot = isBot;
    this.createdAt = Date.now();
    this.moves = [];
    this.finished = false;
  }

  getOpponent(username) {
    return this.players.find(p => p.username !== username);
  }

  makeMove(username, col) {
    if (this.finished) return { error: 'Game already finished.' };
    if (username !== this.currentTurn) return { error: 'Not your turn!' };

    const symbol = this.symbols[username];
    const drop = dropDisc(this.board, col, symbol);

    if (!drop) return { error: 'Column full!' };

    this.moves.push({ player: username, col, time: Date.now() });

    // Check win
    if (checkWinner(this.board, symbol)) {
      this.finished = true;
      const duration = Math.floor((Date.now() - this.createdAt) / 1000);
      saveGame({
        id: this.id,
        player1: this.players[0].username,
        player2: this.players[1].username,
        winner: username,
        duration_seconds: duration,
        moves: JSON.stringify(this.moves),
        created_at: new Date(this.createdAt),
      });
      incrementWins(username);
      return { winner: username };
    }

    // Check draw
    if (isBoardFull(this.board)) {
      this.finished = true;
      const duration = Math.floor((Date.now() - this.createdAt) / 1000);
      saveGame({
        id: this.id,
        player1: this.players[0].username,
        player2: this.players[1].username,
        winner: null,
        duration_seconds: duration,
        moves: JSON.stringify(this.moves),
        created_at: new Date(this.createdAt),
      });
      return { draw: true };
    }

    // Switch turn
    this.currentTurn = this.getOpponent(username).username;

    return { ok: true, board: this.board, nextTurn: this.currentTurn };
  }
}

module.exports = Game;
