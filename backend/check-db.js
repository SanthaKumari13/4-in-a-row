// check-db.js
require('dotenv').config();
const { pool } = require('./db');

(async () => {
  try {
    const r = await pool.query('SELECT NOW() as now');
    console.log('Postgres connected. time:', r.rows[0].now);
    await pool.end();
  } catch (err) {
    console.error('Postgres connection failed:', err.message || err);
    process.exit(1);
  }
})();
