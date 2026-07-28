import { useEffect, useRef } from "react";
import { LogOut, Mic, MicOff } from "lucide-react";
import type { RemotePeer } from "../hooks/use-voice-channel";
import { useAudioSpeaking } from "../hooks/use-audio-speaking";


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
  stream,
}: {
  username: string;
  avatar: string | null;
  isSelf?: boolean;
  isMuted?: boolean;
  stream?: MediaStream | null;
}) {
  const isSpeaking = useAudioSpeaking(stream, isMuted);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 sm:h-20 sm:w-20 ${
            isSpeaking
              ? "border-green-400 ring-4 ring-green-400/80 ring-offset-2 ring-offset-[#050505] shadow-[0_0_25px_rgba(74,222,128,0.8)] scale-105"
              : isMuted
              ? "border-zinc-700 bg-zinc-800/60"
              : "border-cyan-500/20 bg-zinc-800/60 shadow-[0_0_20px_rgba(0,229,255,0.06)]"
          }`}
        >
          {avatar ? (
            <img src={avatar} alt={username} className="h-full w-full object-cover" />
          ) : (
            <span
              className={`font-heading text-lg font-bold uppercase sm:text-xl ${
                isSpeaking ? "text-green-400" : "text-cyan-400"
              }`}
            >
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {isMuted && (
          <div className="absolute -bottom-1 -right-1 rounded-sm border border-red-500/30 bg-red-600/80 p-1">
            <MicOff size={10} className="text-white" />
          </div>
        )}
      </div>
      <span className="text-xs text-zinc-400 sm:text-sm">
        {username} {isSelf ? <span className="text-cyan-500/60">(you)</span> : ""}
      </span>
    </div>
  );
}

type VoiceChannelPanelProps = {
  participants: RemotePeer[];
  muted: boolean;
  localStream?: MediaStream | null;
  onToggleMute: () => void;
  onLeave: () => void;
  currentUser: { username: string; avatar?: string | null } | undefined;
};

export function VoiceChannelPanel({
  participants,
  muted,
  localStream,
  onToggleMute,
  onLeave,
  currentUser,
}: VoiceChannelPanelProps) {

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050505]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-950/[0.08] via-transparent to-teal-950/[0.05]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.03] blur-[120px]" />

      {/* Header */}
      <div className="relative z-10 flex h-14 items-center border-b border-zinc-800/50 px-4 sm:px-6">
        <h2 className="font-heading text-xs font-bold uppercase tracking-[0.15em] text-cyan-400">
          Voice Channel
        </h2>
      </div>

      {/* Participants */}
      <div className="relative z-10 flex flex-1 flex-wrap items-center justify-center gap-6 p-6 sm:gap-8 sm:p-8">
        {currentUser && (
          <ParticipantTile
            username={currentUser.username}
            avatar={currentUser.avatar ?? null}
            isSelf
            isMuted={muted}
            stream={localStream}
          />
        )}

        {participants.map((p) => (
          <ParticipantTile
            key={p.socketId}
            username={p.username}
            avatar={p.avatar}
            stream={p.stream}
          />
        ))}
      </div>

      {participants.map((p) => (
        <RemoteAudio key={p.socketId} stream={p.stream} />
      ))}

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-3 border-t border-zinc-800/50 p-3 sm:gap-4 sm:p-4">
        <button
  onClick={onToggleMute}
          className={`flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm ${
            muted
              ? "border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-cyan-500/30"
              : "border border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-400 hover:bg-cyan-500/[0.12]"
          }`}
        >
          {muted ? <MicOff size={16} /> : <Mic size={16} />}
          <span className="hidden sm:inline">{muted ? "Unmute" : "Mute"}</span>
        </button>

        <button
  onClick={onLeave}
          className="flex items-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 sm:px-4 sm:text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}