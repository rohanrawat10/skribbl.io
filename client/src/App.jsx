import { useState, useEffect } from "react";
import socket from "./socket";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

export default function App() {
  const [screen, setScreen] = useState("home"); // home | lobby | game
  const [room, setRoom] = useState(null);
  const [myName, setMyName] = useState("");

  useEffect(() => {
    // connect socket when app loads
    socket.connect();

    // ─── Room Events ───────────────────────────────
    socket.on("room_created", ({ room }) => {
      setRoom(room);
      setScreen("lobby");
    });

    socket.on("room_joined", ({ room }) => {
      setRoom(room);
      setScreen("lobby");
    });

    socket.on("player_joined", ({ players }) => {
      setRoom((prev) => ({ ...prev, players }));
    });

    socket.on("player_left", ({ players }) => {
      setRoom((prev) => ({ ...prev, players }));
    });

    // ─── Game Events ───────────────────────────────
    socket.on("game_started", ({ players }) => {
      setRoom((prev) => ({ ...prev, players, phase: "picking" }));
      setScreen("game");
    });

    socket.on("game_over", () => {
      setTimeout(() => setScreen("lobby"), 6000);
    });

    // ─── Errors ────────────────────────────────────
    socket.on("join_error", ({ message }) => alert(message));
    socket.on("error_msg", ({ message }) => alert(message));

    return () => socket.removeAllListeners();
  }, []);

  if (screen === "home") return <Home setMyName={setMyName} />;
  if (screen === "lobby") return <Lobby room={room} />;
  if (screen === "game") return <Game room={room} myName={myName} />;
}