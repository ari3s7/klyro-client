import { useEffect, useState } from "react";

export function useAudioSpeaking(
  stream: MediaStream | null | undefined,
  isMuted: boolean = false
): boolean {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!stream || isMuted) {
      setIsSpeaking(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0 || !audioTracks.some((t) => t.enabled)) {
      setIsSpeaking(false);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animationFrameId: number;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setIsSpeaking(average > 10);
        animationFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.error("Audio speaking detection error:", e);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, [stream, isMuted]);

  return isSpeaking;
}
