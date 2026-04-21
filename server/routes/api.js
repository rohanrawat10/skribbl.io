import express from "express";
const router = express.Router();
const { rooms } = require("../controllers/roomController");

// ─── Health Check ──────────────────────────────────
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Get All Active Rooms ──────────────────────────
router.get("/rooms", (req, res) => {
  const activeRooms = Object.values(rooms).map(({ room }) => ({
    roomId: room.roomId,
    players: room.players.length,
    maxPlayers: room.settings.maxPlayers,
    phase: room.phase,
    rounds: room.settings.rounds,
  }));

  res.json({ rooms: activeRooms });
});

// ─── Get Single Room ───────────────────────────────
router.get("/rooms/:roomId", (req, res) => {
  const entry = rooms[req.params.roomId.toUpperCase()];

  if (!entry) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({ room: entry.room.toJSON() });
});

module.exports = router;