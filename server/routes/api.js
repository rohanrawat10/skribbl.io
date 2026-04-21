import express from "express";
import { rooms } from "../controllers/roomController.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/rooms", (req, res) => {
  const activeRooms = Object.values(rooms).map(({ room }) => ({
    roomId: room.roomId,
    players: room.players.length,
    maxPlayers: room.settings.maxPlayers,
    phase: room.phase,
  }));
  res.json({ rooms: activeRooms });
});

router.get("/rooms/:roomId", (req, res) => {
  const entry = rooms[req.params.roomId.toUpperCase()];
  if (!entry) return res.status(404).json({ error: "Room not found" });
  res.json({ room: entry.room.toJSON() });
});

export default router;