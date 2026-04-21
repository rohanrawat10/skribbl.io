import { useState, useEffect } from "react";
import socket from "../socket";
import Canvas from "../components/Canvas";
import ChatBox from "../components/ChatBox";
import PlayerList from "../components/PlayerList";
import Timer from "../components/Timer";
import HintBar from "../components/HintBar";
import WordPicker from "../components/WordPicker";

export default function Game({ room, myName }) {
  const [players, setPlayers] = useState(room?.players || []);
  const [drawerId, setDrawerId] = useState(null);
  const [drawerName, setDrawerName] = useState("");
  const [phase, setPhase] = useState("picking");
  const [hint, setHint] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [wordOptions, setWordOptions] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [roundInfo, setRoundInfo] = useState({
    round: 1,
    total: room?.settings?.rounds || 3,
  });
  const [gameOver, setGameOver] = useState(null);
  const [roundEndWord, setRoundEndWord] = useState("");

  const isDrawer = drawerId === socket.id;
  const drawTime = room?.settings?.drawTime || 80;

  useEffect(() => {
    // ─── Players ─────────────────────────────────────
    socket.on("player_joined", ({ players }) => setPlayers(players));
    socket.on("player_left", ({ players }) => setPlayers(players));

    // ─── Round Start ─────────────────────────────────
    socket.on("round_start", ({ drawerId, drawerName, round, totalRounds }) => {
      setDrawerId(drawerId);
      setDrawerName(drawerName);
      setPhase("picking");
      setHint("");
      setCurrentWord("");
      setRoundEndWord("");
      setRoundInfo({ round, total: totalRounds });
      setPlayers((prev) => prev.map((p) => ({ ...p, hasGuessed: false })));
    });

    // ─── Word Options (drawer only) ───────────────────
    socket.on("word_options", ({ words }) => {
      setWordOptions(words);
      setShowPicker(true);
    });

    // ─── Drawing Started ──────────────────────────────
    socket.on("drawing_started", ({ drawerId, hint }) => {
      setDrawerId(drawerId);
      setHint(hint);
      setPhase("drawing");
      setShowPicker(false);
      setRoundEndWord("");
    });

    // ─── Hint Update ──────────────────────────────────
    socket.on("hint_update", ({ hint }) => setHint(hint));

    // ─── Timer ────────────────────────────────────────
    socket.on("timer_tick", ({ timeLeft }) => {
      if (timeLeft === 0) setPhase("end");
    });

    // ─── Guess Result ─────────────────────────────────
    socket.on("guess_result", ({ correct, playerId, points }) => {
      if (correct) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, score: p.score + points, hasGuessed: true }
              : p
          )
        );
      }
    });

    // ─── Round End ────────────────────────────────────
    socket.on("round_end", ({ word, scores }) => {
      setPhase("end");
      setRoundEndWord(word);
      setPlayers(scores);
    });

    // ─── Game Over ────────────────────────────────────
    socket.on("game_over", ({ winner, leaderboard }) => {
      setGameOver({ winner, leaderboard });
    });

    return () => {
      [
        "player_joined", "player_left", "round_start", "word_options",
        "drawing_started", "hint_update", "timer_tick", "guess_result",
        "round_end", "game_over",
      ].forEach((e) => socket.off(e));
    };
  }, []);

  // ─── Game Over Screen ────────────────────────────────
  if (gameOver) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h1 style={styles.gameOverTitle}>Game Over! 🎉</h1>
          <h2 style={styles.winnerText}>
            Winner: {gameOver.winner?.name} 🏆
          </h2>
          <div style={styles.leaderboard}>
            {gameOver.leaderboard.map((p, i) => (
              <div key={p.id} style={styles.lbRow(i)}>
                <span style={styles.lbRank}>#{i + 1}</span>
                <span style={styles.lbName}>
                  {p.name}
                  {p.id === socket.id ? " (you)" : ""}
                </span>
                <span style={styles.lbScore}>{p.score} pts</span>
              </div>
            ))}
          </div>
          <p style={styles.returningText}>Returning to lobby in 6s...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ─── Top Bar ─────────────────────────────────── */}
      <div style={styles.topBar}>
        {/* Round info */}
        <div style={styles.roundBadge}>
          Round {roundInfo.round} / {roundInfo.total}
        </div>

        {/* Hint / status */}
        <div style={styles.hintArea}>
          {phase === "drawing" || phase === "end" ? (
            <HintBar
              hint={hint}
              word={currentWord}
              isDrawer={isDrawer}
            />
          ) : (
            <span style={styles.statusText}>
              {isDrawer
                ? "Choose a word to draw!"
                : `${drawerName} is choosing a word...`}
            </span>
          )}
        </div>

        {/* Timer */}
        <Timer drawTime={drawTime} phase={phase} />
      </div>

      {/* ─── Round End Banner ────────────────────────── */}
      {roundEndWord && (
        <div style={styles.roundEndBanner}>
          The word was: <strong>{roundEndWord}</strong>
        </div>
      )}

      {/* ─── Main Game Area ──────────────────────────── */}
      <div style={styles.main}>

        {/* Left — Player List */}
        <div style={styles.sidebar}>
          <PlayerList players={players} drawerId={drawerId} />
        </div>

        {/* Center — Canvas */}
        <div style={styles.canvasArea}>
          <Canvas isDrawer={isDrawer} />
          {showPicker && (
            <WordPicker
              words={wordOptions}
              onPick={(word) => {
                setCurrentWord(word);
                setShowPicker(false);
              }}
            />
          )}
        </div>

        {/* Right — Chat */}
        <div style={styles.chatArea}>
          <ChatBox isDrawer={isDrawer} />
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#1a1a2e",
    display: "flex",
    flexDirection: "column",
    padding: 12,
    gap: 10,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#16213e",
    padding: "10px 20px",
    borderRadius: 12,
    gap: 12,
  },
  roundBadge: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: 600,
    minWidth: 100,
  },
  hintArea: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "#555",
    fontSize: 15,
  },
  main: {
    display: "grid",
    gridTemplateColumns: "200px 1fr 260px",
    gap: 10,
    flex: 1,
  },
  sidebar: {
    minHeight: 400,
  },
  canvasArea: {
    position: "relative",
  },
  chatArea: {
    minHeight: 400,
  },
  roundEndBanner: {
    background: "#f0a500",
    color: "#000",
    textAlign: "center",
    padding: "10px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  modal: {
    background: "#16213e",
    padding: 40,
    borderRadius: 20,
    minWidth: 340,
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  gameOverTitle: {
    color: "#e94560",
    fontSize: 32,
    marginBottom: 8,
  },
  winnerText: {
    color: "#f0a500",
    fontSize: 22,
    marginBottom: 24,
  },
  leaderboard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  lbRow: (i) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    background: i === 0 ? "#1a3a2a" : "#0f1f3a",
  }),
  lbRank: {
    color: "#555",
    minWidth: 30,
    fontSize: 14,
  },
  lbName: {
    color: "#fff",
    flex: 1,
    textAlign: "left",
    fontSize: 15,
  },
  lbScore: {
    color: "#4ecca3",
    fontWeight: 700,
    fontSize: 15,
  },
  returningText: {
    color: "#555",
    marginTop: 20,
    fontSize: 13,
  },
};