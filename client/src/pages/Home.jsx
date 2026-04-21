import { useState } from "react";
import socket from "../socket";

export default function Home({ setMyName }) {
  const [name, setName] = useState("");
  const [view, setView] = useState("main"); // main | create | join
  const [roomId, setRoomId] = useState("");
  const [settings, setSettings] = useState({
    maxPlayers: 8,
    rounds: 3,
    drawTime: 80,
    wordCount: 3,
    hints: 2,
  });

  const validateName = () => {
    if (!name.trim()) { alert("Enter your name first!"); return false; }
    return true;
  };

  // ─── Play — auto join any open room ───────────────
  const handlePlay = () => {
    if (!validateName()) return;
    setMyName(name.trim());
    socket.emit("quick_play", { playerName: name.trim() });
  };

  // ─── Create private room ──────────────────────────
  const handleCreate = () => {
    if (!validateName()) return;
    setMyName(name.trim());
    socket.emit("create_room", { playerName: name.trim(), settings });
  };

  // ─── Join by code ─────────────────────────────────
  const handleJoin = () => {
    if (!validateName()) return;
    if (!roomId.trim()) { alert("Enter a room code!"); return; }
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

      {/* Name Input — always visible */}
      <input
        style={styles.nameInput}
        placeholder="Enter your name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
      />

      {/* ─── Main View — Play or Create ─────────────── */}
      {view === "main" && (
        <div style={styles.card}>
          {/* Play Button */}
          <button style={styles.btnPlay} onClick={handlePlay}>
            ▶ Play
          </button>
          <p style={styles.playHint}>
            Instantly join an open room
          </p>

          <div style={styles.divider}>— or —</div>

          {/* Create Room */}
          <button
            style={styles.btnSecondary}
            onClick={() => setView("create")}
          >
            🏠 Create Private Room
          </button>

          {/* Join by Code */}
          <button
            style={styles.btnOutline}
            onClick={() => setView("join")}
          >
            🔑 Join with Room Code
          </button>
        </div>
      )}

      {/* ─── Join View ───────────────────────────────── */}
      {view === "join" && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Join a Room</h3>
          <input
            style={styles.input}
            placeholder="Enter room code..."
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button style={styles.btnPlay} onClick={handleJoin}>
            Join Room
          </button>
          <button style={styles.btnBack} onClick={() => setView("main")}>
            ← Back
          </button>
        </div>
      )}

      {/* ─── Create View ─────────────────────────────── */}
      {view === "create" && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Room Settings</h3>

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

          <button style={styles.btnPlay} onClick={handleCreate}>
            Create Room
          </button>
          <button style={styles.btnBack} onClick={() => setView("main")}>
            ← Back
          </button>
        </div>
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
    gap: 16,
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
    fontSize: 16,
    margin: 0,
  },
  nameInput: {
    padding: "13px 18px",
    borderRadius: 10,
    border: "2px solid #2a2a4a",
    background: "#16213e",
    color: "#fff",
    fontSize: 16,
    outline: "none",
    width: "100%",
    maxWidth: 380,
    textAlign: "center",
  },
  card: {
    background: "#16213e",
    padding: 28,
    borderRadius: 16,
    width: "100%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 4,
  },
  btnPlay: {
    padding: "14px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "13px",
    background: "#0f3460",
    color: "#fff",
    border: "1px solid #2a2a4a",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnOutline: {
    padding: "13px",
    background: "transparent",
    color: "#aaa",
    border: "1px solid #2a2a4a",
    borderRadius: 10,
    fontSize: 15,
    cursor: "pointer",
  },
  btnBack: {
    padding: "10px",
    background: "transparent",
    color: "#555",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
  },
  divider: {
    color: "#444",
    textAlign: "center",
    fontSize: 13,
  },
  playHint: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
    marginTop: -6,
  },
  input: {
    padding: "11px 14px",
    borderRadius: 8,
    border: "1px solid #2a2a4a",
    background: "#0f3460",
    color: "#fff",
    fontSize: 15,
    outline: "none",
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