const { getRoomEntryByPlayerId } = require("./roomController");

function registerGameEvents(socket, io) {

  // ─── Word Chosen ───────────────────────────────────
  socket.on("word_chosen", ({ word }) => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room, game } = entry;

    // only current drawer can choose word
    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) {
      return socket.emit("error_msg", { message: "You are not the drawer" });
    }

    if (room.phase !== "picking") {
      return socket.emit("error_msg", { message: "Not picking phase" });
    }

    game.wordChosen(word, io);
    console.log(`Word chosen in room: ${room.roomId}`);
  });

  // ─── Guess ─────────────────────────────────────────
  socket.on("guess", ({ text }) => {
    if (!text?.trim()) return;

    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { game } = entry;
    if (!game) return;

    game.handleGuess(socket.id, text.trim(), io);
  });

  // ─── Chat ──────────────────────────────────────────
  socket.on("chat", ({ text }) => {
    if (!text?.trim()) return;

    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room } = entry;
    const player = room.getPlayer(socket.id);
    if (!player) return;

    room.broadcast(io, "chat_message", {
      playerId: socket.id,
      playerName: player.name,
      text: text.trim(),
      correct: false,
    });
  });
}

module.exports = { registerGameEvents };