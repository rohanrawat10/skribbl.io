import { useState } from "react";
import socket from "../socket";

export default function Home({ setMyName }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [settings, setSettings] = useState({
    maxPlayers: 8,
    rounds: 3,
    drawTime: 80,
    wordCount: 3,
    hints: 2,
  });

  // ─── Create Room ───────────────────────────────────
  const handleCreate = () => {
    if (!name.trim()) return alert("Enter your name");
    setMyName(name.trim());
    socket.emit("create_room", {
      playerName: name.trim(),
      settings,
    });
  };

  // ─── Join Room ─────────────────────────────────────
  const handleJoin = () => {
    if (!name.trim()) return alert("Enter your name");
    if (!roomId.trim()) return alert("Enter a room code");
    setMyName(name.trim());
    socket.emit("join_room", {
      roomId: roomId.trim().toUpperCase(),
      playerName: name.trim(),
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>skribbl clone</h1>
      <p style={styles.subtitle}>Draw. Guess. Win.</p>

      <div style={styles.card}>

        {/* Name Input */}
        <input
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
        />

        {/* Join Room */}
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Room code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button style={styles.btnSecondary} onClick={handleJoin}>
            Join
          </button>
        </div>

        <div style={styles.divider}>— or create a new room —</div>

        {/* Settings */}
        <div style={styles.settings}>
          <label style={styles.label}>
            Rounds
            <select
              style={styles.select}
              value={settings.rounds}
              onChange={(e) =>
                setSettings((s) => ({ ...s, rounds: +e.target.value }))
              }
            >
              {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Draw Time
            <select
              style={styles.select}
              value={settings.drawTime}
              onChange={(e) =>
                setSettings((s) => ({ ...s, drawTime: +e.target.value }))
              }
            >
              {[30, 45, 60, 80, 100, 120].map((n) => (
                <option key={n}>{n}s</option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Max Players
            <select
              style={styles.select}
              value={settings.maxPlayers}
              onChange={(e) =>
                setSettings((s) => ({ ...s, maxPlayers: +e.target.value }))
              }
            >
              {[2, 4, 6, 8, 10, 12].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Word Count
            <select
              style={styles.select}
              value={settings.wordCount}
              onChange={(e) =>
                setSettings((s) => ({ ...s, wordCount: +e.target.value }))
              }
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Hints
            <select
              style={styles.select}
              value={settings.hints}
              onChange={(e) =>
                setSettings((s) => ({ ...s, hints: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <button style={styles.btn} onClick={handleCreate}>
          Create Room
        </button>
      </div>
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
  },
  title: {
    color: "#e94560",
    fontSize: 52,
    fontWeight: 900,
    margin: 0,
    letterSpacing: -1,
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 32,
    fontSize: 16,
  },
  card: {
    background: "#16213e",
    padding: 32,
    borderRadius: 16,
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  input: {
    padding: "11px 14px",
    borderRadius: 8,
    border: "1px solid #2a2a4a",
    background: "#0f3460",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    flex: 1,
  },
  row: {
    display: "flex",
    gap: 8,
  },
  btn: {
    padding: "13px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
  btnSecondary: {
    padding: "11px 18px",
    background: "#0f3460",
    color: "#fff",
    border: "1px solid #2a2a4a",
    borderRadius: 8,
    fontSize: 15,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  divider: {
    color: "#444",
    textAlign: "center",
    fontSize: 13,
  },
  settings: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: {
    color: "#aaa",
    fontSize: 13,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  select: {
    padding: "7px 10px",
    background: "#0f3460",
    color: "#fff",
    border: "1px solid #2a2a4a",
    borderRadius: 6,
    fontSize: 14,
  },
};