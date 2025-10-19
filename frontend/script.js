let ws;
let username = '';
let board = [];
const COLS = 7, ROWS = 6;

document.getElementById('connect-btn').onclick = connect;

function connect() {
  username = document.getElementById('username').value.trim();
  if (!username) return alert('Enter a username!');
  
  ws = new WebSocket('ws://localhost:8080');
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', username }));
    setStatus('Connecting...');
  };
  
  ws.onmessage = handleMessage;
  ws.onclose = () => setStatus('Disconnected.');
}

function handleMessage(event) {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'waiting':
      setStatus(data.message);
      break;

    case 'game_start':
      board = data.board || createBoard();
      renderBoard();
      setStatus(`Game started! Opponent: ${data.opponent}`);
      if (data.yourTurn) setStatus("Your turn!");
      break;

    case 'move_made':
      board = data.board;
      renderBoard();
      setStatus(`Next turn: ${data.nextTurn}`);
      break;

    case 'game_end':
      if (data.draw) setStatus("It's a draw!");
      else setStatus(`Winner: ${data.winner}`);
      break;

    case 'error':
      alert(data.message);
      break;
  }
}

function createBoard() {
  const b = [];
  for (let r = 0; r < ROWS; r++) {
    b[r] = new Array(COLS).fill(null);
  }
  return b;
}

function renderBoard() {
  const container = document.getElementById('board');
  container.innerHTML = '';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const val = board[r][c];
      if (val) cell.classList.add(val);
      cell.onclick = () => sendMove(c);
      container.appendChild(cell);
    }
  }
}

function sendMove(col) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'drop', col }));
  }
}

function setStatus(msg) {
  document.getElementById('status').innerText = msg;
}
