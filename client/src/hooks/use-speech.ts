import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getSpeechSttConfig,
  postSpeechStt,
  postSpeechTts,
  type SttConfig,
} from '@/features/student/services/speechApi';

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speakBrowser(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
  if (jaVoice) utterance.voice = jaVoice;
  window.speechSynthesis.speak(utterance);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'audio/webm';
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [sttConfig, setSttConfig] = useState<SttConfig | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef('audio/webm');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const liveFinalRef = useRef('');

  useEffect(() => {
    getSpeechSttConfig()
      .then(setSttConfig)
      .catch(() => undefined);
  }, []);

  const playTts = useCallback(async (text: string) => {
    setSpeaking(true);
    try {
      const res = await postSpeechTts(text);
      if (res.audioBase64) {
        const audio = new Audio(`data:${res.contentType};base64,${res.audioBase64}`);
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error('TTS playback failed'));
          audio.play().catch(reject);
        });
        return;
      }
      speakBrowser(text);
    } catch {
      speakBrowser(text);
    } finally {
      setSpeaking(false);
    }
  }, []);

  const stopLiveRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        rec.abort();
      }
      recognitionRef.current = null;
    }
  }, []);

  const startLiveRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    liveFinalRef.current = '';
    setLiveTranscript('');

    const rec = new Ctor();
    rec.lang = sttConfig?.defaultLanguage === 'ja' ? 'ja-JP' : 'ja-JP';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let interim = '';
      let finalText = liveFinalRef.current;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += piece;
        } else {
          interim += piece;
        }
      }
      liveFinalRef.current = finalText;
      setLiveTranscript((finalText + interim).trim());
    };

    rec.onerror = () => undefined;
    rec.onend = () => {
      if (recognitionRef.current === rec) {
        recognitionRef.current = null;
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch {
      recognitionRef.current = null;
    }
  }, [sttConfig?.defaultLanguage]);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    mimeRef.current = pickMimeType();

    const recorder = new MediaRecorder(stream, { mimeType: mimeRef.current });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start(250);
    mediaRef.current = recorder;
    setRecording(true);
    startLiveRecognition();
  }, [startLiveRecognition]);

  const stopRecording = useCallback(async (): Promise<{
    text: string;
    engine?: string;
    liveText: string;
  }> => {
    const recorder = mediaRef.current;
    const liveText = liveTranscript || liveFinalRef.current;
    stopLiveRecognition();

    if (!recorder || recorder.state === 'inactive') {
      setRecording(false);
      return { text: liveText.trim(), liveText: liveText.trim(), engine: 'browser' };
    }

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        setRecording(false);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRef.current = null;

        const mime = mimeRef.current.split(';')[0] ?? 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });

        if (blob.size < (sttConfig?.minAudioBytes ?? 500)) {
          resolve({
            text: liveText.trim(),
            liveText: liveText.trim(),
            engine: 'browser',
          });
          return;
        }

        const b64 = await blobToBase64(blob);
        try {
          const { text, engine } = await postSpeechStt(
            b64,
            sttConfig?.defaultLanguage ?? 'ja',
            mime,
          );
          const merged = (text?.trim() || liveText).trim();
          setLiveTranscript(merged);
          resolve({ text: merged, engine: engine ?? 'server', liveText: liveText.trim() });
        } catch {
          resolve({
            text: liveText.trim(),
            liveText: liveText.trim(),
            engine: 'browser',
          });
        }
      };

      if (recorder.state === 'recording') {
        recorder.requestData();
      }
      recorder.stop();
    });
  }, [liveTranscript, sttConfig, stopLiveRecognition]);

  const resetLiveTranscript = useCallback(() => {
    liveFinalRef.current = '';
    setLiveTranscript('');
  }, []);

  return {
    playTts,
    speaking,
    recording,
    liveTranscript,
    sttConfig,
    startRecording,
    stopRecording,
    resetLiveTranscript,
    hasBrowserStt: Boolean(getSpeechRecognitionCtor()),
  };
}
