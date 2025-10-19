 Overview

This backend implements a real-time multiplayer Connect Four (4 in a Row) game using Node.js, WebSockets, and PostgreSQL.

Players can connect and play against:

Another player (1v1)

Or a bot opponent (if no player joins within 10 seconds)

The game logic, matchmaking, and board state are managed in-memory, while results are persisted in the PostgreSQL database.

 Features

Real-time multiplayer gameplay via WebSockets

Intelligent bot fallback when no player joins

Game state stored in-memory

Completed games stored in PostgreSQL

Reconnection-safe and extensible for analytics (Kafka stub included)

Lightweight and fast — ideal for production with minimal setup

 Tech Stack

Backend: Node.js (ESM)

Database: PostgreSQL

Realtime: WebSocket Server (ws)

Environment: dotenv

Server Framework: Express.js

 Environment Variables

Create a .env file in /backend:

PORT=8080
PGUSER=postgres
PGPASSWORD=1234
PGHOST=localhost
PGPORT=5432
PGDATABASE=fourinarow

 Folder Structure
backend/
│
├── db.js              # PostgreSQL connection setup
├── index.js           # Express + WebSocket server entry
├── game.js            # Core game session handler
├── gameLogic.js       # Board logic, win checks
├── manager.js         # Matchmaking and active game tracking
├── bot.js             # Bot opponent logic
├── migrations/
│   └── 001_init.sql   # Database schema
├── check-db.js        # Quick DB connectivity test
└── .env               # Environment variables

 Running the Server

Install dependencies

cd backend
npm install


Setup database

psql -U postgres -d fourinarow -f migrations/001_init.sql


Run server

npm run dev


Visit http://localhost:8080

🧠 Game Flow

Player connects via WebSocket.

If no opponent joins within 10 seconds → a bot is assigned.

Game board is updated in real-time for both players.

When a player connects 4 discs (vertically, horizontally, or diagonally), they win.

Game results are stored in PostgreSQL.

 Kafka (Optional)

A stub for Kafka producer is included at:

backend/kafkaProducer.js


If KAFKA_BROKERS is missing in .env, it automatically falls back to a console logger.

 Example API (HTTP)

GET / → Health check route

 Deployment

Configure environment variables on the server.

Ensure PostgreSQL is accessible.

Run:

npm start


The backend runs on port 8080 by default.

 Database Schema
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  player1 VARCHAR(20),
  player2 VARCHAR(20),
  winner VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

 Author

Muppiri Mary Santha Kumari 
Backend Engineering Intern Assignment — 4 in a Row
🔗 GitHub: https://github.com/SanthaKumari13