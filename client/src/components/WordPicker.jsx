import socket from "../socket";

export default function WordPicker({ words, onPick }) {
  const handlePick = (word) => {
    // tell server which word was chosen
    socket.emit("word_chosen", { word });
    onPick(word);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Title */}
        <h2 style={styles.title}>Choose a word to draw</h2>
        <p style={styles.subtitle}>Pick wisely — others will try to guess it!</p>

        {/* Word Buttons */}
        <div style={styles.words}>
          {words.map((word) => (
            <button
              key={word}
              style={styles.wordBtn}
              onClick={() => handlePick(word)}
              onMouseEnter={(e) => {
                e.target.style.background = "#e94560";
                e.target.style.borderColor = "#e94560";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#0f3460";
                e.target.style.borderColor = "#4ecca3";
                e.target.style.transform = "scale(1)";
              }}
            >
              {word}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    borderRadius: 12,
  },
  modal: {
    background: "#16213e",
    padding: "36px 40px",
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    maxWidth: 480,
    width: "90%",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
    marginBottom: 28,
  },
  words: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  wordBtn: {
    padding: "14px 28px",
    background: "#0f3460",
    color: "#fff",
    border: "2px solid #4ecca3",
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    textTransform: "capitalize",
  },
};