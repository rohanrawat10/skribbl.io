class Player {
  constructor(id, name, isHost = false) {
    this.id = id;
    this.name = name;
    this.score = 0;
    this.isHost = isHost;
    this.hasGuessed = false;
  }

  addScore(points) {
    this.score += points;
  }

  resetGuess() {
    this.hasGuessed = false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      score: this.score,
      isHost: this.isHost,
      hasGuessed: this.hasGuessed,
    };
  }
}

module.exports = Player;