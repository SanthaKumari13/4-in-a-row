# 🎯 4 in a Row — Real-time Multiplayer Game

A backend-driven real-time version of **Connect Four**, built using **Node.js**, **WebSockets**, **PostgreSQL**, and **React (Vite)**.  
This project fulfills the **Backend Engineering Intern Assignment**.

---

## 🌐 Live Demo

🎮 **Frontend (Play the Game):** [https://four-in-a-row-frontend.onrender.com](https://four-in-a-row-frontend.onrender.com)  
⚙️ **Backend (API / WebSocket Server):** [https://four-in-a-row-jmur.onrender.com](https://four-in-a-row-jmur.onrender.com)  
💻 **GitHub Repository:** [https://github.com/SanthaKumari13/4-in-a-row](https://github.com/SanthaKumari13/4-in-a-row)

---

## 🧠 Features

- Real-time multiplayer gameplay via WebSockets  
- Automatic matchmaking (vs player or competitive bot)  
- Smart bot logic for blocking and winning  
- Persistent game results and leaderboard  
- Reconnection support within 30 seconds  
- Clean and simple frontend UI built with React + Vite  

---

## ⚙️ Run Locally

### 1️⃣ Backend Setup
```bash
cd backend
npm install
npm run dev
```
The server runs on **http://localhost:10000**

---

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on **http://localhost:5173**

Add this in `.env` inside the frontend directory:
```
VITE_BACKEND_URL=http://localhost:10000
```

---

## 🧾 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React (Vite), WebSockets |
| **Backend** | Node.js, Express, WebSocket (ws), KafkaJS |
| **Database** | PostgreSQL |
| **Hosting** | Render (Frontend + Backend) |

---

## 👩‍💻 Author

**Santha Kumari**  
📧 **Email:** [2200032521cseh@gmail.com](mailto:2200032521cseh@gmail.com)  
🌐 **GitHub:** [https://github.com/SanthaKumari13](https://github.com/SanthaKumari13)

---

### 🧩 Assignment Requirements

- **Application Hosting:** ✅ Live app running on Render  
- **README File:** ✅ Includes setup instructions and live URLs  
- **GitHub Code:** ✅ Full code for frontend and backend available in this repo  

---

🚀 *Thank you for reviewing this submission!*  
Enjoy playing **4 in a Row** live at:  
👉 [https://four-in-a-row-frontend.onrender.com](https://four-in-a-row-frontend.onrender.com)
