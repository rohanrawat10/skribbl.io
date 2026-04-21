# 🎨 Skribbl Clone

A real-time multiplayer drawing and guessing game 🚀.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socketdotio&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

---

## 🌐 Live Demo

🔗 **https://skribbl-io-1-frontend.onrender.com**


---

## 🎮 What is this?

Skribbl Clone is a real-time Pictionary-style game where:

- Players join a room — publicly via **Quick Play** or privately via **Room Code**
- Each round, one player draws a chosen word on a shared canvas
- Other players race to **guess the word** by typing in chat
- Correct guesses earn points — the faster you guess, the more points you get
- After all rounds, the player with the most points **wins**

---

## ✨ Features

### Gameplay
- ▶️ **Quick Play** — instantly joins any open room, or creates one if none exist
- 🏠 **Create Private Room** — fully configurable settings
- 🔑 **Join by Room Code** — share a 6-letter code with friends
- 🔄 **Turn-based rounds** — every player gets a turn to draw
- 🏆 **Scoring + Leaderboard** — points awarded based on guess speed
- 🎉 **Game Over screen** — winner announcement with final scores

### Drawing Tools
- 🖊️ Pen with 16 colors
- 📏 Adjustable brush size
- ⬜ Eraser tool
- ↩️ Undo last stroke
- 🗑️ Clear entire canvas
- 🔄 Real-time sync across all players

### Word System
- Drawer picks from N random words each round
- Others see blanks `_ _ _ _ _` until hints are revealed
- 🔤 Hints reveal letters progressively over time

### Room Settings
| Setting | Options |
|---|---|
| Rounds | 2 – 10 |
| Draw Time | 30 – 120 seconds |
| Max Players | 2 – 12 |
| Word Count | 1 – 5 choices per round |
| Hints | 0 – 5 reveals |

---

## 🏗️ Architecture

```
skribbl-clone/
│
├── server/                         ← Node.js + Express + Socket.IO
│   ├── index.js                    ← Server entry point, wires everything
│   ├── words.js                    ← Word list (100+ words)
│   ├── classes/                    ← OOP structure
│   │   ├── Player.js               ← Player class (id, name, score, state)
│   │   ├── Room.js                 ← Room class (players, settings, broadcast)
│   │   └── Game.js                 ← Game class (rounds, timer, scoring)
│   ├── controllers/                ← Socket event handlers
│   │   ├── roomController.js       ← create / join / leave / quick play
│   │   ├── gameController.js       ← word chosen / guess / chat
│   │   └── drawController.js       ← draw / undo / clear / history
│   ├── routes/
│   │   └── api.js                  ← REST endpoints (health, rooms)
│   └── utils/
│       └── gameUtils.js            ← helper functions (hints, scoring, words)
│
└── client/                         ← React + Vite
    └── src/
        ├── socket.js               ← single shared Socket.IO instance
        ├── App.jsx                 ← screen router (home → lobby → game)
        ├── pages/
        │   ├── Home.jsx            ← play / create / join screens
        │   ├── Lobby.jsx           ← waiting room with player list
        │   └── Game.jsx            ← main game screen
        └── components/
            ├── Canvas.jsx          ← HTML5 canvas + drawing tools
            ├── ChatBox.jsx         ← guess input + chat messages
            ├── PlayerList.jsx      ← scores sidebar
            ├── WordPicker.jsx      ← word selection popup (drawer only)
            ├── Timer.jsx           ← countdown with color indicator
            └── HintBar.jsx         ← _ _ a _ _ letter reveal
```

---

## 🔌 WebSocket Events

### Room & Lobby
| Event | Direction | Payload | Description |
|---|---|---|---|
| `quick_play` | Client → Server | `{ playerName }` | Join open room or create new |
| `create_room` | Client → Server | `{ playerName, settings }` | Create private room |
| `join_room` | Client → Server | `{ roomId, playerName }` | Join by room code |
| `room_created` | Server → Client | `{ room }` | Room created successfully |
| `room_joined` | Server → Client | `{ room }` | Joined room successfully |
| `player_joined` | Server → All | `{ players }` | New player joined |
| `player_left` | Server → All | `{ playerId, players }` | Player disconnected |
| `start_game` | Client → Server | `{}` | Host starts the game |

### Game State
| Event | Direction | Payload | Description |
|---|---|---|---|
| `game_started` | Server → All | `{ players }` | Game has begun |
| `round_start` | Server → All | `{ drawerId, drawerName, round, totalRounds }` | New round |
| `word_options` | Server → Drawer | `{ words }` | Word choices for drawer |
| `word_chosen` | Client → Server | `{ word }` | Drawer picked a word |
| `drawing_started` | Server → All | `{ drawerId, hint, wordLength }` | Drawing phase begins |
| `hint_update` | Server → All | `{ hint }` | New letter revealed |
| `timer_tick` | Server → All | `{ timeLeft }` | Every second countdown |
| `round_end` | Server → All | `{ word, scores }` | Round finished |
| `game_over` | Server → All | `{ winner, leaderboard }` | Game finished |

