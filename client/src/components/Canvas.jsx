import { useRef, useEffect, useState } from "react";
import socket from "../socket";

export default function Canvas({ isDrawer }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState("pen"); // pen | eraser

  const colors = [
    "#000000", "#ffffff", "#e94560", "#f0a500",
    "#4ecca3", "#378abd", "#9b59b6", "#2ecc71",
    "#e67e22", "#95a5a6", "#1abc9c", "#e74c3c",
    "#3498db", "#f39c12", "#8e44ad", "#27ae60",
  ];

  // ─── Draw a stroke on canvas ──────────────────────
  const drawStroke = (ctx, data) => {
    if (data.type === "start") {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else if (data.type === "move") {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }
  };

  // ─── Get mouse/touch position on canvas ──────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // ─── Socket Events ────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // someone drew something
    socket.on("draw_data", (data) => drawStroke(ctx, data));

    // canvas was cleared
    socket.on("canvas_cleared", () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // undo happened — redraw entire history
    socket.on("undo_done", ({ drawHistory }) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawHistory.forEach((d) => drawStroke(ctx, d));
    });

    // catch up if joined mid game
    socket.on("draw_history", ({ history }) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      history.forEach((d) => drawStroke(ctx, d));
    });

    // new drawing started — clear canvas and request history
    socket.on("drawing_started", () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      socket.emit("request_draw_history");
    });

    return () => {
      socket.off("draw_data");
      socket.off("canvas_cleared");
      socket.off("undo_done");
      socket.off("draw_history");
      socket.off("drawing_started");
    };
  }, []);

  // ─── Mouse Events (drawer only) ───────────────────
  const handleMouseDown = (e) => {
    if (!isDrawer) return;
    e.preventDefault();
    isDrawing.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    const activeColor = tool === "eraser" ? "#ffffff" : color;
    const activeSize = tool === "eraser" ? size * 4 : size;

    const data = {
      type: "start",
      x: pos.x,
      y: pos.y,
      color: activeColor,
      size: activeSize,
    };

    drawStroke(ctx, data);
    socket.emit("draw_start", data);
  };

  const handleMouseMove = (e) => {
    if (!isDrawer || !isDrawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    const data = { type: "move", x: pos.x, y: pos.y };
    drawStroke(ctx, data);
    socket.emit("draw_move", data);
  };

  const handleMouseUp = () => {
    if (!isDrawer || !isDrawing.current) return;
    isDrawing.current = false;
    socket.emit("draw_end");
  };

  // ─── Toolbar Actions ──────────────────────────────
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    socket.emit("canvas_clear");
  };

  const handleUndo = () => {
    socket.emit("draw_undo");
  };

  return (
    <div style={styles.wrapper}>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={550}
        style={styles.canvas(isDrawer)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />

      {/* Toolbar — only visible to drawer */}
      {isDrawer && (
        <div style={styles.toolbar}>

          {/* Colors */}
          <div style={styles.colors}>
            {colors.map((c) => (
              <div
                key={c}
                onClick={() => { setColor(c); setTool("pen"); }}
                style={{
                  ...styles.colorDot,
                  background: c,
                  border: color === c && tool === "pen"
                    ? "3px solid #fff"
                    : "2px solid #444",
                  transform: color === c && tool === "pen"
                    ? "scale(1.2)"
                    : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Tools Row */}
          <div style={styles.toolsRow}>

            {/* Brush Size */}
            <label style={styles.label}>
              Size: {size}px
              <input
                type="range"
                min={2}
                max={40}
                value={size}
                onChange={(e) => setSize(+e.target.value)}
                style={{ width: 80 }}
              />
            </label>

            {/* Eraser */}
            <button
              style={{
                ...styles.toolBtn,
                background: tool === "eraser" ? "#4ecca3" : "#0f3460",
                color: tool === "eraser" ? "#000" : "#fff",
              }}
              onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
            >
              {tool === "eraser" ? "✏️ Pen" : "⬜ Eraser"}
            </button>

            {/* Undo */}
            <button style={styles.toolBtn} onClick={handleUndo}>
              ↩ Undo
            </button>

            {/* Clear */}
            <button
              style={{ ...styles.toolBtn, background: "#e94560" }}
              onClick={handleClear}
            >
              🗑 Clear
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    height: "100%",
  },
  canvas: (isDrawer) => ({
    width: "100%",
    borderRadius: 12,
    border: "2px solid #2a2a4a",
    cursor: isDrawer ? "crosshair" : "not-allowed",
    touchAction: "none",
    background: "#fff",
  }),
  toolbar: {
    background: "#16213e",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  colors: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.15s, border 0.15s",
  },
  toolsRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  label: {
    color: "#aaa",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  toolBtn: {
    padding: "7px 14px",
    background: "#0f3460",
    color: "#fff",
    border: "1px solid #2a2a4a",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
};