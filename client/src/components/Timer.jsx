import { useState, useEffect } from "react";
import socket from "../socket";

export default function Timer({ drawTime, phase }) {
  const [timeLeft, setTimeLeft] = useState(drawTime);

  useEffect(() => {
    // reset timer when new drawing starts
    socket.on("drawing_started", () => setTimeLeft(drawTime));

    // tick every second from server
    socket.on("timer_tick", ({ timeLeft }) => setTimeLeft(timeLeft));

    // reset when round starts
    socket.on("round_start", () => setTimeLeft(drawTime));

    return () => {
      socket.off("drawing_started");
      socket.off("timer_tick");
      socket.off("round_start");
    };
  }, [drawTime]);

  // ─── Color changes based on time left ──────────────
  const getColor = () => {
    if (timeLeft <= 10) return "#e94560"; // red — hurry!
    if (timeLeft <= 20) return "#f0a500"; // orange — getting close
    return "#4ecca3";                     // green — plenty of time
  };

  // ─── Width of progress bar ─────────────────────────
  const getBarWidth = () => {
    return `${(timeLeft / drawTime) * 100}%`;
  };

  return (
    <div style={styles.wrapper}>
      {/* Time number */}
      <div style={{ ...styles.time, color: getColor() }}>
        {phase === "drawing" ? timeLeft : "--"}
      </div>

      {/* Progress bar */}
      {phase === "drawing" && (
        <div style={styles.barBg}>
          <div
            style={{
              ...styles.barFill,
              width: getBarWidth(),
              background: getColor(),
            }}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 80,
  },
  time: {
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1,
    transition: "color 0.3s",
  },
  barBg: {
    width: 80,
    height: 4,
    background: "#2a2a4a",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 1s linear, background 0.3s",
  },
};