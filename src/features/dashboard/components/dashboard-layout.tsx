import { useState } from "react";
import ChatArea from "./chat-area";
import ChannelSidebar from "./channel-sidebar";
import ServerSidebar from "./server-sidebar";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useQuery } from "@tanstack/react-query";
import { getServers } from "@/features/server/api/server-api";
import { VoiceChannelPanel } from "@/features/channel/components/voice-channel-panel";

export default function DashboardLayout() {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { data: servers = [] } = useQuery({
  queryKey: ["servers"],
  queryFn: getServers,
});

const selectedServer = servers.find(
  (server) => server.id === selectedServerId
);
const selectedChannel = selectedServer?.channels.find(
  (channel) => channel.id === selectedChannelId
);

 useEffect(() => {
  console.log("Socket ready:", socket.id);
}, []);

 return (
  <main className="flex h-screen bg-[#050505] text-zinc-200 overflow-hidden">
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
        selectedServer={selectedServer}
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
  {selectedChannel?.type === "VOICE" ? (
    <VoiceChannelPanel
  channelId={selectedChannel.id}
  onLeave={() => setSelectedChannelId(null)}
/>
  ) : (
    <ChatArea selectedChannelId={selectedChannelId} />
  )}
</div>
  </main>
)
};