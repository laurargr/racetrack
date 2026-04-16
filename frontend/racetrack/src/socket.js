import { io } from "socket.io-client";

export const socket = io("https://racetrack-g3wj.onrender.com", {
  autoConnect: false,
  reconnection: false,
});
