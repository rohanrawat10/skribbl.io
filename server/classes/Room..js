const Player = require("./Player");

class Room {
  constructor(roomId, hostId, hostName, settings = {}) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = [new Player(hostId, hostName, true)];
    this.settings = {
      maxPlayers: settings.maxPlayers || 8,
      rounds: settings.rounds || 3,
      drawTime: settings.drawTime || 80,
      wordCount: settings.wordCount || 3,
      hints: settings.hints || 2,
    };
    this.phase = "lobby"; // lobby | picking | drawing | end
    this.drawHistory = [];
  }

  addPlayer(id, name) {
    if (this.isFull()) return { error: "Room is full" };
    if (this.phase !== "lobby") return { error: "Game already started" };
    if (this.getPlayer(id)) return { error: "Already in room" };

    this.players.push(new Player(id, name, false));
    return { success: true };
  }

  removePlayer(id) {
    this.players = this.players.filter((p) => p.id !== id);

    // if host left assign next player as host
    if (this.hostId === id && this.players.length > 0) {
      this.players[0].isHost = true;
      this.hostId = this.players[0].id;
    }
  }

  getPlayer(id) {
    return this.players.find((p) => p.id === id) || null;
  }

  isFull() {
    return this.players.length >= this.settings.maxPlayers;
  }

  isEmpty() {
    return this.players.length === 0;
  }

  broadcast(io, event, data) {
    io.to(this.roomId).emit(event, data);
  }

  toJSON() {
    return {
      roomId: this.roomId,
      hostId: this.hostId,
      players: this.players.map((p) => p.toJSON()),
      settings: this.settings,
      phase: this.phase,
    };
  }
}

export default Room;