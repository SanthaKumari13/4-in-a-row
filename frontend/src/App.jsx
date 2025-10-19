import React, { useEffect, useRef, useState } from 'react';

const BACKEND_WS = (username) => `ws://localhost:8080/?username=${encodeURIComponent(username)}`;
const BACKEND_HTTP = 'http://localhost:8080';

const EMPTY = null;
const ROWS = 6;
const COLS = 7;

function createEmptyBoard() {
  const b = [];
  for (let r = 0; r < ROWS; r++) b[r] = new Array(COLS).fill(EMPTY);
  return b;
}

function Slot({ value }) {
  let cls = 'slot';
  if (value === 'R') cls += ' player1';
  if (value === 'Y') cls += ' player2';
  return <div className="slot">{/* empty visual handled by css */}</div>;
}

export default function App() {
  const [username, setUsername] = useState('');
  const [ws, setWs] = useState(null);
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [board, setBoard] = useState(createEmptyBoard());
  const [status, setStatus] = useState('Not connected');
  const [gameId, setGameId] = useState(null);
  const [yourTurn, setYourTurn] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
    const t = setInterval(fetchLeaderboard, 10_000);
    return () => clearInterval(t);
  }, []);

  function fetchLeaderboard() {
    fetch(`${BACKEND_HTTP}/leaderboard`).then(r => r.json()).then(data => {
      setLeaders(data || []);
    }).catch(()=>{});
  }

  function connect() {
    if (!username) return alert('Enter username first');
    const socket = new WebSocket(BACKEND_WS(username));
    wsRef.current = socket;
    socket.onopen = () => {
      setConnected(true);
      setStatus('Connected — waiting for game');
      console.log('ws open');
    };
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      handleServerMessage(msg);
    };
    socket.onclose = () => {
      setConnected(false);
      setStatus('Disconnected');
    };
    socket.onerror = (err) => {
      console.error('ws error', err);
      setStatus('WebSocket error');
    };
    setWs(socket);
  }

  function handleServerMessage(msg) {
    // messages: waiting, game_start, move_made, your_turn, game_end, opponent_disconnected, forfeit, reconnect_ok
    if (msg.type === 'waiting') {
      setStatus(msg.message || 'Waiting');
    } else if (msg.type === 'game_start') {
      setGameId(msg.gameId);
      setOpponent(msg.opponent);
      setStatus(`Game started vs ${msg.opponent}`);
      setBoard(createEmptyBoard());
      setYourTurn(!!msg.yourTurn);
    } else if (msg.type === 'move_made') {
      // board may be provided as nested arrays or object
      if (msg.board) {
        setBoard(normalizeBoard(msg.board));
      }
      setYourTurn(msg.nextTurn ? (msg.nextTurn === (username === msg.player ? 'BOT' : username)) : !yourTurn);
      // if server sends nextTurn as player name we could adapt
    } else if (msg.type === 'your_turn') {
      setYourTurn(true);
      setStatus('Your turn');
    } else if (msg.type === 'game_end') {
      if (msg.winner) {
        setStatus(msg.winner === username ? 'You won! 🎉' : `You lost — ${msg.winner} won`);
      } else if (msg.draw) setStatus('Game ended in a draw');
      else setStatus('Game over');
      fetchLeaderboard();
      // board update
      if (msg.board) setBoard(normalizeBoard(msg.board));
      setYourTurn(false);
    } else if (msg.type === 'forfeit') {
      setStatus(`${msg.winner} won by forfeit`);
      setYourTurn(false);
      fetchLeaderboard();
    } else if (msg.type === 'opponent_disconnected') {
      setStatus(`Opponent ${msg.username} disconnected — waiting to reconnect`);
    } else if (msg.type === 'reconnect_ok') {
      setGameId(msg.gameId);
      setBoard(normalizeBoard(msg.board));
      setStatus('Reconnected to game');
      setYourTurn(msg.turn === username);
    } else {
      console.log('unknown msg', msg);
    }
  }

  function normalizeBoard(b) {
    // server might send grid as objects or simple arrays; convert to R/Y/NULL scheme
    // Our backend used 'R' for player1 and 'Y' for player2 in game.js; if it used numbers, adapt here.
    // If backend sends nested arrays of null / 'R' / 'Y', just return
    return b;
  }

  function sendDrop(col) {
    if (!wsRef.current || wsRef.current.readyState !== 1) return alert('Not connected');
    if (!yourTurn) return alert('Not your turn');
    wsRef.current.send(JSON.stringify({ type: 'drop', col }));
  }

  function renderBoard() {
    // board is ROWS x COLS array, row 0 top
    return (
      <div>
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => sendDrop(0)} className="col-button">0</button>
          <button onClick={() => sendDrop(1)} className="col-button">1</button>
          <button onClick={() => sendDrop(2)} className="col-button">2</button>
          <button onClick={() => sendDrop(3)} className="col-button">3</button>
          <button onClick={() => sendDrop(4)} className="col-button">4</button>
          <button onClick={() => sendDrop(5)} className="col-button">5</button>
          <button onClick={() => sendDrop(6)} className="col-button">6</button>
        </div>
        <div className="board">
          {board.flat().map((cell, idx) => (
            <div key={idx} className="cell">
              <div className={cell === 'R' ? 'slot player1' : cell === 'Y' ? 'slot player2' : 'slot'} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <div style={{flex:1}}>
          <div className="controls">
            <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
            <button onClick={connect} disabled={connected}>Connect</button>
            <span style={{marginLeft:12}}>{status}</span>
          </div>
          <div style={{marginTop:12}}>
            {gameId ? <strong>Game ID: {gameId}</strong> : null}
            {opponent ? <span style={{marginLeft:10}}>Opponent: {opponent}</span> : null}
          </div>
        </div>

        <div className="leaderboard">
          <h4>Leaderboard</h4>
          <ol>
            {leaders.map(l => <li key={l.username}>{l.username} — {l.wins}</li>)}
          </ol>
        </div>
      </div>

      <div style={{display:'flex', gap:20}}>
        <div>
          {renderBoard()}
        </div>
      </div>

      <div className="info">
        <div>Tip: Click column numbers to drop disc. When you connect alone, bot will start after 10s.</div>
      </div>

      <div className="footer">
        Built for Emitrr intern assignment — WebSocket backend expected at <code>{BACKEND_HTTP}</code>.
      </div>
    </div>
  );
}
