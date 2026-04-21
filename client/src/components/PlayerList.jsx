import socket from "../socket";

export default function PlayerList({ players, drawerId }) {
  // sort by score highest first
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Players</h3>

      {sorted.map((p, i) => (
        <div
          key={p.id}
          style={{
            ...styles.playerRow,
            background: p.id === drawerId ? "#0f3460" : "transparent",
          }}
        >
          {/* Rank */}
          <span style={styles.rank}>#{i + 1}</span>

          {/* Name */}
          <div style={styles.nameWrapper}>
            <span style={styles.name}>
              {p.name}
              {p.id === socket.id ? " (you)" : ""}
            </span>

            {/* Status icons */}
            <div style={styles.icons}>
              {p.id === drawerId && (
                <span style={styles.icon}>✏️</span>
              )}
              {p.hasGuessed && p.id !== drawerId && (
                <span style={styles.icon}>✅</span>
              )}
              {p.isHost && (
                <span style={styles.icon}>👑</span>
              )}
            </div>
          </div>

          {/* Score */}
          <span style={styles.score}>{p.score}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    background: "#16213e",
    borderRadius: 12,
    padding: 12,
    height: "100%",
    overflowY: "auto",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  title: {
    color: "#e94560",
    margin: "0 0 12px",
    fontSize: 15,
    fontWeight: 700,
  },
  playerRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 6px",
    borderRadius: 8,
    marginBottom: 4,
    transition: "background 0.3s",
  },
  rank: {
    color: "#555",
    fontSize: 12,
    minWidth: 26,
  },
  nameWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflow: "hidden",
  },
  name: {
    color: "#fff",
    fontSize: 13,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  icons: {
    display: "flex",
    gap: 4,
  },
  icon: {
    fontSize: 11,
  },
  score: {
    color: "#4ecca3",
    fontWeight: 700,
    fontSize: 14,
    minWidth: 32,
    textAlign: "right",
  },
};