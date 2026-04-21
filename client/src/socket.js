import { io } from "socket.io-client";

const SOCKET_URL = "https://skribbl-io-kppl.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;