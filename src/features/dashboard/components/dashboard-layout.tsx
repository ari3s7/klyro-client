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
    <main className="flex h-screen bg-zinc-950 text-white">
      <ServerSidebar
        selectedServerId={selectedServerId}
        onSelectServer={(serverId) => {
          setSelectedServerId(serverId);
          setSelectedChannelId(null);
        }}
      />

      <ChannelSidebar
        selectedServerId={selectedServerId}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
      />

      <ChatArea
        selectedChannelId={selectedChannelId}
      />
    </main>
  );
}