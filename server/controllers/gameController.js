import { getRoomEntryByPlayerId } from "./roomController.js";

export function registerGameEvents(socket, io) {

  socket.on("word_chosen", ({ word }) => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;
    const { room, game } = entry;

    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) {
      return socket.emit("error_msg", { message: "You are not the drawer" });
    }
    if (room.phase !== "picking") {
      return socket.emit("error_msg", { message: "Not picking phase" });
    }

    game.wordChosen(word, io);
  });

  socket.on("guess", ({ text }) => {
    if (!text?.trim()) return;
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry || !entry.game) return;
    entry.game.handleGuess(socket.id, text.trim(), io);
  });

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