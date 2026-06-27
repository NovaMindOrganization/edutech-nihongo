import axios from 'axios';

import { env } from '../config/env.js';
import { db } from '../config/db.js';
import { incrRateLimit } from '../config/redis.js';
import { getConfigValue } from './config.service.js';
import { getLlmRuntimePayload } from './llm-config.service.js';
import { AppError } from '../utils/app-error.js';

type AiLlmResponse = {
  AI_Reply?: string;
  Correction?: string | null;
  error?: string | null;
  summary?: string;
  [key: string]: unknown;
};

async function aiPost(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = 60_000,
): Promise<AiLlmResponse> {
  const llm_config = await getLlmRuntimePayload();
  const { data } = await axios.post<AiLlmResponse>(
    `${env.aiServerUrl}${path}`,
    { ...body, llm_config },
    { timeout: timeoutMs },
  );
  return data;
}

const FALLBACK_REPLY = {
  AI_Reply: 'もう一度、ゆっくり話してください。',
  Correction: null,
};

async function checkSpeakingLimit(userId: string) {
  const limit = Number(await getConfigValue('ai_speaking_daily_limit', '50'));
  const dateKey = new Date().toISOString().slice(0, 10);
  const ok = await incrRateLimit(`nihongocoach:ai_limit:${userId}:${dateKey}`, limit, 86400);
  return ok;
}

export async function startSpeakingSession(userId: string) {
  const ok = await checkSpeakingLimit(userId);
  if (!ok) {
    return { ...FALLBACK_REPLY, rateLimited: true, sessionId: crypto.randomUUID() };
  }

  const sessionId = crypto.randomUUID();
  let parsed = FALLBACK_REPLY;

  try {
    const data = await aiPost('/api/v1/speaking/start', {});
    if (data?.AI_Reply) {
      parsed = { AI_Reply: data.AI_Reply, Correction: data.Correction ?? null };
    }
  } catch {
    parsed = {
      AI_Reply: 'こんにちは！今日は何について話しましょうか？',
      Correction: null,
    };
  }

  await persistSpeakingTurn(userId, sessionId, '[SESSION_START]', parsed, 'ai_speaking_free');
  return { ...parsed, sessionId };
}

export async function sendSpeakingMessage(
  userId: string,
  input: { text: string; sessionId?: string; conversationHistory?: Array<{ role: string; content: string }> },
) {
  const ok = await checkSpeakingLimit(userId);
  if (!ok) {
    return { ...FALLBACK_REPLY, rateLimited: true };
  }

  const sessionId = input.sessionId ?? crypto.randomUUID();
  let parsed = FALLBACK_REPLY;

  try {
    const data = await aiPost('/api/v1/speaking/message', {
      text: input.text,
      conversation_history: input.conversationHistory ?? [],
      mode: 'free',
    });
    if (data?.AI_Reply) {
      parsed = { AI_Reply: data.AI_Reply, Correction: data.Correction ?? null };
    }
  } catch {
    parsed = FALLBACK_REPLY;
  }

  await persistSpeakingTurn(userId, sessionId, input.text, parsed, 'ai_speaking_free');
  return { ...parsed, sessionId, transcript: input.text };
}

export async function sendLessonSpeakingMessage(
  userId: string,
  lessonId: string,
  input: {
    text: string;
    sessionId?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  },
) {
  const ok = await checkSpeakingLimit(userId);
  if (!ok) {
    return { ...FALLBACK_REPLY, rateLimited: true };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: { select: { jlptLevel: true, title: true } },
      grammar: { take: 5, include: { grammar: true } },
    },
  });
  if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');

  const lessonVocab = await db.vocabulary.findMany({
    where: { lessonId },
    orderBy: { word: 'asc' },
    take: 8,
  });

  const sessionId = input.sessionId ?? crypto.randomUUID();
  let parsed = FALLBACK_REPLY;

  const lessonContext = {
    lesson_title: lesson.title,
    jlpt_level: lesson.course.jlptLevel,
    speaking_prompt: lesson.speakingPrompt,
    vocabulary: lessonVocab.map((v) => v.word),
    grammar: lesson.grammar.map((g) => g.grammar.pattern),
  };

  try {
    const data = await aiPost('/api/v1/speaking/lesson', {
      text: input.text,
      conversation_history: input.conversationHistory ?? [],
      lesson_context: lessonContext,
    });
    if (data?.AI_Reply) {
      parsed = { AI_Reply: data.AI_Reply, Correction: data.Correction ?? null };
    }
  } catch {
    parsed = FALLBACK_REPLY;
  }

  await persistSpeakingTurn(userId, sessionId, input.text, parsed, 'ai_speaking_lesson', lessonId);
  return { ...parsed, sessionId, transcript: input.text, lessonId };
}

