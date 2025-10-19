CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY,
  player1 TEXT,
  player2 TEXT,
  winner TEXT,
  duration_seconds INTEGER,
  moves JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
