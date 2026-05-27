import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export async function startExam(userId: string, level: string, mockExamId?: string) {
  let mockExam = mockExamId
    ? await db.mockExam.findUnique({ where: { id: mockExamId } })
    : await db.mockExam.findFirst({ where: { jlptLevel: level } });

  if (!mockExam) {
    mockExam = await db.mockExam.create({
      data: {
        title: `JLPT ${level} Mock`,
        jlptLevel: level,
        durationMinutes: level === 'N5' ? 90 : 120,
      },
    });
  }

  const links = await db.mockExamQuestion.findMany({
    where: { mockExamId: mockExam.id },
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

  const expiresAt = new Date(Date.now() + mockExam.durationMinutes * 60 * 1000);
  const session = await db.examSession.create({
    data: {
      userId,
      mockExamId: mockExam.id,
      level,
      expiresAt,
    },
  });

  return {
    sessionId: session.id,
    expiresAt,
    durationMinutes: mockExam.durationMinutes,
    questions: questions.sort(() => Math.random() - 0.5),
  };
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
  if (now > session.expiresAt && !autoSubmit) {
    throw new AppError('Session expired', 400, 'SESSION_EXPIRED');
  }

  const questions = await db.question.findMany({
    where: { id: { in: answers.map((a) => a.questionId) } },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const bySection: Record<string, { correct: number; total: number }> = {};
  let correct = 0;

  for (const a of answers) {
    const q = qMap.get(a.questionId);
    if (!q) continue;
    const section = q.questionCategory ?? 'general';
    if (!bySection[section]) bySection[section] = { correct: 0, total: 0 };
    bySection[section].total += 1;
    if (a.answer.trim() === q.correctAnswer.trim()) {
      correct += 1;
      bySection[section].correct += 1;
    }
  }

  const total = answers.length || 1;
  const score = {
    total: Math.round((correct / total) * 100),
    bySection: Object.fromEntries(
      Object.entries(bySection).map(([k, v]) => [k, Math.round((v.correct / v.total) * 100)]),
    ),
  };

  await db.examSession.update({
    where: { id: sessionId },
    data: {
      answers,
      score,
      submittedAt: now,
      isAutoSubmitted: autoSubmit,
    },
  });

  return { score, submittedAt: now };
}

export async function getExamHistory(userId: string) {
  return db.examSession.findMany({
    where: { userId, submittedAt: { not: null } },
    orderBy: { submittedAt: 'desc' },
    take: 20,
    select: { id: true, level: true, score: true, submittedAt: true, isAutoSubmitted: true },
  });
}