async function persistSpeakingTurn(
  userId: string,
  sessionId: string,
  userText: string,
  parsed: { AI_Reply: string; Correction: string | null },
  source: string,
  lessonId?: string,
) {
  await db.conversationHistory.createMany({
    data: [
      { userId, sessionId, role: 'user', content: userText },
      { userId, sessionId, role: 'assistant', content: parsed.AI_Reply },
    ],
  });

  if (parsed.Correction) {
    await db.userErrorLog.create({
      data: {
        userId,
        source,
        originalText: userText,
        correction: parsed.Correction,
        lessonId,
      },
    });
  }
}

export async function synthesizeSpeech(text: string, voice?: string) {
  try {
    const { data } = await axios.post(
      `${env.aiServerUrl}/api/v1/speech/tts`,
      { text, voice },
      { timeout: 30_000 },
    );
    if (data?.audio_base64) {
      return Buffer.from(data.audio_base64, 'base64');
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSttConfig() {
  try {
    const { data } = await axios.get(`${env.aiServerUrl}/api/v1/speech/stt/config`);
    return data;
  } catch {
    return null;
  }
}

export async function transcribeSpeech(
  audioBase64: string,
  language = 'ja',
  mimeType = 'audio/webm',
  allowGeminiFallback = true,
) {
  try {
    const { data } = await axios.post(`${env.aiServerUrl}/api/v1/speech/stt`, {
      audio: audioBase64,
      language,
      mime_type: mimeType,
      allow_gemini_fallback: allowGeminiFallback,
    });
    return data as { text: string; confidence?: number; engine?: string };
  } catch {
    return { text: '', confidence: 0, engine: 'none' };
  }
}

type PronunciationAssessmentRaw = {
  overall_score?: number;
  passed?: boolean;
  feedback_vi?: string;
  transcript?: string | null;
  engine?: string;
  duration_ms?: number | null;
  raw_scores?: Record<string, number | null>;
  words?: Array<{ word: string; accuracy_score?: number | null; error_type?: string | null }>;
};

export type PronunciationAssessmentDto = {
  overallScore: number;
  passed: boolean;
  feedbackVi: string;
  transcript: string | null;
  engine: string;
  durationMs: number | null;
  rawScores: Record<string, number | null>;
  words: Array<{ word: string; accuracyScore: number | null; errorType: string | null }>;
  error?: string | null;
};

function mapPronunciationAssessment(data: PronunciationAssessmentRaw): PronunciationAssessmentDto {
  return {
    overallScore: Number(data.overall_score ?? 0),
    passed: Boolean(data.passed),
    feedbackVi: data.feedback_vi ?? '',
    transcript: data.transcript ?? null,
    engine: data.engine ?? 'none',
    durationMs: data.duration_ms ?? null,
    rawScores: data.raw_scores ?? {},
    words: (data.words ?? []).map((word) => ({
      word: word.word,
      accuracyScore: word.accuracy_score ?? null,
      errorType: word.error_type ?? null,
    })),
    error: null,
  };
}

function pronunciationErrorMessage(err: unknown) {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : 'Pronunciation assessment failed';
  }

  const body = err.response?.data as
    | {
        detail?: { message?: string } | string;
        error?: { message?: string };
        message?: string;
      }
    | undefined;
  if (typeof body?.detail === 'object' && body.detail?.message) return body.detail.message;
  if (typeof body?.detail === 'string') return body.detail;
  return body?.error?.message ?? body?.message ?? err.message;
}

export async function assessPronunciation(input: {
  referenceText: string;
  audioBase64: string;
  language?: string;
  mimeType?: string;
  passThreshold?: number;
}): Promise<PronunciationAssessmentDto> {
  try {
    const { data } = await axios.post<PronunciationAssessmentRaw>(
      `${env.aiServerUrl}/api/v1/speech/pronunciation/assess`,
      {
        reference_text: input.referenceText,
        audio_base64: input.audioBase64,
        language: input.language ?? 'ja',
        mime_type: input.mimeType ?? 'audio/webm',
        pass_threshold: input.passThreshold ?? 70,
      },
      { timeout: 90_000 },
    );
    return mapPronunciationAssessment(data);
  } catch (err) {
    const message = pronunciationErrorMessage(err);
    return {
      overallScore: 0,
      passed: false,
      feedbackVi: message,
      transcript: null,
      engine: 'none',
      durationMs: null,
      rawScores: {},
      words: [],
      error: message,
    };
  }
}

export async function translateCommunityText(text: string, targetLang = 'vi') {
  const trimmed = text.trim();
  if (!trimmed) return { translation: '', error: 'Empty text' };

  try {
    const data = await aiPost(
      '/api/v1/speaking/message',
      {
        text: trimmed,
        conversation_history: [],
        mode: 'translate',
        target_lang: targetLang,
      },
      90_000,
    );
    const translation = (data?.AI_Reply as string | undefined)?.trim() ?? '';
    const llmError = (data?.error as string | undefined)?.trim() || null;
    return { translation, error: llmError };
  } catch (err) {
    const message =
      axios.isAxiosError(err) && err.code === 'ECONNREFUSED'
        ? 'AI server không chạy (localhost:8000)'
        : axios.isAxiosError(err)
          ? (err.response?.data as { error?: { message?: string } })?.error?.message ??
            err.message
          : err instanceof Error
            ? err.message
            : 'Translate request failed';
    return { translation: '', error: message };
  }
}

export async function evaluateCallSpeaking(
  userId: string,
  input: { roomId?: string; transcripts: Array<{ speaker: string; text: string }> },
) {
  try {
    const data = await aiPost(
      '/api/v1/community/evaluate',
      { transcripts: input.transcripts },
      90_000,
    );
    await db.userErrorLog.create({
      data: {
        userId,
        source: 'webrtc_eval',
        originalText: JSON.stringify(input.transcripts),
        correction: data?.summary ?? null,
      },
    });
    return data;
  } catch {
    return {
      summary: 'Không phân tích được — thử lại sau.',
      feedback_per_speaker: [],
    };
  }
}

export async function analyzeOcr(imageBase64: string) {
  try {
    const data = await aiPost('/api/v1/ocr/analyze', { image: imageBase64 }, 120_000);
    if (data && Array.isArray(data.matched_grammar)) {
      return {
        ...data,
        matched_grammar: data.matched_grammar.map((g: { meaningVi?: string; meaning?: string }) => ({
          ...g,
          meaningVi: g.meaningVi ?? g.meaning ?? '',
        })),
      };
    }
    return data;
  } catch {
    return {
      extracted_text: '',
      matched_vocabulary: [],
      matched_grammar: [],
      grammar_explanation: null,
      meta: null,
    };
  }
}

export type StudySetQuizQuestionDto = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string | null;
};

export async function generateStudySetQuizViaAi(input: {
  title: string;
  description?: string | null;
  questionCount: number;
  items: Array<{ contentType: string; content: Record<string, unknown> }>;
}) {
  try {
    const data = await aiPost(
      '/api/v1/study-set/quiz/generate',
      {
        title: input.title,
        description: input.description ?? '',
        question_count: input.questionCount,
        items: input.items.map((it) => ({
          content_type: it.contentType,
          content: it.content,
        })),
      },
      120_000,
    );
    return data as {
      questions?: StudySetQuizQuestionDto[];
      error?: string | null;
    };
  } catch (err) {
    const message =
      axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error?.message ??
          err.message
        : err instanceof Error
          ? err.message
          : 'Quiz generation failed';
    return { questions: [], error: message };
  }
}

export type OcrQuizQuestionDto = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string | null;
};

