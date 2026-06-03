import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  CallChatMessage,
  CallPhase,
  CallSttEntry,
  RoomChatPayload,
  RoomPayload,
  RoomSttPayload,
  WebRtcSignalPayload,
} from '@/features/student/types/webrtc-call.types';
import { useCallAutoStt } from '@/features/student/hooks/use-call-auto-stt';
import { webrtcLeave, webrtcMatch } from '@/features/student/services/studentApi';
import { getWebRtcSignalingUrl } from '@/utils/webrtc-signaling-url';

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];
const MATCH_POLL_MS = 2000;

type ServerWsMessage =
  | { type: 'joined'; roomId: string; peerCount?: number }
  | { type: 'peer-joined'; userId: string; peerCount?: number }
  | { type: 'peer-left'; userId: string }
  | { type: 'error'; message: string }
  | { from: string; data: RoomPayload };

function parseWsMessage(raw: string): ServerWsMessage | null {
  try {
    return JSON.parse(raw) as ServerWsMessage;
  } catch {
    return null;
  }
}

function isWebRtcSignal(data: RoomPayload): data is WebRtcSignalPayload {
  return data.kind === 'offer' || data.kind === 'answer' || data.kind === 'ice';
}

export function useWebRtcCall() {
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [peerLeftNotice, setPeerLeftNotice] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<CallChatMessage[]>([]);
  const [sttEntries, setSttEntries] = useState<CallSttEntry[]>([]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitiatorRef = useRef(false);
  const roomIdRef = useRef<string | null>(null);
  const offerSentRef = useRef(false);
  const negotiatingRef = useRef(false);
  const intentionalLeaveRef = useRef(false);
  const peerDisconnectedRef = useRef(false);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const sendRoomPayload = useCallback((payload: RoomPayload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'signal', payload }));
  }, []);

  const sendWsLeave = useCallback(() => {
    const ws = wsRef.current;
    const rid = roomIdRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !rid) return;
    intentionalLeaveRef.current = true;
    ws.send(JSON.stringify({ type: 'leave', roomId: rid }));
  }, []);

  const teardownMedia = useCallback(() => {
    try {
      pcRef.current?.close();
    } catch {
      /* already closed */
    }
    pcRef.current = null;

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    } catch {
      /* ignore */
    }
    wsRef.current = null;
    offerSentRef.current = false;
    negotiatingRef.current = false;

    setLocalStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  const handlePeerDisconnected = useCallback(() => {
    if (intentionalLeaveRef.current || peerDisconnectedRef.current) return;
    peerDisconnectedRef.current = true;
    teardownMedia();
    setRemoteStream(null);
    setPeerLeftNotice('Bạn học đã rời cuộc gọi');
    setPhase('peer-left');
    void webrtcLeave();
  }, [teardownMedia]);

  const endCall = useCallback(async () => {
    stopPoll();
    intentionalLeaveRef.current = true;
    sendWsLeave();
    teardownMedia();
    roomIdRef.current = null;
    setRoomId(null);
    setPeerId(null);
    setPhase('ended');
    try {
      await webrtcLeave();
    } catch {
      /* ignore */
    }
  }, [sendWsLeave, stopPoll, teardownMedia]);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendRoomPayload({ kind: 'ice', candidate: event.candidate.toJSON() });
      }
    };
    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      setRemoteStream(stream);
      setPhase('connected');
    };
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        setPhase('connected');
        return;
      }
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        handlePeerDisconnected();
      }
    };
    pcRef.current = pc;
    return pc;
  }, [handlePeerDisconnected, sendRoomPayload]);

  const attachLocalTracks = useCallback(async (pc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    setLocalStream(stream);
    return stream;
  }, []);

  const tryCreateOffer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !isInitiatorRef.current || offerSentRef.current || negotiatingRef.current) return;
    negotiatingRef.current = true;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendRoomPayload({ kind: 'offer', sdp: offer });
      offerSentRef.current = true;
    } catch {
      /* negotiation race when peer left */
    } finally {
      negotiatingRef.current = false;
    }
  }, [sendRoomPayload]);

  const handleRemoteSignal = useCallback(
    async (payload: WebRtcSignalPayload) => {
      const pc = pcRef.current;
      if (!pc || peerDisconnectedRef.current) return;

      try {
        if (payload.kind === 'offer') {
          negotiatingRef.current = true;
          await pc.setRemoteDescription(payload.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendRoomPayload({ kind: 'answer', sdp: answer });
          return;
        }

        if (payload.kind === 'answer') {
          negotiatingRef.current = true;
          await pc.setRemoteDescription(payload.sdp);
          return;
        }

        if (payload.kind === 'ice' && payload.candidate) {
          await pc.addIceCandidate(payload.candidate);
        }
      } catch {
        /* peer may have left mid-negotiation */
      } finally {
        negotiatingRef.current = false;
      }
    },
    [sendRoomPayload],
  );

  const appendSttEntry = useCallback((from: 'me' | 'peer', text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const entry = { id: crypto.randomUUID(), from, text: trimmed, at: Date.now() };
    setSttEntries((prev) => [...prev, entry]);
  }, []);

  const publishMyStt = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const payload: RoomSttPayload = {
        kind: 'stt',
        id: crypto.randomUUID(),
        text: trimmed,
        at: Date.now(),
      };
      sendRoomPayload(payload);
      setSttEntries((prev) => [
        ...prev,
        { id: payload.id, from: 'me', text: trimmed, at: payload.at },
      ]);
    },
    [sendRoomPayload],
  );

  const { liveLine: sttLiveLine, listening: sttListening } = useCallAutoStt({
    active: phase === 'connected',
    micEnabled: micOn,
    localStream,
    onMyUtterance: publishMyStt,
  });

  const handleRoomPayload = useCallback((_from: string, payload: RoomPayload) => {
    if (isWebRtcSignal(payload)) {
      void handleRemoteSignal(payload);
      return;
    }

    if (payload.kind === 'chat') {
      setChatMessages((prev) => [
        ...prev,
        { id: payload.id, from: 'peer', text: payload.text, at: payload.at },
      ]);
      return;
    }

    if (payload.kind === 'stt') {
      appendSttEntry('peer', payload.text);
    }
  }, [appendSttEntry, handleRemoteSignal]);

  const connectSignaling = useCallback(
    (matchedRoomId: string) =>
      new Promise<WebSocket>((resolve, reject) => {
        const ws = new WebSocket(getWebRtcSignalingUrl());
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'join', roomId: matchedRoomId }));
        };

        ws.onmessage = (event) => {
          const msg = parseWsMessage(String(event.data));
          if (!msg) return;

          if ('type' in msg && msg.type === 'error') {
            setError(msg.message);
            return;
          }

          if ('type' in msg && msg.type === 'peer-left') {
            handlePeerDisconnected();
            return;
          }

          if ('type' in msg && msg.type === 'joined') {
            resolve(ws);
            if ((msg.peerCount ?? 0) >= 2 && isInitiatorRef.current) {
              void tryCreateOffer();
            }
            return;
          }

          if ('type' in msg && msg.type === 'peer-joined') {
            if (isInitiatorRef.current) {
              void tryCreateOffer();
            }
            return;
          }

          if ('from' in msg && msg.data) {
            handleRoomPayload(msg.from, msg.data);
          }
        };

        ws.onerror = () => reject(new Error('Không kết nối được signaling'));
        ws.onclose = () => {
          if (!intentionalLeaveRef.current && !peerDisconnectedRef.current) {
            handlePeerDisconnected();
          }
        };
      }),
    [handlePeerDisconnected, handleRoomPayload, tryCreateOffer],
  );

  const resetSessionRefs = useCallback(() => {
    intentionalLeaveRef.current = false;
    peerDisconnectedRef.current = false;
    offerSentRef.current = false;
    negotiatingRef.current = false;
    setPeerLeftNotice(null);
    setChatMessages([]);
    setSttEntries([]);
  }, []);

  const startSession = useCallback(
    async (matchedRoomId: string, matchedPeerId: string, isInitiator: boolean) => {
      resetSessionRefs();
      setPhase('connecting');
      setError(null);
      roomIdRef.current = matchedRoomId;
      setRoomId(matchedRoomId);
      setPeerId(matchedPeerId);
      isInitiatorRef.current = isInitiator;

      try {
        const pc = createPeerConnection();
        await attachLocalTracks(pc);
        await connectSignaling(matchedRoomId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể bắt đầu cuộc gọi');
        intentionalLeaveRef.current = true;
        teardownMedia();
        roomIdRef.current = null;
        setRoomId(null);
        setPeerId(null);
        setPhase('idle');
        void webrtcLeave();
      }
    },
    [
      attachLocalTracks,
      connectSignaling,
      createPeerConnection,
      resetSessionRefs,
      teardownMedia,
    ],
  );

  const applyMatchResult = useCallback(
    async (data: {
      matched: boolean;
      roomId: string | null;
      peerId?: string;
      isInitiator?: boolean;
    }) => {
      if (data.matched && data.roomId && data.peerId) {
        stopPoll();
        await startSession(data.roomId, data.peerId, Boolean(data.isInitiator));
        return true;
      }
      return false;
    },
    [startSession, stopPoll],
  );

  const startMatching = useCallback(async () => {
    resetSessionRefs();
    setError(null);
    setPhase('searching');
    try {
      const data = await webrtcMatch();
      const matched = await applyMatchResult(data);
      if (matched) return;

      stopPoll();
      pollRef.current = setInterval(() => {
        void (async () => {
          try {
            const next = await webrtcMatch();
            await applyMatchResult(next);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Ghép cặp thất bại');
            stopPoll();
            setPhase('idle');
          }
        })();
      }, MATCH_POLL_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ghép cặp thất bại');
      setPhase('idle');
    }
  }, [applyMatchResult, resetSessionRefs, stopPoll]);

  const cancelMatching = useCallback(async () => {
    stopPoll();
    intentionalLeaveRef.current = true;
    sendWsLeave();
    teardownMedia();
    roomIdRef.current = null;
    setRoomId(null);
    setPeerId(null);
    setPhase('idle');
    setError(null);
    try {
      await webrtcLeave();
    } catch {
      /* ignore */
    }
  }, [sendWsLeave, stopPoll, teardownMedia]);

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const payload: RoomChatPayload = {
        kind: 'chat',
        id: crypto.randomUUID(),
        text: trimmed,
        at: Date.now(),
      };
      sendRoomPayload(payload);
      setChatMessages((prev) => [
        ...prev,
        { id: payload.id, from: 'me', text: trimmed, at: payload.at },
      ]);
    },
    [sendRoomPayload],
  );

  const toggleMic = useCallback(() => {
    setMicOn((on) => {
      const next = !on;
      localStream?.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
      return next;
    });
  }, [localStream]);

  const toggleCam = useCallback(() => {
    setCamOn((on) => {
      const next = !on;
      localStream?.getVideoTracks().forEach((t) => {
        t.enabled = next;
      });
      return next;
    });
  }, [localStream]);

  const resetToIdle = useCallback(() => {
    resetSessionRefs();
    setPhase('idle');
    setError(null);
    setPeerLeftNotice(null);
  }, [resetSessionRefs]);

  useEffect(() => {
    return () => {
      stopPoll();
      intentionalLeaveRef.current = true;
      teardownMedia();
      void webrtcLeave();
    };
  }, [stopPoll, teardownMedia]);

  return {
    phase,
    roomId,
    peerId,
    localStream,
    remoteStream,
    micOn,
    camOn,
    error,
    peerLeftNotice,
    chatMessages,
    sttEntries,
    startMatching,
    cancelMatching,
    endCall,
    toggleMic,
    toggleCam,
    resetToIdle,
    sendChat,
    sttLiveLine,
    sttListening,
  };
}
