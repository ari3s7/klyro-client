import { io } from "socket.io-client";


export const socket = io(window.location.origin, {
  withCredentials: true,
});

export function reconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
}