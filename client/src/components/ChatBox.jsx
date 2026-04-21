import { useState, useEffect, useRef } from "react";
import socket from "../socket";

export default function ChatBox({ isDrawer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    // ─── Incoming Chat ───────────────────────────────
    socket.on("chat_message", ({ playerName, text }) => {
      setMessages((prev) => [
        ...prev,
        { type: "chat", playerName, text },
      ]);
    });

    // ─── Correct Guess ───────────────────────────────
    socket.on("guess_result", ({ correct, playerName, points }) => {
      if (correct) {
        setMessages((prev) => [
          ...prev,
          {
            type: "correct",
            text: `🎉 ${playerName} guessed the word! +${points} pts`,
          },
        ]);
      }
    });

    // ─── Round End ───────────────────────────────────
    socket.on("round_end", ({ word }) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          text: `The word was: ${word}`,
        },
      ]);
    });

    // ─── Round Start — clear messages ─────────────────
    socket.on("round_start", () => {
      setMessages([]);
    });

    return () => {
      socket.off("chat_message");
      socket.off("guess_result");
      socket.off("round_end");
      socket.off("round_start");
    };
  }, []);

  // auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (isDrawer) {
      // drawer can only chat, not guess
      socket.emit("chat", { text: input.trim() });
    } else {
      // others send guesses
      socket.emit("guess", { text: input.trim() });
    }

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // ─── Message color by type ────────────────────────
  const getMessageStyle = (type) => {
    if (type === "correct") return styles.msgCorrect;
    if (type === "system") return styles.msgSystem;
    return styles.msgChat;
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        {isDrawer ? "💬 Chat" : "💬 Guess the word!"}
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={styles.empty}>
            {isDrawer ? "Chat with players!" : "Type your guess below..."}
          </p>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={getMessageStyle(msg.type)}>
            {msg.type === "chat" && (
              <span style={styles.playerName}>{msg.playerName}: </span>
            )}
            {msg.text}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder={isDrawer ? "Say something..." : "Type your guess..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={100}
        />
        <button style={styles.btn} onClick={handleSend}>
          Send
        </button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    background: "#16213e",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a4a",
    color: "#e94560",
    fontWeight: 700,
    fontSize: 14,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  empty: {
    color: "#444",
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
  },
  msgChat: {
    color: "#ccc",
    fontSize: 13,
    wordBreak: "break-word",
    lineHeight: 1.4,
  },
  msgCorrect: {
    color: "#4ecca3",
    fontSize: 13,
    fontWeight: 700,
    background: "#0a2a1a",
    padding: "6px 10px",
    borderRadius: 6,
    wordBreak: "break-word",
  },
  msgSystem: {
    color: "#f0a500",
    fontSize: 13,
    fontWeight: 600,
    background: "#2a1a00",
    padding: "6px 10px",
    borderRadius: 6,
    wordBreak: "break-word",
  },
  playerName: {
    color: "#4ecca3",
    fontWeight: 600,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 10,
    borderTop: "1px solid #2a2a4a",
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    background: "#0f3460",
    border: "1px solid #2a2a4a",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  btn: {
    padding: "9px 16px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
};