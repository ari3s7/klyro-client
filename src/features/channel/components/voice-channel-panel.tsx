import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Mic, MicOff } from "lucide-react";
import { useVoiceChannel } from "../hooks/use-voice-channel";
import { getCurrentUser } from "@/features/auth/api/get-current-user";

function RemoteAudio({ stream }: { stream?: MediaStream }) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return <audio ref={ref} autoPlay playsInline />;
}

function ParticipantTile({
  username,
  avatar,
  isSelf,
  isMuted,
}: {
  username: string;
  avatar: string | null;
  isSelf?: boolean;
  isMuted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-white">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {isMuted && (
          <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1">
            <MicOff size={12} className="text-white" />
          </div>
        )}
      </div>
      <span className="text-sm text-zinc-300">
        {username} {isSelf ? "(you)" : ""}
      </span>
    </div>
  );
}

type VoiceChannelPanelProps = {
  channelId: string;
  onLeave: () => void;
};

export function VoiceChannelPanel({
  channelId,
  onLeave,
}: VoiceChannelPanelProps) {
  const { participants, muted, leave, toggleMute } = useVoiceChannel(channelId);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900">
      <div className="flex-1 flex flex-wrap items-center justify-center gap-8 p-8">
        {currentUser && (
          <ParticipantTile
            username={currentUser.username}
            avatar={currentUser.avatar ?? null}
            isSelf
            isMuted={muted}
          />
        )}

        {participants.map((p) => (
          <ParticipantTile key={p.socketId} username={p.username} avatar={p.avatar} />
        ))}
      </div>

      {participants.map((p) => (
        <RemoteAudio key={p.socketId} stream={p.stream} />
      ))}

      <div className="flex items-center justify-center gap-3 p-4 border-t border-zinc-800">
        <button
          onClick={toggleMute}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition"
        >
          {muted ? <MicOff size={18} /> : <Mic size={18} />}
          {muted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={() => {
            leave();
            onLeave();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
        >
          <LogOut size={18} />
          Leave
        </button>
      </div>
    </div>
  );
}