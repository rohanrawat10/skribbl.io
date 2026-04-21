const { getRandomWords, buildHint, calcPoints, checkGuess } = require("../utils/gameUtils");

class Game {
  constructor(room) {
    this.room = room;
    this.round = 0;
    this.currentDrawerIndex = 0;
    this.currentWord = null;
    this.hintsRevealed = 0;
    this.roundStartTime = null;
    this.timer = null;
  }

  // ─── Getters ───────────────────────────────────────

  getCurrentDrawer() {
    return this.room.players[this.currentDrawerIndex] || null;
  }

  getNextDrawerIndex() {
    return (this.currentDrawerIndex + 1) % this.room.players.length;
  }

  isLastDrawer() {
    return this.currentDrawerIndex === this.room.players.length - 1;
  }

  isGameOver() {
    return this.round >= this.room.settings.rounds;
  }

  isRoundOver() {
    const drawer = this.getCurrentDrawer();
    const nonDrawers = this.room.players.filter((p) => p.id !== drawer?.id);
    return nonDrawers.length > 0 && nonDrawers.every((p) => p.hasGuessed);
  }

  // ─── Round Flow ────────────────────────────────────

  startRound(io) {
    this.room.phase = "picking";
    this.currentWord = null;
    this.hintsRevealed = 0;
    this.room.drawHistory = [];

    const drawer = this.getCurrentDrawer();
    const wordOptions = getRandomWords(this.room.settings.wordCount);

    // tell everyone who is drawing
    this.room.broadcast(io, "round_start", {
      drawerId: drawer.id,
      drawerName: drawer.name,
      round: this.round + 1,
      totalRounds: this.room.settings.rounds,
    });

    // send word choices only to drawer
    io.to(drawer.id).emit("word_options", { words: wordOptions });
  }

  wordChosen(word, io) {
    this.currentWord = word;
    this.room.phase = "drawing";
    this.roundStartTime = Date.now();

    const blank = buildHint(word, 0);

    this.room.broadcast(io, "drawing_started", {
      drawerId: this.getCurrentDrawer().id,
      hint: blank,
      wordLength: word.length,
    });

    this.startTimer(io);
  }

  // ─── Timer ─────────────────────────────────────────

  startTimer(io) {
    let timeLeft = this.room.settings.drawTime;
    const hintInterval = Math.floor(
      this.room.settings.drawTime / (this.room.settings.hints + 1)
    );

    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      timeLeft--;

      // reveal a hint at intervals
      if (
        this.room.settings.hints > 0 &&
        timeLeft % hintInterval === 0 &&
        this.hintsRevealed < this.room.settings.hints
      ) {
        this.hintsRevealed++;
        const hint = buildHint(this.currentWord, this.hintsRevealed);
        this.room.broadcast(io, "hint_update", { hint });
      }

      this.room.broadcast(io, "timer_tick", { timeLeft });

      if (timeLeft <= 0) {
        this.stopTimer();
        this.endRound(io);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ─── End Round ─────────────────────────────────────

  endRound(io) {
    this.stopTimer();
    this.room.phase = "end";

    this.room.broadcast(io, "round_end", {
      word: this.currentWord,
      scores: this.room.players.map((p) => p.toJSON()),
    });

    // reset guesses for all players
    this.room.players.forEach((p) => p.resetGuess());

    setTimeout(() => {
      // move to next drawer
      if (this.isLastDrawer()) {
        this.round++;
      }
      this.currentDrawerIndex = this.getNextDrawerIndex();

      if (this.isGameOver()) {
        this.endGame(io);
      } else {
        this.startRound(io);
      }
    }, 3000);
  }

  // ─── End Game ──────────────────────────────────────

  endGame(io) {
    this.room.phase = "lobby";
    const sorted = [...this.room.players].sort((a, b) => b.score - a.score);

    this.room.broadcast(io, "game_over", {
      winner: sorted[0].toJSON(),
      leaderboard: sorted.map((p) => p.toJSON()),
    });
  }

  // ─── Guess ─────────────────────────────────────────

  handleGuess(playerId, text, io) {
    if (this.room.phase !== "drawing") return;

    const player = this.room.getPlayer(playerId);
    const drawer = this.getCurrentDrawer();

    if (!player || !drawer) return;
    if (player.hasGuessed) return;
    if (player.id === drawer.id) return; // drawer cant guess

    if (checkGuess(text, this.currentWord)) {
      const timeLeft =
        this.room.settings.drawTime -
        Math.floor((Date.now() - this.roundStartTime) / 1000);

      const points = calcPoints(this.room.settings.drawTime, timeLeft);
      player.addScore(points);
      player.hasGuessed = true;

      // drawer gets small bonus
      drawer.addScore(10);

      this.room.broadcast(io, "guess_result", {
        correct: true,
        playerId: player.id,
        playerName: player.name,
        points,
      });

      // end round if everyone guessed
      if (this.isRoundOver()) {
        this.endRound(io);
      }
    } else {
      // wrong guess — show as chat
      this.room.broadcast(io, "chat_message", {
        playerId: player.id,
        playerName: player.name,
        text,
        correct: false,
      });
    }
  }
}

export default Game;