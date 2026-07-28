import { io } from "socket.io-client";


export const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export function reconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
}