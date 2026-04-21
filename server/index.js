import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import apiRoutes from "./routes/api.js";
import { registerRoomEvents } from "./controllers/roomController.js";
import { registerGameEvents } from "./controllers/gameController.js";
import { registerDrawEvents } from "./controllers/drawController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);
  registerRoomEvents(socket, io);
  registerGameEvents(socket, io);
  registerDrawEvents(socket, io);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────┐
  │   Skribbl Server Running        │
  │   http://localhost:${PORT}          │
  └─────────────────────────────────┘
  `);
});