// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Manager = require('./manager');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const manager = new Manager();

// simple HTTP endpoints
app.get('/', (req, res) => res.send('4-in-a-row backend running'));
app.get('/leaderboard', async (req, res) => {
  try {
    const rows = await db.getLeaderboard();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// On websocket connection: expect ?username=xxx or later send join msg
wss.on('connection', (ws, req) => {
  // allow client to send initial join message or provide username query param
  const params = new URLSearchParams(req.url.replace(/^.*\?/, ''));
  const queryUsername = params.get('username');

  let attached = false;
  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    if (!attached) {
      // support either join message or query param
      if (msg.type === 'join' || queryUsername) {
        const username = msg.type === 'join' ? msg.username : queryUsername;
        if (!username) {
          ws.send(JSON.stringify({ type: 'error', message: 'username required' }));
          return;
        }
        manager.attach(ws, username);
        attached = true;
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'send join message first' }));
      }
      return;
    }
    // If attached, pass messages to manager
    manager.handleMessage(ws, msg);
  });

  ws.on('close', () => {
    manager.handleDisconnect(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
