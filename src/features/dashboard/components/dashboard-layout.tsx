import { useState } from "react";
import ChatArea from "./chat-area";
import ChannelSidebar from "./channel-sidebar";
import ServerSidebar from "./server-sidebar";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function DashboardLayout() {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  useEffect(() => {
    socket.connect();
    console.log("Connecting socket...");
    return () => {
      socket.disconnect()
    };
  }, []);

 return (
  <main className="flex h-screen bg-zinc-950 text-white overflow-hidden">
    <div className="w-16 md:w-20 shrink-0">
      <ServerSidebar
        selectedServerId={selectedServerId}
        onSelectServer={(serverId) => {
          setSelectedServerId(serverId);
          setSelectedChannelId(null);
        }}
      />
    </div>

    <div
      className={`${
        selectedChannelId ? "hidden md:flex" : "flex"
      } w-56 md:w-72 shrink-0`}
    >
      <ChannelSidebar
        selectedServerId={selectedServerId}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
      />
    </div>

    <div
      className={`${
        selectedChannelId ? "flex" : "hidden md:flex"
      } flex-1 min-w-0`}
    >
      <ChatArea
        selectedChannelId={selectedChannelId}
      />
    </div>
  </main>
)
};