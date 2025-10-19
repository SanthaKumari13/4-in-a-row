// db.js
require('dotenv').config();
const { Pool } = require('pg');

function makePool() {
  const url = process.env.DATABASE_URL;

  // Case 1: DATABASE_URL present — parse it
  if (url && url.trim() !== '') {
    try {
      const u = new URL(url);
      const config = {
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        host: u.hostname,
        port: u.port ? Number(u.port) : 5432,
        database: u.pathname.replace(/^\//, ''),
      };
      return new Pool(config);
    } catch (err) {
      console.error('Invalid DATABASE_URL:', err.message);
      return new Pool({ connectionString: url });
    }
  }

  // Case 2: Use separate PG environment variables
  return new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    database: process.env.PGDATABASE,
  });
}

const pool = makePool();

async function getLeaderboard() {
  const res = await pool.query('SELECT username, wins FROM players ORDER BY wins DESC LIMIT 20');
  return res.rows;
}

async function saveGame({ id, player1, player2, winner, duration_seconds, moves, created_at }) {
  const q = `
    INSERT INTO games (id, player1, player2, winner, duration_seconds, moves, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
  `;
  await pool.query(q, [id, player1, player2, winner, duration_seconds, moves, created_at]);
}

async function incrementWins(username) {
  await pool.query(
    `INSERT INTO players (username, wins)
     VALUES ($1,1)
     ON CONFLICT (username) DO UPDATE SET wins = players.wins + 1`,
    [username]
  );
}

module.exports = { getLeaderboard, saveGame, incrementWins, pool };
