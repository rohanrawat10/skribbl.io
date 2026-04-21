import { useState, useEffect } from "react";
import socket from "../socket";

export default function Lobby({ room }) {
  const [players, setPlayers] = useState(room?.players || []);
  const isHost = room?.hostId === socket.id;

  useEffect(() => {
    socket.on("player_joined", ({ players }) => setPlayers(players));
    socket.on("player_left", ({ players }) => setPlayers(players));

    return () => {
      socket.off("player_joined");
      socket.off("player_left");
    };
  }, []);

  const handleStart = () => socket.emit("start_game");

  return (
    <div style={styles.container}>

      {/* Title */}
      <h1 style={styles.title}>skribbl clone</h1>

      {/* Room Code */}
      <div style={styles.roomCodeBox}>
        <p style={styles.roomLabel}>Room Code</p>
        <p style={styles.roomCode}>{room?.roomId}</p>
        <p style={styles.roomHint}>Share this code with friends!</p>
      </div>

      {/* Settings Summary */}
      <div style={styles.settingsRow}>
        <div style={styles.settingBadge}>
          Rounds: {room?.settings?.rounds}
        </div>
        <div style={styles.settingBadge}>
          Draw Time: {room?.settings?.drawTime}s
        </div>
        <div style={styles.settingBadge}>
          Words: {room?.settings?.wordCount}
        </div>
        <div style={styles.settingBadge}>
          Hints: {room?.settings?.hints}
        </div>
      </div>

      {/* Player List */}
      <div style={styles.playerList}>
        <h3 style={styles.playersTitle}>
          Players ({players.length} / {room?.settings?.maxPlayers})
        </h3>
        {players.map((p) => (
          <div key={p.id} style={styles.playerRow}>
            <span style={styles.dot(p.isHost)} />
            <span style={styles.playerName}>
              {p.name}
              {p.id === socket.id ? " (you)" : ""}
              {p.isHost ? " 👑" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* Start Button / Waiting */}
      {isHost ? (
        <button
          style={{
            ...styles.btn,
            opacity: players.length < 2 ? 0.5 : 1,
            cursor: players.length < 2 ? "not-allowed" : "pointer",
          }}
          onClick={handleStart}
          disabled={players.length < 2}
        >
          {players.length < 2 ? "Waiting for players..." : "Start Game 🎮"}
        </button>
      ) : (
        <p style={styles.waiting}>
          Waiting for host to start the game...
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a2e",
    padding: 20,
    gap: 20,
  },
  title: {
    color: "#e94560",
    fontSize: 36,
    fontWeight: 900,
    margin: 0,
  },
  roomCodeBox: {
    background: "#16213e",
    padding: "20px 40px",
    borderRadius: 16,
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  roomLabel: {
    color: "#aaa",
    fontSize: 13,
    margin: 0,
    marginBottom: 6,
  },
  roomCode: {
    color: "#fff",
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: 8,
    margin: 0,
  },
  roomHint: {
    color: "#555",
    fontSize: 12,
    margin: 0,
    marginTop: 6,
  },
  settingsRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  settingBadge: {
    background: "#16213e",
    color: "#aaa",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    border: "1px solid #2a2a4a",
  },
  playerList: {
    background: "#16213e",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  playersTitle: {
    color: "#e94560",
    margin: "0 0 14px",
    fontSize: 15,
  },
  playerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid #2a2a4a",
  },
  dot: (isHost) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: isHost ? "#e94560" : "#4ecca3",
    flexShrink: 0,
  }),
  playerName: {
    color: "#fff",
    fontSize: 15,
  },
  btn: {
    padding: "14px 48px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 700,
  },
  waiting: {
    color: "#555",
    fontSize: 15,
  },
};