import { useEffect, useState } from "react";
import { socket } from "./socket";

export function useOnlineCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function handleCount(newCount: number) {
      setCount(newCount);
    }

    socket.on("online-count", handleCount);
    socket.on("connect", () => socket.emit("request-online-count"));

    if (socket.connected) {
      socket.emit("request-online-count");
    }

    return () => {
      socket.off("online-count", handleCount);
      socket.off("connect");
    };
  }, []);

  return count;
}