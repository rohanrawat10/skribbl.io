const { getRoomEntryByPlayerId } = require("./roomController");

function registerDrawEvents(socket, io) {

  // ─── Draw Start ────────────────────────────────────
  socket.on("draw_start", (data) => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room, game } = entry;

    // only drawer can draw
    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    const stroke = {
      type: "start",
      x: data.x,
      y: data.y,
      color: data.color,
      size: data.size,
    };

    // save to history so late joiners can catch up
    room.drawHistory.push(stroke);

    // broadcast to everyone except drawer
    socket.to(room.roomId).emit("draw_data", stroke);
  });

  // ─── Draw Move ─────────────────────────────────────
  socket.on("draw_move", (data) => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room, game } = entry;

    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    const stroke = {
      type: "move",
      x: data.x,
      y: data.y,
    };

    room.drawHistory.push(stroke);
    socket.to(room.roomId).emit("draw_data", stroke);
  });

  // ─── Draw End ──────────────────────────────────────
  socket.on("draw_end", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room, game } = entry;

    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    const stroke = { type: "end" };
    room.drawHistory.push(stroke);
    socket.to(room.roomId).emit("draw_data", stroke);
  });

  // ─── Canvas Clear ──────────────────────────────────
  socket.on("canvas_clear", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room, game } = entry;

    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    // wipe history
    room.drawHistory = [];

    // tell everyone to clear their canvas
    io.to(room.roomId).emit("canvas_cleared");
  });

  // ─── Undo ──────────────────────────────────────────
  socket.on("draw_undo", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room, game } = entry;

    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    // remove strokes back to last "start"
    let i = room.drawHistory.length - 1;
    while (i >= 0 && room.drawHistory[i].type !== "start") i--;
    if (i >= 0) room.drawHistory.splice(i);

    // send updated history so everyone redraws
    io.to(room.roomId).emit("undo_done", {
      drawHistory: room.drawHistory,
    });
  });

  // ─── Request Draw History ──────────────────────────
  // called when a player joins mid-game
  socket.on("request_draw_history", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;

    const { room } = entry;

    socket.emit("draw_history", {
      history: room.drawHistory,
    });
  });
}

module.exports = { registerDrawEvents };