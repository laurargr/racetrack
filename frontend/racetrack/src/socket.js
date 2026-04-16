import { io } from "socket.io-client";

const SERVER_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.BACKEND_URL ||
  "http://localhost:3000";

console.log("Connecting to server at:", SERVER_URL);

export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: false,
});
