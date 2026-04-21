const Room = require("../classes/Room");
const Game = require("../classes/Game");

// in-memory store — all active rooms live here
const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function registerRoomEvents(socket, io) {

  // ─── Create Room ───────────────────────────────────
  socket.on("create_room", ({ playerName, settings }) => {
    if (!playerName?.trim()) {
      return socket.emit("error_msg", { message: "Name is required" });
    }

    const roomId = generateRoomId();
    const room = new Room(roomId, socket.id, playerName.trim(), settings || {});
    rooms[roomId] = { room, game: null };

    socket.join(roomId);

    socket.emit("room_created", { room: room.toJSON() });
    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  // ─── Join Room ─────────────────────────────────────
  socket.on("join_room", ({ roomId, playerName }) => {
    if (!playerName?.trim()) {
      return socket.emit("error_msg", { message: "Name is required" });
    }

    const id = roomId?.toUpperCase().trim();
    const entry = rooms[id];

    if (!entry) {
      return socket.emit("join_error", { message: "Room not found" });
    }

    const result = entry.room.addPlayer(socket.id, playerName.trim());

    if (result.error) {
      return socket.emit("join_error", { message: result.error });
    }

    socket.join(id);

    // tell the joining player full room info
    socket.emit("room_joined", { room: entry.room.toJSON() });

    // tell everyone else a new player joined
    socket.to(id).emit("player_joined", {
      players: entry.room.players.map((p) => p.toJSON()),
    });

    console.log(`${playerName} joined room: ${id}`);
  });

  // ─── Start Game ────────────────────────────────────
  socket.on("start_game", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room } = entry;

    // only host can start
    if (room.hostId !== socket.id) {
      return socket.emit("error_msg", { message: "Only host can start" });
    }

    if (room.players.length < 2) {
      return socket.emit("error_msg", { message: "Need at least 2 players" });
    }

    // create game instance and attach to room entry
    const game = new Game(room);
    entry.game = game;

    io.to(room.roomId).emit("game_started", {
      players: room.players.map((p) => p.toJSON()),
    });

    game.startRound(io);
    console.log(`Game started in room: ${room.roomId}`);
  });

  // ─── Disconnect ────────────────────────────────────
  socket.on("disconnect", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room } = entry;
    room.removePlayer(socket.id);

    if (room.isEmpty()) {
      delete rooms[room.roomId];
      console.log(`Room deleted: ${room.roomId}`);
      return;
    }

    io.to(room.roomId).emit("player_left", {
      playerId: socket.id,
      players: room.players.map((p) => p.toJSON()),
    });

    console.log(`Player disconnected from room: ${room.roomId}`);
  });
}

// ─── Helper ────────────────────────────────────────
function getRoomEntryByPlayerId(playerId) {
  for (const roomId in rooms) {
    const entry = rooms[roomId];
    if (entry.room.getPlayer(playerId)) return entry;
  }
  return null;
}

module.exports = { registerRoomEvents, getRoomEntryByPlayerId, rooms };