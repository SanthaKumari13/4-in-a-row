Overview

This frontend provides a simple playable UI for the 4 in a Row multiplayer game.

It connects directly to the WebSocket backend (ws://localhost:8080) and renders the 7×6 grid in real-time. Players can click on columns to drop discs, watch the opponent’s moves live, and see the game result.

Features

Real-time gameplay via WebSocket

7×6 Connect Four grid display

Supports player vs player and player vs bot

Displays game result and status dynamically

Minimalistic UI for clarity

 Tech Stack

HTML, CSS, Vanilla JavaScript

WebSocket client for real-time communication

 Folder Structure
frontend/
│
├── index.html   # UI markup
├── style.css    # Basic styling
└── script.js    # WebSocket and game interaction logic

 Running the Frontend

Serve locally using Live Server or any static server

cd frontend
npx serve


or simply open index.html in a browser.

Ensure the backend is running at:

ws://localhost:8080

 Gameplay

Once two players connect, the game begins.

Players alternate turns dropping discs.

First to connect 4 in a row wins!

Bot opponent appears if no player joins within 10 seconds.

 Leaderboard (Upcoming Feature)

Frontend can easily be extended to fetch and display leaderboard data via:

GET /leaderboard


(To be added in the backend.)

 Notes

Focused on functionality over styling.

Can be easily integrated into a React app later.

 Author

Muppuri Mary Santha Kumari
Frontend for Backend Engineering Intern Assignment — 4 in a Row
🔗 GitHub: https://github.com/SanthaKumari13