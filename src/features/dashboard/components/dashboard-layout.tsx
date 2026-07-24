import { useState } from "react";
import ChatArea from "./chat-area";
import ChannelSidebar from "./channel-sidebar";
import ServerSidebar from "./server-sidebar";

export default function DashboardLayout() {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  return (
    <main className="flex h-screen bg-zinc-950 text-white">
      <ServerSidebar
        selectedServerId={selectedServerId}
        onSelectServer={setSelectedServerId}
      />

      <ChannelSidebar selectedServerId={selectedServerId} />

      <ChatArea />
    </main>
  );
}