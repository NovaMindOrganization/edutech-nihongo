import { apiFetch } from '@/services/httpClient';

export type SttConfig = {
  defaultLanguage: string;
  whisperModel: string;
  whisperDevice: string;
  geminiFallback: boolean;
  vadFilter: boolean;
  beamSize: number;
  sampleRate: number;
  minAudioBytes: number;
  maxDurationSec: number;
  liveSttHint: string;
};

export type SttResult = {
  text: string;
  confidence?: number;
  engine?: string;
  interimSupported?: boolean;
};

type SttConfigRaw = SttConfig & {
  default_language?: string;
  whisper_model?: string;
  whisper_device?: string;
  gemini_fallback?: boolean;
  vad_filter?: boolean;
  beam_size?: number;
  sample_rate?: number;
  min_audio_bytes?: number;
  max_duration_sec?: number;
  live_stt_hint?: string;
};

export async function getSpeechSttConfig(): Promise<SttConfig> {
  const raw = await apiFetch<SttConfigRaw>('/student/speech/stt/config');
  return {
    defaultLanguage: raw.defaultLanguage ?? raw.default_language ?? 'ja',
    whisperModel: raw.whisperModel ?? raw.whisper_model ?? 'base',
    whisperDevice: raw.whisperDevice ?? raw.whisper_device ?? 'cpu',
    geminiFallback: raw.geminiFallback ?? raw.gemini_fallback ?? true,
    vadFilter: raw.vadFilter ?? raw.vad_filter ?? true,
    beamSize: raw.beamSize ?? raw.beam_size ?? 5,
    sampleRate: raw.sampleRate ?? raw.sample_rate ?? 16000,
    minAudioBytes: raw.minAudioBytes ?? raw.min_audio_bytes ?? 500,
    maxDurationSec: raw.maxDurationSec ?? raw.max_duration_sec ?? 120,
    liveSttHint: raw.liveSttHint ?? raw.live_stt_hint ?? '',
  };
}

export function postSpeechTts(text: string, voice?: string) {
  return apiFetch<{ audioBase64: string; contentType: string; fallback?: boolean }>(
    '/student/speech/tts',
    {
      method: 'POST',
      body: JSON.stringify({ text, voice }),
    },
  );
}

export function postSpeechStt(
  audio: string,
  language?: string,
  mimeType = 'audio/webm',
  allowGeminiFallback = true,
) {
  return apiFetch<SttResult>('/student/speech/stt', {
    method: 'POST',
    body: JSON.stringify({ audio, language, mimeType, allowGeminiFallback }),
  });
}
