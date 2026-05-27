import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useSpeech } from '@/hooks/use-speech';
import { postAiSpeaking, postAiSpeakingStart } from '@/features/student/services/studentApi';

export type SpeakingMessage = {
  role: 'user' | 'assistant';
  text: string;
  correction?: string | null;
};

export type SessionPhase = 'idle' | 'active' | 'listening' | 'thinking' | 'speaking';

export function useAiSpeakingSession() {
  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [messages, setMessages] = useState<SpeakingMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const busyRef = useRef(false);

  const {
    playTts,
    speaking,
    recording,
    liveTranscript,
    sttConfig,
    startRecording,
    stopRecording,
    resetLiveTranscript,
    hasBrowserStt,
  } = useSpeech();

  const appendAssistant = useCallback(
    async (reply: string, correction: string | null | undefined) => {
      setMessages((m) => [...m, { role: 'assistant', text: reply, correction }]);
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
      if (correction) toast.info(`Gợi ý: ${correction}`);
      setPhase('speaking');
      await playTts(reply);
      setPhase('active');
    },
    [playTts],
  );

  const deliverUserMessage = useCallback(
    async (trimmed: string) => {
      setMessages((m) => [...m, { role: 'user', text: trimmed }]);
      setPhase('thinking');

      const res = await postAiSpeaking({
        text: trimmed,
        sessionId,
        conversationHistory: history,
      });
      setSessionId(res.sessionId);
      setHistory((h) => [
        ...h,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: res.AI_Reply },
      ]);
      await appendAssistant(res.AI_Reply, res.Correction);
    },
    [appendAssistant, history, sessionId],
  );

  const startSession = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhase('thinking');
    try {
      const res = await postAiSpeakingStart();
      setSessionId(res.sessionId);
      setMessages([{ role: 'assistant', text: res.AI_Reply, correction: res.Correction }]);
      setHistory([{ role: 'assistant', content: res.AI_Reply }]);
      setPhase('speaking');
      await playTts(res.AI_Reply);
      setPhase('active');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không khởi tạo được hội thoại');
      setPhase('idle');
    } finally {
      busyRef.current = false;
    }
  }, [playTts]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || phase === 'idle' || busyRef.current) return;

      busyRef.current = true;
      try {
        await deliverUserMessage(trimmed);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'AI không phản hồi');
        setPhase('active');
      } finally {
        busyRef.current = false;
      }
    },
    [deliverUserMessage, phase],
  );

  const startListening = useCallback(async () => {
    if (phase !== 'active' || busyRef.current) return;
    try {
      resetLiveTranscript();
      await startRecording();
      setPhase('listening');
    } catch {
      toast.error('Cần quyền microphone');
    }
  }, [phase, resetLiveTranscript, startRecording]);

  const stopListening = useCallback(async () => {
    if (phase !== 'listening' || busyRef.current) return;

    busyRef.current = true;
    setPhase('thinking');

    try {
      const { text, engine } = await stopRecording();
      if (!text) {
        toast.error('Không nhận dạng được giọng nói — thử nói rõ hơn');
        setPhase('active');
        return;
      }

      if (engine && engine !== 'browser') {
        toast.message(`STT: ${engine}`, { duration: 1500 });
      }

      await deliverUserMessage(text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi xử lý giọng nói');
      setPhase('active');
    } finally {
      busyRef.current = false;
      resetLiveTranscript();
    }
  }, [deliverUserMessage, phase, resetLiveTranscript, stopRecording]);

  const toggleListening = useCallback(async () => {
    if (recording) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [recording, startListening, stopListening]);

  const replayLastAssistant = useCallback(async () => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!last || busyRef.current) return;
    setPhase('speaking');
    await playTts(last.text);
    setPhase('active');
  }, [messages, playTts]);

  return {
    phase,
    messages,
    sessionId,
    liveTranscript,
    sttConfig,
    hasBrowserStt,
    speaking,
    recording,
    startSession,
    sendText,
    toggleListening,
    replayLastAssistant,
    isBusy: phase === 'thinking' || phase === 'speaking' || busyRef.current,
  };
}
