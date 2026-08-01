import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../../../lib/socket";

type VoiceParticipant = {
  socketId: string;
  userId: string;
  username: string;
  avatar: string | null;
};

export type RemotePeer = VoiceParticipant & { audioStream?: MediaStream; screenStream?: MediaStream; };

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export function useVoiceChannel(channelId: string | null) {
  const [participants, setParticipants] = useState<RemotePeer[]>([]);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenSendersRef = useRef<Map<string, RTCRtpSender>>(new Map());
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const hasJoinedRef = useRef(false);

  const createPeerConnection = useCallback((remoteSocketId: string) => {
    const existing = peersRef.current.get(remoteSocketId);
    if (existing) return existing;

    console.log("[peer] creating connection to", remoteSocketId);
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    if (screenStreamRef.current) {
      const screenTrack = screenStreamRef.current.getVideoTracks()[0];
      if (screenTrack) {
        const sender = pc.addTrack(screenTrack, screenStreamRef.current);
        screenSendersRef.current.set(remoteSocketId, sender);
      }
    }

    pc.ontrack = (event) => {
      const track = event.track;

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.socketId !== remoteSocketId) return p;

          if (track.kind === "audio") {
            return {
              ...p,
              audioStream: event.streams[0],
            };
          }

          if (track.kind === "video") {
            return {
              ...p,
              screenStream: event.streams[0],
            };
          }

          return p;
        })
      );

      track.onended = () => {
        if (track.kind === "video") {
          setParticipants((prev) =>
            prev.map((p) =>
              p.socketId === remoteSocketId ? { ...p, screenStream: undefined } : p
            )
          );
        }
      };
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[peer] sending ICE candidate to", remoteSocketId);
        socket.emit("voice-ice-candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[peer]", remoteSocketId, "connectionState:", pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[peer]", remoteSocketId, "iceConnectionState:", pc.iceConnectionState);
    };

    peersRef.current.set(remoteSocketId, pc);
    return pc;
  }, []);

  const renegotiate = useCallback(
    async (remoteSocketId: string) => {
      const pc = peersRef.current.get(remoteSocketId);

      if (!pc) return;

      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);

      socket.emit("voice-offer", {
        to: remoteSocketId,
        offer,
      });
    },
    []
  );

  const join = useCallback(async () => {
    if (!channelId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);

    socket.emit("join-voice-channel", channelId);
    setJoined(true);
  }, [channelId]);

  const stopScreenShare = useCallback(async () => {
    if (!screenStreamRef.current) return;

    console.log("[voice] stopping screen share...");
    screenStreamRef.current.getTracks().forEach((t) => t.stop());

    for (const [socketId, pc] of peersRef.current.entries()) {
      const sender = screenSendersRef.current.get(socketId);
      if (sender) {
        try {
          pc.removeTrack(sender);
        } catch (err) {
          console.error("Failed to remove screen track from peer", socketId, err);
        }
      }
      await renegotiate(socketId);
    }

    screenSendersRef.current.clear();
    screenStreamRef.current = null;
    setLocalScreenStream(null);
    setIsScreenSharing(false);
  }, [renegotiate]);

  const startScreenShare = useCallback(async () => {
    try {
      if (screenStreamRef.current) {
        await stopScreenShare();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = stream;
      setLocalScreenStream(stream);
      setIsScreenSharing(true);

      const screenTrack = stream.getVideoTracks()[0];

      screenTrack.onended = () => {
        console.log("Screen sharing ended by user/browser");
        stopScreenShare();
      };

      for (const [socketId, pc] of peersRef.current.entries()) {
        const sender = pc.addTrack(screenTrack, stream);
        screenSendersRef.current.set(socketId, sender);
        await renegotiate(socketId);
      }
    } catch (err) {
      console.error("Failed to start screen sharing", err);
      setLocalScreenStream(null);
      setIsScreenSharing(false);
    }
  }, [renegotiate, stopScreenShare]);

  const leave = useCallback(() => {
    if (!channelId) return;
    hasJoinedRef.current = false;

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setLocalScreenStream(null);
      setIsScreenSharing(false);
    }

    screenSendersRef.current.clear();
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    socket.emit("leave-voice-channel", channelId);
    setParticipants([]);
    setJoined(false);
  }, [channelId]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }, [muted]);

  // Auto-join the moment a channelId is provided; auto-leave on unmount
  // or when channelId changes.
  useEffect(() => {
    if (!channelId) return;

    join();

    return () => {
      leave();
    };

  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    async function handleExistingParticipants(existing: VoiceParticipant[]) {
      setParticipants(existing.map((p) => ({ ...p })));

      for (const peer of existing) {
        createPeerConnection(peer.socketId);

        await renegotiate(peer.socketId);
      }
    }

    function handlePeerJoined(peer: VoiceParticipant) {
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === peer.socketId)) return prev;
        return [...prev, { ...peer }];
      });
    }

    async function handleOffer({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) {
      console.log("[peer] received offer from", from);
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("voice-answer", { to: from, answer });
    }

    async function handleAnswer({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) {
      console.log("[peer] received answer from", from);
      const pc = peersRef.current.get(from);
      if (pc && pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    }

    async function handleIceCandidate({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) {
      console.log("[peer] received ICE candidate from", from);
      const pc = peersRef.current.get(from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Failed to add ICE candidate", err);
        }
      }
    }

    function handlePeerLeft({ socketId }: { socketId: string }) {
      const pc = peersRef.current.get(socketId);
      pc?.close();
      peersRef.current.delete(socketId);
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    }

    socket.on("voice-participants", handleExistingParticipants);
    socket.on("peer-joined-voice", handlePeerJoined);
    socket.on("voice-offer", handleOffer);
    socket.on("voice-answer", handleAnswer);
    socket.on("voice-ice-candidate", handleIceCandidate);
    socket.on("peer-left-voice", handlePeerLeft);

    return () => {
      socket.off("voice-participants", handleExistingParticipants);
      socket.off("peer-joined-voice", handlePeerJoined);
      socket.off("voice-offer", handleOffer);
      socket.off("voice-answer", handleAnswer);
      socket.off("voice-ice-candidate", handleIceCandidate);
      socket.off("peer-left-voice", handlePeerLeft);
    };
  }, [channelId, createPeerConnection, renegotiate]);

  return {
    participants,
    joined,
    muted,
    localStream,
    localScreenStream,
    isScreenSharing,
    join,
    leave,
    toggleMute,
    startScreenShare,
    stopScreenShare,
  };
}