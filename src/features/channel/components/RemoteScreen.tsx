import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Tv } from "lucide-react";

type Props = {
  stream?: MediaStream | null;
  username?: string;
  isSelf?: boolean;
};

export function RemoteScreen({ stream, username, isSelf }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!stream) return null;

  return (
    <div
      ref={containerRef}
      className={`group relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "w-screen h-screen bg-black border-0 rounded-none shadow-none"
          : "w-full rounded-xl border border-cyan-500/20 bg-zinc-950/90 shadow-[0_0_30px_rgba(0,229,255,0.08)]"
      }`}
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={isSelf}
        className={`block w-full object-contain bg-black ${
          isFullscreen
            ? "h-screen max-h-screen"
            : "h-auto max-h-[35vh] sm:max-h-[50vh] md:max-h-[60vh]"
        }`}
      />

      {/* Cyber overlay badge & controls */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex items-center gap-1.5 sm:gap-2 rounded-md border border-cyan-500/30 bg-zinc-900/85 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium text-cyan-400 backdrop-blur-md shadow-sm">
        <Tv size={12} className="animate-pulse sm:w-3.5 sm:h-3.5" />
        <span className="truncate max-w-[120px] sm:max-w-[200px]">
          {username ? `${username}'s Screen` : "Screen Stream"}
        </span>
        {isSelf && <span className="text-[10px] sm:text-xs text-cyan-500/70">(You)</span>}
      </div>

      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 rounded-md border border-cyan-500/30 bg-zinc-900/85 p-1.5 text-cyan-400 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-cyan-500/20 backdrop-blur-md active:scale-95"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={14} className="sm:w-4 sm:h-4" /> : <Maximize2 size={14} className="sm:w-4 sm:h-4" />}
      </button>
    </div>
  );
}