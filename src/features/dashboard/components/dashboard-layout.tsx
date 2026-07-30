import { useState } from "react";
import ChatArea from "./chat-area";
import ChannelSidebar from "./channel-sidebar";
import ServerSidebar from "./server-sidebar";
import { useEffect } from "react";
import { reconnectSocket } from "@/lib/socket";
import { useQuery } from "@tanstack/react-query";
import { getServers } from "@/features/server/api/server-api";
import { VoiceChannelPanel } from "@/features/channel/components/voice-channel-panel";
import { useVoiceChannel } from "@/features/channel/hooks/use-voice-channel";
import { getCurrentUser } from "@/features/auth/api/get-current-user";
import { MembersPanel } from "@/features/server/components/members-panel";
import { Users } from "lucide-react";

export default function DashboardLayout() {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string | null>(null);
  const [voicePanelExpanded, setVoicePanelExpanded] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const { data: servers = [] } = useQuery({
  queryKey: ["servers"],
  queryFn: getServers,
});
const { data: currentUser } = useQuery({
  queryKey: ["current-user"],
  queryFn: getCurrentUser,
});

const selectedServer = servers.find(
  (server) => server.id === selectedServerId
);
const { participants, muted, localStream, leave, toggleMute } = useVoiceChannel(activeVoiceChannelId);

useEffect(() => {
  if (currentUser?.id) {
    reconnectSocket();
  }
}, [currentUser?.id]);

function handleSelectChannel(channelId: string) {
  const channel = selectedServer?.channels.find((c) => c.id === channelId);

  if (channel?.type === "VOICE") {
  
    setActiveVoiceChannelId(channelId);
    setVoicePanelExpanded(true);
  } else {

    setSelectedChannelId(channelId);
    if (activeVoiceChannelId) {
      setVoicePanelExpanded(false);
    }
  }
}

function handleLeaveVoice() {
  leave();
  setActiveVoiceChannelId(null);
}

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
        onSelectChannel={handleSelectChannel}
        onLeaveServer={() => {
          setSelectedServerId(null);
          setSelectedChannelId(null);
        }}
/>
    </div>

    <div
  className={`${
    selectedChannelId ? "flex" : "hidden md:flex"
  } flex-1 min-w-0`}
>
  <ChatArea
    selectedChannelId={selectedChannelId}
    onBack={() => setSelectedChannelId(null)}
  />
</div>

{selectedServerId && (
  <button
    onClick={() => setMembersOpen((prev) => !prev)}
    className="fixed top-4 right-3 z-30 flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-400"
  >
    <Users size={14} />
  </button>
)}

{membersOpen && selectedServerId && (
  <>
    {/* Desktop: side panel */}
    <div className="hidden md:flex">
      <MembersPanel serverId={selectedServerId} />
    </div>

    {/* Mobile: full-screen overlay */}
    <div className="fixed inset-0 z-50 md:hidden">
      <MembersPanel serverId={selectedServerId} onClose={() => setMembersOpen(false)} />
    </div>
  </>
)}

{activeVoiceChannelId && (
  <>
    {/* Desktop: permanent side panel */}
    <div className="w-72 shrink-0 border-l border-zinc-800/50 hidden md:flex">
      <VoiceChannelPanel
        participants={participants}
        muted={muted}
        localStream={localStream}
        onToggleMute={toggleMute}
        onLeave={handleLeaveVoice}
        currentUser={currentUser}
      />
    </div>

    {/* Mobile: floating mini-bar, tap to expand */}
    <div className="md:hidden">
      {voicePanelExpanded ? (
        <div className="fixed inset-0 z-50 bg-[#050505]">
          <button
            onClick={() => setVoicePanelExpanded(false)}
            className="absolute right-4 top-4 z-20 rounded-sm border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-300"
          >
            Close
          </button>
          <VoiceChannelPanel
            participants={participants}
            muted={muted}
            localStream={localStream}
            onToggleMute={toggleMute}
            onLeave={() => {
              handleLeaveVoice();
              setVoicePanelExpanded(false);
            }}
            currentUser={currentUser}
          />
        </div>
      ) : (
        <button
          onClick={() => setVoicePanelExpanded(true)}
          className="fixed top-16 right-3 z-40 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-zinc-900/95 px-3 py-1.5 text-[11px] text-cyan-400 shadow-lg"
        >
          🔊 {participants.length + 1} in call
        </button>
      )}
    </div>
  </>
)}
  </main>
)
};