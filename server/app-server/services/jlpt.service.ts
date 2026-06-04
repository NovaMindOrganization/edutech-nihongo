import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

const SNAPSHOT_KIND = 'snapshot' as const;
const DEFAULT_MAX_ATTEMPTS = 3;

export type ExamQuestionPayload = {
  id: string;
  questionText: string;
  questionType: string;
  options: unknown;
  section: string | null;
  audioUrl: string | null;
};

type ExamSessionSnapshot = {
  kind: typeof SNAPSHOT_KIND;
  questions: ExamQuestionPayload[];
};

function isSnapshot(raw: unknown): raw is ExamSessionSnapshot {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    (raw as ExamSessionSnapshot).kind === SNAPSHOT_KIND &&
    Array.isArray((raw as ExamSessionSnapshot).questions)
  );
}

async function loadMockExam(mockExamId: string | undefined, level: string) {
  let mockExam = mockExamId
    ? await db.mockExam.findUnique({ where: { id: mockExamId } })
    : await db.mockExam.findFirst({ where: { jlptLevel: level } });

  if (!mockExam) {
    mockExam = await db.mockExam.create({
      data: {
        title: `JLPT ${level} Mock`,
        jlptLevel: level,
        durationMinutes: level === 'N5' ? 90 : 120,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
      },
    });
  }

  return mockExam;
}

async function loadExamQuestions(mockExamId: string, level: string): Promise<ExamQuestionPayload[]> {
  const links = await db.mockExamQuestion.findMany({
    where: { mockExamId },
    include: { question: true },
  });

  let questions = links.map((l) => ({
    id: l.question.id,
    questionText: l.question.questionText,
    questionType: l.question.questionType,
    options: l.question.options,
    section: l.section,
    audioUrl: l.question.audioUrl,
  }));

  if (questions.length === 0) {
    const pool = await db.question.findMany({ where: { jlptLevel: level }, take: 30 });
    questions = pool.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      section: q.questionCategory,
      audioUrl: q.audioUrl,
    }));
  }

  return questions.sort(() => Math.random() - 0.5);
}

async function countSubmittedAttempts(userId: string, mockExamId: string) {
  return db.examSession.count({
    where: {
      userId,
      mockExamId,
      submittedAt: { not: null },
    },
  });
}

async function attemptMetaForUser(
  userId: string,
  mockExam: { id: string; maxAttempts: number },
) {
  const myAttemptCount = await countSubmittedAttempts(userId, mockExam.id);
  return {
    maxAttempts: mockExam.maxAttempts,
    myAttemptCount,
    attemptsRemaining: Math.max(0, mockExam.maxAttempts - myAttemptCount),
  };
}

async function buildStartPayload(
  userId: string,
  session: { id: string; expiresAt: Date; startedAt: Date },
  mockExam: {
    id: string;
    title: string;
    jlptLevel: string;
    durationMinutes: number;
    maxAttempts: number;
  },
  questions: ExamQuestionPayload[],
  resumed: boolean,
) {
  const now = Date.now();
  const remainingMs = Math.max(0, session.expiresAt.getTime() - now);
  const attempts = await attemptMetaForUser(userId, mockExam);

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt.toISOString(),
    startedAt: session.startedAt.toISOString(),
    durationMinutes: mockExam.durationMinutes,
    remainingMs,
    mockExamId: mockExam.id,
    examTitle: mockExam.title,
    jlptLevel: mockExam.jlptLevel,
    questionCount: questions.length,
    questions,
    resumed,
    ...attempts,
  };
}

async function closeExpiredSession(sessionId: string) {
  await db.examSession.update({
    where: { id: sessionId },
    data: {
      submittedAt: new Date(),
      isAutoSubmitted: true,
      score: { total: 0, bySection: {}, reason: 'TIME_EXPIRED' },
    },
  });
}

export async function getActiveSession(userId: string, mockExamId: string) {
  const session = await db.examSession.findFirst({
    where: {
      userId,
      mockExamId,
      submittedAt: null,
    },
    orderBy: { startedAt: 'desc' },
    include: { mockExam: true },
  });

  if (!session?.mockExam) return null;

  const now = new Date();
  if (now > session.expiresAt) {
    await closeExpiredSession(session.id);
    return null;
  }

  if (!isSnapshot(session.answers)) return null;

  return buildStartPayload(
    userId,
    session,
    session.mockExam,
    session.answers.questions,
    true,
  );
}

export async function getSession(userId: string, sessionId: string) {
  const session = await db.examSession.findFirst({
    where: { id: sessionId, userId },
    include: { mockExam: true },
  });

  if (!session?.mockExam) throw new AppError('Session not found', 404, 'NOT_FOUND');
  if (session.submittedAt) {
    throw new AppError('Session already submitted', 400, 'ALREADY_SUBMITTED');
  }

  const now = new Date();
  if (now > session.expiresAt) {
    await closeExpiredSession(session.id);
    throw new AppError('Session expired', 400, 'SESSION_EXPIRED');
  }

  if (!isSnapshot(session.answers)) {
    throw new AppError('Invalid session state', 500, 'INVALID_SESSION');
  }

  return buildStartPayload(
    userId,
    session,
    session.mockExam,
    session.answers.questions,
    true,
  );
}

