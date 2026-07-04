import type { Prisma } from '@prisma/client';

export type SpeakingStep = {
  id: number;
  taskVi: string;
  guideVi: string;
  modelJa: string;
  aiReply: string;
  acceptPattern: string;
  praiseVi?: string;
  hintVi?: string;
};

export type ScriptedSpeakingReply = {
  AI_Reply: string;
  Correction: string | null;
  Guide_Vi: string;
  Model_Answer: string;
  stepIndex: number;
  stepTotal: number;
  stepTasks: string[];
  sessionMode: 'scripted';
  completed: boolean;
};

function normalizeJa(text: string): string {
  return text.replace(/[\s。、．，！!？?「」『』]/g, '').trim();
}

function matchesStepInput(text: string, step: SpeakingStep): boolean {
  const norm = normalizeJa(text);
  if (!norm) return false;
  try {
    return new RegExp(step.acceptPattern, 'i').test(norm);
  } catch {
    return norm.includes(step.acceptPattern);
  }
}

export function parseSpeakingSteps(raw: Prisma.JsonValue | null | undefined): SpeakingStep[] {
  if (!raw || !Array.isArray(raw)) return [];
  const steps: SpeakingStep[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const id = Number(row.id);
    const taskVi = String(row.taskVi ?? '').trim();
    const guideVi = String(row.guideVi ?? '').trim();
    const modelJa = String(row.modelJa ?? '').trim();
    const aiReply = String(row.aiReply ?? modelJa).trim();
    const acceptPattern = String(row.acceptPattern ?? '').trim();
    if (!Number.isFinite(id) || !taskVi || !guideVi || !modelJa || !acceptPattern) continue;
    steps.push({
      id,
      taskVi,
      guideVi,
      modelJa,
      aiReply,
      acceptPattern,
      praiseVi: row.praiseVi ? String(row.praiseVi) : undefined,
      hintVi: row.hintVi ? String(row.hintVi) : undefined,
    });
  }
  return steps.sort((a, b) => a.id - b.id);
}

function buildStepPayload(
  steps: SpeakingStep[],
  stepIndex: number,
  overrides?: Partial<Pick<ScriptedSpeakingReply, 'AI_Reply' | 'Correction' | 'Guide_Vi' | 'completed'>>,
): ScriptedSpeakingReply {
  const step = steps[stepIndex];
  const stepTotal = steps.length;
  return {
    AI_Reply: overrides?.AI_Reply ?? step.aiReply,
    Correction: overrides?.Correction ?? null,
    Guide_Vi: overrides?.Guide_Vi ?? step.guideVi,
    Model_Answer: step.modelJa,
    stepIndex,
    stepTotal,
    stepTasks: steps.map((s) => s.taskVi),
    sessionMode: 'scripted',
    completed: overrides?.completed ?? false,
  };
}

export function startScriptedSpeakingSession(
  steps: SpeakingStep[],
  topicVi = 'bài học hôm nay',
): ScriptedSpeakingReply | null {
  if (steps.length === 0) return null;
  const first = steps[0];
  return buildStepPayload(steps, 0, {
    Guide_Vi: `Chào bạn! Hôm nay luyện nói: ${topicVi} (${steps.length} bước).\n${first.guideVi}`,
    AI_Reply: first.aiReply,
  });
}

export function processScriptedSpeakingTurn(
  steps: SpeakingStep[],
  userText: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
): ScriptedSpeakingReply | null {
  if (steps.length === 0) return null;

  const userTurns = conversationHistory.filter((h) => h.role === 'user').length;
  const stepIndex = Math.min(userTurns, steps.length - 1);
  const current = steps[stepIndex];

  if (userTurns >= steps.length) {
    return {
      AI_Reply: 'おつかれさまでした！',
      Correction: null,
      Guide_Vi: 'Bạn đã hoàn thành tất cả các bước luyện nói. Hãy thử lặp lại cả đoạn một lần nữa nhé!',
      Model_Answer: steps[steps.length - 1].modelJa,
      stepIndex: steps.length - 1,
      stepTotal: steps.length,
      stepTasks: steps.map((s) => s.taskVi),
      sessionMode: 'scripted',
      completed: true,
    };
  }

  const trimmed = userText.trim();
  if (!trimmed || trimmed === '[SESSION_START]') {
    return buildStepPayload(steps, stepIndex);
  }

  if (!matchesStepInput(trimmed, current)) {
    const hint = current.hintVi ?? `Hãy nói giống câu mẫu: ${current.modelJa}`;
    return buildStepPayload(steps, stepIndex, {
      Correction: hint,
      Guide_Vi: `${current.guideVi}\n\n💡 ${hint}`,
    });
  }

  const praise = current.praiseVi ?? 'Tốt lắm!';
  const nextIndex = stepIndex + 1;

  if (nextIndex >= steps.length) {
    return {
      AI_Reply: 'おつかれさまでした！',
      Correction: null,
      Guide_Vi: `${praise} Bạn đã hoàn thành luyện nói! Hãy thử nói cả đoạn một lần nữa.`,
      Model_Answer: steps[steps.length - 1].modelJa,
      stepIndex: steps.length - 1,
      stepTotal: steps.length,
      stepTasks: steps.map((s) => s.taskVi),
      sessionMode: 'scripted',
      completed: true,
    };
  }

  const next = steps[nextIndex];
  return buildStepPayload(steps, nextIndex, {
    AI_Reply: next.aiReply,
    Guide_Vi: `${praise}\n\n${next.guideVi}`,
  });
}
