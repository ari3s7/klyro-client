import { useEffect, useRef } from "react";
import { LogOut, Mic, MicOff, Monitor, MonitorOff } from "lucide-react";
import type { RemotePeer } from "../hooks/use-voice-channel";
import { useAudioSpeaking } from "../hooks/use-audio-speaking";
import { RemoteScreen } from "./RemoteScreen";

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
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div className="relative">
        <div
          className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 sm:h-16 sm:w-16 md:h-20 md:w-20 ${
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
              className={`font-heading text-base font-bold uppercase sm:text-lg md:text-xl ${
                isSpeaking ? "text-green-400" : "text-cyan-400"
              }`}
            >
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {isMuted && (
          <div className="absolute -bottom-1 -right-1 rounded-sm border border-red-500/30 bg-red-600/80 p-0.5 sm:p-1">
            <MicOff size={10} className="text-white sm:w-3 sm:h-3" />
          </div>
        )}
      </div>
      <span className="text-[11px] text-zinc-400 sm:text-xs md:text-sm truncate max-w-[80px] sm:max-w-[120px] text-center">
        {username} {isSelf ? <span className="text-cyan-500/60">(you)</span> : ""}
      </span>
    </div>
  );
}

type VoiceChannelPanelProps = {
  participants: RemotePeer[];
  muted: boolean;
  localStream?: MediaStream | null;
  localScreenStream?: MediaStream | null;
  isScreenSharing?: boolean;
  onToggleMute: () => void;
  onLeave: () => void;
  currentUser: { username: string; avatar?: string | null } | undefined;
  onShareScreen: () => void;
  onStopScreenShare?: () => void;
  onClose?: () => void;
};

export function VoiceChannelPanel({
  participants,
  muted,
  localStream,
  localScreenStream,
  isScreenSharing,
  onToggleMute,
  onLeave,
  currentUser,
  onShareScreen,
  onStopScreenShare,
  onClose,
}: VoiceChannelPanelProps) {
  const remoteSharingPeer = participants.find((p) => p.screenStream);

  const activeScreenStream = remoteSharingPeer?.screenStream ?? (isScreenSharing ? localScreenStream : null);
  const activeScreenUsername = remoteSharingPeer?.username ?? (isScreenSharing ? currentUser?.username : undefined);
  const isSelfScreenShare = !remoteSharingPeer && !!isScreenSharing;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050505]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-950/[0.08] via-transparent to-teal-950/[0.05]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.03] blur-[120px]" />

      {/* Header */}
      <div className="relative z-10 flex h-12 sm:h-14 items-center justify-between border-b border-zinc-800/50 px-3 sm:px-6">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-cyan-400">
            Voice Channel
          </h2>
          {activeScreenStream && (
            <span className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live Stream
            </span>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-sm border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            Close
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Screen share stage if active */}
        {activeScreenStream && (
          <div className="w-full">
            <RemoteScreen
              stream={activeScreenStream}
              username={activeScreenUsername}
              isSelf={isSelfScreenShare}
            />
          </div>
        )}

        {/* Participants Grid */}
        <div className="flex flex-1 flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 p-1 sm:p-2">
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
              stream={p.audioStream}
            />
          ))}
        </div>
      </div>

      {/* Hidden audio components for remote participants */}
      {participants.map((p) => (
        <RemoteAudio key={p.socketId} stream={p.audioStream} />
      ))}

      {/* Controls Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-t border-zinc-800/50 p-2.5 sm:p-4 bg-zinc-950/90 backdrop-blur-md">
        <button
          onClick={onToggleMute}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-200 sm:px-4 ${
            muted
              ? "border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-cyan-500/30"
              : "border border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-400 hover:bg-cyan-500/[0.12]"
          }`}
        >
          {muted ? <MicOff size={15} /> : <Mic size={15} />}
          <span>{muted ? "Unmute" : "Mute"}</span>
        </button>

        <button
          onClick={isScreenSharing ? onStopScreenShare : onShareScreen}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-200 sm:px-4 ${
            isScreenSharing
              ? "border border-cyan-400 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
              : "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
          }`}
        >
          {isScreenSharing ? <MonitorOff size={15} /> : <Monitor size={15} />}
          <span>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</span>
        </button>

        <button
          onClick={onLeave}
          className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 sm:px-4"
        >
          <LogOut size={15} />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
}