export async function startExam(userId: string, level: string, mockExamId?: string) {
  const mockExam = await loadMockExam(mockExamId, level);

  const active = await db.examSession.findFirst({
    where: {
      userId,
      mockExamId: mockExam.id,
      submittedAt: null,
    },
    orderBy: { startedAt: 'desc' },
  });

  const now = new Date();

  if (active) {
    if (now <= active.expiresAt && isSnapshot(active.answers)) {
      return buildStartPayload(userId, active, mockExam, active.answers.questions, true);
    }
    await closeExpiredSession(active.id);
  }

  const submittedCount = await countSubmittedAttempts(userId, mockExam.id);
  if (submittedCount >= mockExam.maxAttempts) {
    throw new AppError(
      `Đã dùng hết ${mockExam.maxAttempts} lượt thi cho đề này`,
      403,
      'ATTEMPT_LIMIT_REACHED',
    );
  }

  const questions = await loadExamQuestions(mockExam.id, mockExam.jlptLevel);
  if (questions.length === 0) {
    throw new AppError('Exam has no questions', 400, 'NO_QUESTIONS');
  }

  const expiresAt = new Date(now.getTime() + mockExam.durationMinutes * 60 * 1000);
  const snapshot: ExamSessionSnapshot = { kind: SNAPSHOT_KIND, questions };

  const session = await db.examSession.create({
    data: {
      userId,
      mockExamId: mockExam.id,
      level: mockExam.jlptLevel,
      expiresAt,
      answers: snapshot,
    },
  });

  return buildStartPayload(userId, session, mockExam, questions, false);
}

export async function submitExam(
  userId: string,
  sessionId: string,
  answers: Array<{ questionId: string; answer: string }>,
  autoSubmit = false,
) {
  const session = await db.examSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) throw new AppError('Session not found', 404, 'NOT_FOUND');
  if (session.submittedAt) throw new AppError('Already submitted', 400, 'ALREADY_SUBMITTED');

  const now = new Date();
  const expired = now > session.expiresAt;

  if (expired && !autoSubmit) {
    throw new AppError('Session expired', 400, 'SESSION_EXPIRED');
  }

  if (!isSnapshot(session.answers)) {
    throw new AppError('Invalid session state', 500, 'INVALID_SESSION');
  }

  const allowedIds = new Set(session.answers.questions.map((q) => q.id));
  const filtered = answers.filter((a) => allowedIds.has(a.questionId));

  const questions = await db.question.findMany({
    where: { id: { in: [...allowedIds] } },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const bySection: Record<string, { correct: number; total: number }> = {};
  let correct = 0;

  for (const q of session.answers.questions) {
    const a = filtered.find((x) => x.questionId === q.id);
    const answerText = a?.answer?.trim() ?? '';
    const dbQ = qMap.get(q.id);
    if (!dbQ) continue;

    const section = dbQ.questionCategory ?? q.section ?? 'general';
    if (!bySection[section]) bySection[section] = { correct: 0, total: 0 };
    bySection[section].total += 1;

    if (answerText && answerText === dbQ.correctAnswer.trim()) {
      correct += 1;
      bySection[section].correct += 1;
    }
  }

  const total = session.answers.questions.length || 1;
  const score = {
    total: Math.round((correct / total) * 100),
    bySection: Object.fromEntries(
      Object.entries(bySection).map(([k, v]) => [
        k,
        v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      ]),
    ),
  };

  await db.examSession.update({
    where: { id: sessionId },
    data: {
      answers: filtered,
      score,
      submittedAt: now,
      isAutoSubmitted: autoSubmit || expired,
    },
  });

  const details = session.answers.questions.map((q) => {
    const dbQ = qMap.get(q.id);
    const a = filtered.find((x) => x.questionId === q.id);
    if (!dbQ) return null;
    const answerText = a?.answer?.trim() ?? '';
    const isCorrect = answerText === dbQ.correctAnswer.trim();
    return {
      questionId: q.id,
      answer: answerText,
      correctAnswer: dbQ.correctAnswer,
      isCorrect,
      explanation: dbQ.explanation,
      questionCategory: dbQ.questionCategory,
    };
  }).filter(Boolean);

  return { score, submittedAt: now, details, wasExpired: expired };
}

export async function getExamHistory(userId: string) {
  return db.examSession.findMany({
    where: { userId, submittedAt: { not: null } },
    orderBy: { submittedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      level: true,
      score: true,
      submittedAt: true,
      isAutoSubmitted: true,
      mockExamId: true,
    },
  });
}