### Drawing
| Event | Direction | Payload | Description |
|---|---|---|---|
| `draw_start` | Client → Server | `{ x, y, color, size }` | Stroke started |
| `draw_move` | Client → Server | `{ x, y }` | Stroke continues |
| `draw_end` | Client → Server | `{}` | Stroke ended |
| `draw_data` | Server → All | `{ ...stroke }` | Broadcast stroke to everyone |
| `canvas_clear` | Client → Server | `{}` | Drawer clears canvas |
| `canvas_cleared` | Server → All | `{}` | Broadcast clear |
| `draw_undo` | Client → Server | `{}` | Undo last stroke |
| `undo_done` | Server → All | `{ drawHistory }` | Broadcast updated history |
| `request_draw_history` | Client → Server | `{}` | Catch up on join |
| `draw_history` | Server → Client | `{ history }` | Full canvas history |

### Chat & Guessing
| Event | Direction | Payload | Description |
|---|---|---|---|
| `guess` | Client → Server | `{ text }` | Player sends a guess |
| `guess_result` | Server → All | `{ correct, playerId, playerName, points }` | Guess outcome |
| `chat` | Client → Server | `{ text }` | Chat message from drawer |
| `chat_message` | Server → All | `{ playerId, playerName, text }` | Broadcast chat |

---

## 🧠 Technical Highlights

### OOP Server Design
The server is structured using classes — directly satisfying the assessment bonus requirement:

```js
// Player class
class Player {
  constructor(id, name, isHost) { ... }
  addScore(points) { ... }
  resetGuess() { ... }
}

// Room class — encapsulates all room state
class Room {
  broadcast(io, event, data) {
    io.to(this.roomId).emit(event, data); // one method to rule them all
  }
}

// Game class — handles all round logic
class Game {
  startRound(io) { ... }
  startTimer(io) { ... }
  endRound(io) { ... }
  handleGuess(playerId, text, io) { ... }
}
```

### Real-time Drawing Sync
```
Drawer mouse event
      ↓
Canvas.jsx captures x, y, color, size
      ↓
emit draw_start / draw_move / draw_end
      ↓
server saves to room.drawHistory
      ↓
broadcast draw_data to all other clients
      ↓
each client redraws stroke on their canvas
```

Late joiners call `request_draw_history` to replay the full canvas.

### Scoring Formula
```
points = max(50, round(200 × (timeLeft / drawTime)))
```
Guess with 80s left on an 80s timer = 200 points.
Guess at the last second = 50 points minimum.

### No Database
All game state lives in memory on the server as a plain JS object:
```js
const rooms = {
  "ABC123": { room: Room, game: Game }
}
```
No PostgreSQL, no MongoDB. Rooms are deleted when everyone leaves.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, component model |
| Canvas | HTML5 Canvas API | Native, no library needed |
| Backend | Node.js + Express | Fast, non-blocking I/O |
| WebSockets | Socket.IO | Rooms, broadcasting, reconnection built-in |
| Env Config | dotenv | Separate config for dev/prod |
| Styling | Inline JS styles | No CSS framework needed |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/skribbl-clone.git
cd skribbl-clone
```

### 2. Setup server
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=4000
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

✅ Server runs at `http://localhost:4000`

### 3. Setup client
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_SERVER_URL=http://localhost:4000
```

```bash
npm run dev
```

✅ Client runs at `http://localhost:5173`

### 4. Test it
- Open `http://localhost:5173` in **two browser tabs**
- Tab 1 — enter name, click **Play**
- Tab 2 — enter name, click **Play**
- Both land in the same lobby
- Tab 1 (host) clicks **Start Game**

---

## 🚢 Deployment

### Backend — Render
1. Push code to GitHub
2. Create new project on [Render](https://render.com)
3. Connect GitHub repo
4. Set root directory: `server`
5. Add environment variables:
   ```
   PORT=4000
   CLIENT_URL=https://skribbl-io-1-frontend.onrender.com
   ```
6. Deploy — Render auto-detects Node.js

### Frontend — render
1. Create new project on [Render](https://render.com)
2. Connect GitHub repo
3. Set root directory: `client`
4. Add environment variable:
   ```
   VITE_SERVER_URL=https://skribbl-io-kppl.onrender.com
   ```
5. Deploy

> ⚠️ Make sure to update `CLIENT_URL` on Github after getting your Render URL, and vice versa.

---

## 📡 REST API

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Server health check |
| `/api/rooms` | GET | List all active rooms |
| `/api/rooms/:roomId` | GET | Get specific room details |

---


## 📝 License

MIT
