import { getRoomEntryByPlayerId } from "./roomController.js";

export function registerDrawEvents(socket, io) {

  socket.on("draw_start", (data) => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;
    const { room, game } = entry;
    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    const stroke = { type: "start", x: data.x, y: data.y, color: data.color, size: data.size };
    room.drawHistory.push(stroke);
    socket.to(room.roomId).emit("draw_data", stroke);
  });

  socket.on("draw_move", (data) => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;
    const { room, game } = entry;
    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    const stroke = { type: "move", x: data.x, y: data.y };
    room.drawHistory.push(stroke);
    socket.to(room.roomId).emit("draw_data", stroke);
  });

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

  socket.on("canvas_clear", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;
    const { room, game } = entry;
    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    room.drawHistory = [];
    io.to(room.roomId).emit("canvas_cleared");
  });

  socket.on("draw_undo", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;
    const { room, game } = entry;
    const drawer = game.getCurrentDrawer();
    if (!drawer || drawer.id !== socket.id) return;

    let i = room.drawHistory.length - 1;
    while (i >= 0 && room.drawHistory[i].type !== "start") i--;
    if (i >= 0) room.drawHistory.splice(i);

    io.to(room.roomId).emit("undo_done", { drawHistory: room.drawHistory });
  });

  socket.on("request_draw_history", () => {
    const entry = getRoomEntryByPlayerId(socket.id);
    if (!entry) return;
    socket.emit("draw_history", { history: entry.room.drawHistory });
  });
}