import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../../../lib/socket";

type VoiceParticipant = {
  socketId: string;
  userId: string;
  username: string;
  avatar: string | null;
};

export type RemotePeer = VoiceParticipant & { stream?: MediaStream };

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export function useVoiceChannel(channelId: string | null) {
  const [participants, setParticipants] = useState<RemotePeer[]>([]);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
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

    pc.ontrack = (event) => {
      console.log("[peer] ontrack fired from", remoteSocketId, event.streams[0]);
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === remoteSocketId ? { ...p, stream: event.streams[0] } : p
        )
      );
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

  const join = useCallback(async () => {
    if (!channelId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);

    socket.emit("join-voice-channel", channelId);
    setJoined(true);
  }, [channelId]);

  const leave = useCallback(() => {
    if (!channelId) return;
    hasJoinedRef.current = false;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    async function handleExistingParticipants(existing: VoiceParticipant[]) {
      setParticipants(existing.map((p) => ({ ...p })));

      for (const peer of existing) {
        const pc = createPeerConnection(peer.socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("[peer] sending offer to", peer.socketId);
        socket.emit("voice-offer", { to: peer.socketId, offer });
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
  }, [channelId, createPeerConnection]);

  return { participants, joined, muted, localStream, join, leave, toggleMute };
}