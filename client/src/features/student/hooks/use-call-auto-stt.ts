import { useCallback, useEffect, useRef, useState } from 'react';

import { postSpeechStt } from '@/features/student/services/speechApi';

const LOCAL_CHUNK_MS = 5000;
const MIN_CHUNK_BYTES = 1200;
const DEDUPE_WINDOW_MS = 1500;

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
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

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'audio/webm';
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

type UseCallAutoSttOptions = {
  active: boolean;
  micEnabled: boolean;
  localStream: MediaStream | null;
  onMyUtterance: (text: string) => void;
};

export function useCallAutoStt({
  active,
  micEnabled,
  localStream,
  onMyUtterance,
}: UseCallAutoSttOptions) {
  const [liveLine, setLiveLine] = useState('');
  const [listening, setListening] = useState(false);

  const activeRef = useRef(active);
  const micRef = useRef(micEnabled);
  const lastEmittedRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const chunkRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkBusyRef = useRef(false);
  const hasBrowserSttRef = useRef(Boolean(getSpeechRecognitionCtor()));

  activeRef.current = active;
  micRef.current = micEnabled;

  const emitMine = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length < 2) return;
      if (lastEmittedRef.current === trimmed) return;
      lastEmittedRef.current = trimmed;
      window.setTimeout(() => {
        if (lastEmittedRef.current === trimmed) {
          lastEmittedRef.current = null;
        }
      }, DEDUPE_WINDOW_MS);
      onMyUtterance(trimmed);
      setLiveLine('');
    },
    [onMyUtterance],
  );

  const stopBrowserRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      rec.abort();
    }
    recognitionRef.current = null;
  }, []);

  const startBrowserRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || !activeRef.current || !micRef.current) return;

    const rec = new Ctor();
    rec.lang = 'ja-JP';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let finalBuffer = '';

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalBuffer += piece;
        } else {
          interim += piece;
        }
      }
      setLiveLine((finalBuffer + interim).trim());
      if (finalBuffer.trim()) {
        emitMine(finalBuffer.trim());
        finalBuffer = '';
      }
    };

    rec.onerror = () => undefined;
    rec.onend = () => {
      if (recognitionRef.current !== rec) return;
      recognitionRef.current = null;
      if (activeRef.current && micRef.current && hasBrowserSttRef.current) {
        window.setTimeout(() => startBrowserRecognition(), 350);
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
    } catch {
      recognitionRef.current = null;
      hasBrowserSttRef.current = false;
      setListening(false);
    }
  }, [emitMine]);

  const stopChunkRecorder = useCallback(() => {
    const recorder = chunkRecorderRef.current;
    chunkRecorderRef.current = null;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const startChunkRecorder = useCallback(
    (stream: MediaStream) => {
      const tracks = stream.getAudioTracks().filter((t) => t.enabled);
      if (!tracks.length || typeof MediaRecorder === 'undefined') return;

      stopChunkRecorder();
      const audioOnly = new MediaStream(tracks);
      const mime = pickMimeType();
      const recorder = new MediaRecorder(audioOnly, { mimeType: mime });

      recorder.ondataavailable = (event) => {
        if (
          !activeRef.current ||
          !micRef.current ||
          event.data.size < MIN_CHUNK_BYTES ||
          chunkBusyRef.current
        ) {
          return;
        }
        chunkBusyRef.current = true;
        void (async () => {
          try {
            const b64 = await blobToBase64(event.data);
            const mimeType = mime.split(';')[0] ?? 'audio/webm';
            const res = await postSpeechStt(b64, 'ja', mimeType, false);
            if (res.text?.trim()) {
              setLiveLine(res.text.trim());
              emitMine(res.text);
            }
          } catch {
            /* skip */
          } finally {
            chunkBusyRef.current = false;
          }
        })();
      };

      try {
        recorder.start(LOCAL_CHUNK_MS);
        chunkRecorderRef.current = recorder;
        setListening(true);
      } catch {
        chunkRecorderRef.current = null;
      }
    },
    [emitMine, stopChunkRecorder],
  );

  useEffect(() => {
    if (!active || !micEnabled) {
      stopBrowserRecognition();
      stopChunkRecorder();
      setListening(false);
      setLiveLine('');
      return;
    }

    if (hasBrowserSttRef.current) {
      stopChunkRecorder();
      startBrowserRecognition();
    } else if (localStream) {
      stopBrowserRecognition();
      startChunkRecorder(localStream);
    }

    return () => {
      stopBrowserRecognition();
      stopChunkRecorder();
    };
  }, [
    active,
    localStream,
    micEnabled,
    startBrowserRecognition,
    startChunkRecorder,
    stopBrowserRecognition,
    stopChunkRecorder,
  ]);

  return { liveLine, listening: listening && active && micEnabled };
}
