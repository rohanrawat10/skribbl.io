import Room from "../classes/Room.js";
import Game from "../classes/Game.js";

const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function registerRoomEvents(socket, io) {

  // ─── Quick Play ────────────────────────────────────
  socket.on("quick_play", ({ playerName }) => {
    if (!playerName?.trim()) return;

    // find any open room in lobby that isn't full
    const openEntry = Object.values(rooms).find(
      ({ room }) => room.phase === "lobby" && !room.isFull()
    );

    if (openEntry) {
      // join existing open room
      const result = openEntry.room.addPlayer(socket.id, playerName.trim());
      if (result.error) return socket.emit("join_error", { message: result.error });

      socket.join(openEntry.room.roomId);
      socket.emit("room_joined", { room: openEntry.room.toJSON() });
      socket.to(openEntry.room.roomId).emit("player_joined", {
        players: openEntry.room.players.map((p) => p.toJSON()),
      });
      console.log(`${playerName} quick joined room: ${openEntry.room.roomId}`);
    } else {
      // no open rooms — create a new one
      const roomId = generateRoomId();
      const room = new Room(roomId, socket.id, playerName.trim(), {});
      rooms[roomId] = { room, game: null };
      socket.join(roomId);
      socket.emit("room_created", { room: room.toJSON() });
      console.log(`${playerName} quick created room: ${roomId}`);
    }
  });

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
    if (!entry) return socket.emit("join_error", { message: "Room not found" });

    const result = entry.room.addPlayer(socket.id, playerName.trim());
    if (result.error) return socket.emit("join_error", { message: result.error });

    socket.join(id);
    socket.emit("room_joined", { room: entry.room.toJSON() });
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

    if (room.hostId !== socket.id) {
      return socket.emit("error_msg", { message: "Only host can start" });
    }
    if (room.players.length < 2) {
      return socket.emit("error_msg", { message: "Need at least 2 players" });
    }

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
      return;
    }

    io.to(room.roomId).emit("player_left", {
      playerId: socket.id,
      players: room.players.map((p) => p.toJSON()),
    });
  });
}

export function getRoomEntryByPlayerId(playerId) {
  for (const roomId in rooms) {
    if (rooms[roomId].room.getPlayer(playerId)) return rooms[roomId];
  }
  return null;
}

export { rooms };