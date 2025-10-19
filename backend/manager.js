// manager.js
const { v4: uuidv4 } = require('uuid');
const Game = require('./game');
const { chooseMove } = require('./bot');
const kafka = require('./kafkaProducer');
const db = require('./db');

class Manager {
  constructor() {
    this.waiting = null; // { username, ws, timer }
    this.games = new Map(); // gameId -> Game instance
    this.connToSession = new Map(); // ws -> { gameId, username }
  }

  attach(ws, username) {
    ws.username = username;
    ws.sendJSON = (obj) => {
      try { ws.send(JSON.stringify(obj)); } catch (e) {}
    };
    this.joinQueue(ws, username);
  }

  joinQueue(ws, username) {
    if (this.waiting == null) {
      console.log(`${username} waiting for opponent...`);
      const timer = setTimeout(() => {
        if (this.waiting && this.waiting.ws === ws) {
          this.createGame(this.waiting, null); // null means play vs BOT
          this.waiting = null;
        }
      }, 10000);
      this.waiting = { username, ws, timer };
      ws.sendJSON({ type: 'waiting', message: 'Waiting for opponent (10s before bot match)...' });
    } else {
      const other = this.waiting;
      clearTimeout(other.timer);
      this.waiting = null;
      this.createGame(other, { username, ws });
    }
  }

  createGame(p1, p2) {
    const game = new Game(p1, p2 || { username: 'BOT' }, !p2);
    this.games.set(game.id, game);
    this.connToSession.set(p1.ws, { gameId: game.id, username: p1.username });
    if (p2) this.connToSession.set(p2.ws, { gameId: game.id, username: p2.username });

    // Send start messages
    p1.ws.sendJSON({
      type: 'game_start',
      gameId: game.id,
      you: p1.username,
      opponent: p2 ? p2.username : 'BOT',
      yourTurn: true
    });

    if (p2) {
      p2.ws.sendJSON({
        type: 'game_start',
        gameId: game.id,
        you: p2.username,
        opponent: p1.username,
        yourTurn: false
      });
    }

    kafka.produce('game-events', {
      event: 'game_start',
      gameId: game.id,
      players: [p1.username, p2 ? p2.username : 'BOT'],
      ts: new Date().toISOString()
    });

    console.log(`🎮 Game ${game.id} created between ${p1.username} and ${p2 ? p2.username : 'BOT'}`);
  }

  async handleMessage(ws, msg) {
    const map = this.connToSession.get(ws);

    if (!map && msg.type !== 'reconnect') {
      ws.sendJSON({ type: 'error', message: 'Not in a game' });
      return;
    }

    switch (msg.type) {
      case 'drop':
        await this.handleDrop(ws, msg.col);
        break;
      case 'ping':
        ws.sendJSON({ type: 'pong' });
        break;
      default:
        ws.sendJSON({ type: 'error', message: 'Unknown message type' });
    }
  }

  async handleDrop(ws, col) {
    const info = this.connToSession.get(ws);
    const game = this.games.get(info.gameId);
    if (!game) return ws.sendJSON({ type: 'error', message: 'Game not found' });

    const result = game.makeMove(info.username, col);

    if (result.error) {
      ws.sendJSON({ type: 'error', message: result.error });
      return;
    }

    // Broadcast move to both players
    this.broadcast(game, {
      type: 'move_made',
      player: info.username,
      col,
      board: game.board,
      nextTurn: result.nextTurn,
    });

    kafka.produce('game-events', {
      event: 'move_made',
      gameId: game.id,
      player: info.username,
      col,
      ts: new Date().toISOString()
    });

    if (result.winner) {
      this.broadcast(game, {
        type: 'game_end',
        winner: result.winner,
        board: game.board,
      });
      this.games.delete(game.id);
      return;
    }

    if (result.draw) {
      this.broadcast(game, { type: 'game_end', draw: true });
      this.games.delete(game.id);
      return;
    }

    // If playing vs bot
    if (game.isBot && result.nextTurn === 'BOT') {
      setTimeout(() => {
        const botCol = chooseMove(game.board);
        const botResult = game.makeMove('BOT', botCol);
        this.broadcast(game, {
          type: 'move_made',
          player: 'BOT',
          col: botCol,
          board: game.board,
          nextTurn: botResult.nextTurn,
        });

        if (botResult.winner) {
          this.broadcast(game, { type: 'game_end', winner: botResult.winner, board: game.board });
          this.games.delete(game.id);
        } else if (botResult.draw) {
          this.broadcast(game, { type: 'game_end', draw: true });
          this.games.delete(game.id);
        }
      }, 500);
    }
  }

  broadcast(game, msg) {
    for (const player of game.players) {
      if (player.ws) {
        try {
          player.ws.send(JSON.stringify(msg));
        } catch (e) {}
      }
    }
  }

  handleDisconnect(ws) {
    const info = this.connToSession.get(ws);
    if (!info) return;

    const game = this.games.get(info.gameId);
    if (!game) return;

    console.log(`${info.username} disconnected from ${info.gameId}`);
    const opponent = game.getOpponent(info.username);
    if (opponent.ws) {
      opponent.ws.sendJSON({ type: 'opponent_disconnected', username: info.username });
    }

    this.connToSession.delete(ws);
  }
}

module.exports = Manager;