export async function generateOcrQuiz(imageBase64: string, questionCount: number) {
  try {
    const data = await aiPost(
      '/api/v1/ocr/quiz/generate',
      { image: imageBase64, question_count: questionCount },
      120_000,
    );
    return data as {
      extracted_text: string;
      questions?: OcrQuizQuestionDto[];
      error?: string | null;
      meta?: unknown;
    };
  } catch (err) {
    const message =
      axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error?.message ??
          err.message
        : err instanceof Error
          ? err.message
          : 'OCR quiz generation failed';
    return { extracted_text: '', questions: [], error: message, meta: null };
  }
}

export type OcrGradingErrorDto = {
  location: string;
  student_answer: string;
  correct_answer: string;
  explanation: string;
};

export async function gradeOcrHomework(imageBase64: string, context?: string) {
  try {
    const data = await aiPost(
      '/api/v1/ocr/grade',
      { image: imageBase64, context: context?.trim() || undefined },
      120_000,
    );
    return data as {
      extracted_text: string;
      errors?: OcrGradingErrorDto[];
      overall_feedback?: string;
      score_estimate?: string | null;
      error?: string | null;
      meta?: unknown;
    };
  } catch (err) {
    const message =
      axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error?.message ??
          err.message
        : err instanceof Error
          ? err.message
          : 'OCR grading failed';
    return {
      extracted_text: '',
      errors: [],
      overall_feedback: '',
      score_estimate: null,
      error: message,
      meta: null,
    };
  }
}

export async function getOcrStatus() {
  try {
    const { data } = await axios.get(`${env.aiServerUrl}/api/v1/ocr/status`, { timeout: 10_000 });
    return data;
  } catch {
    return {
      default_engine: 'paddleocr',
      use_gpu: false,
      paddle: { installed: false },
    };
  }
}
