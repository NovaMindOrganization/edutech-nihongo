import type { Prisma } from '@prisma/client';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export type MockExamInput = {
  title: string;
  jlptLevel: string;
  durationMinutes: number;
  maxAttempts?: number;
};

const DEFAULT_MAX_ATTEMPTS = 3;

export type ImportQuestionInput = {
  questionText: string;
  questionType?: string;
  options: Array<{ label: string; text: string }>;
  correctAnswer: string;
  explanation?: string;
  questionCategory?: string;
  section?: string;
  difficulty?: number;
  audioUrl?: string;
};

export async function listMockExams(params: {
  jlptLevel?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const where = params.jlptLevel ? { jlptLevel: params.jlptLevel } : {};

  const [items, total] = await Promise.all([
    db.mockExam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { questions: true, sessions: true } },
      },
    }),
    db.mockExam.count({ where }),
  ]);

  return {
    items: items.map((e) => ({
      id: e.id,
      title: e.title,
      jlptLevel: e.jlptLevel,
      durationMinutes: e.durationMinutes,
      maxAttempts: e.maxAttempts,
      createdAt: e.createdAt,
      questionCount: e._count.questions,
      totalSessions: e._count.sessions,
    })),
    total,
    page,
    limit,
  };
}

export async function getMockExam(id: string) {
  const exam = await db.mockExam.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          question: {
            select: {
              id: true,
              questionText: true,
              questionType: true,
              options: true,
              correctAnswer: true,
              explanation: true,
              jlptLevel: true,
              questionCategory: true,
              difficulty: true,
              audioUrl: true,
            },
          },
        },
      },
      _count: { select: { sessions: true } },
    },
  });
  if (!exam) throw new AppError('Mock exam not found', 404, 'NOT_FOUND');

  return {
    id: exam.id,
    title: exam.title,
    jlptLevel: exam.jlptLevel,
    durationMinutes: exam.durationMinutes,
    maxAttempts: exam.maxAttempts,
    createdAt: exam.createdAt,
    totalSessions: exam._count.sessions,
    questions: exam.questions.map((link, index) => ({
      order: index + 1,
      section: link.section,
      question: link.question,
    })),
  };
}

export async function createMockExam(data: MockExamInput, createdById?: string) {
  return db.mockExam.create({
    data: {
      title: data.title,
      jlptLevel: data.jlptLevel,
      durationMinutes: data.durationMinutes,
      maxAttempts: data.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      ...(createdById ? { createdById } : {}),
    },
  });
}

export async function updateMockExam(id: string, data: Partial<MockExamInput>) {
  await getMockExam(id);
  return db.mockExam.update({
    where: { id },
    data,
  });
}

export async function deleteMockExam(id: string) {
  await getMockExam(id);
  await db.mockExam.delete({ where: { id } });
}

export async function removeQuestionFromExam(mockExamId: string, questionId: string) {
  await db.mockExamQuestion.delete({
    where: {
      mockExamId_questionId: { mockExamId, questionId },
    },
  });
}

export async function addQuestionsToExam(
  mockExamId: string,
  questions: ImportQuestionInput[],
  createdById?: string,
) {
  const exam = await db.mockExam.findUnique({ where: { id: mockExamId } });
  if (!exam) throw new AppError('Mock exam not found', 404, 'NOT_FOUND');

  const created: string[] = [];

  for (const q of questions) {
    const question = await db.question.create({
      data: {
        questionText: q.questionText,
        questionType: q.questionType ?? 'multiple_choice',
        options: q.options as Prisma.InputJsonValue,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        jlptLevel: exam.jlptLevel,
        questionCategory: q.questionCategory ?? q.section,
        difficulty: q.difficulty ?? 1,
        audioUrl: q.audioUrl,
        ...(createdById ? { createdBy: { connect: { id: createdById } } } : {}),
      },
    });

    await db.mockExamQuestion.upsert({
      where: {
        mockExamId_questionId: { mockExamId, questionId: question.id },
      },
      create: {
        mockExamId,
        questionId: question.id,
        section: q.section ?? q.questionCategory ?? null,
      },
      update: {
        section: q.section ?? q.questionCategory ?? null,
      },
    });

    created.push(question.id);
  }

  return { imported: created.length, questionIds: created };
}

export async function listExamsForStudent(jlptLevel?: string, userId?: string) {
  const where = jlptLevel ? { jlptLevel } : {};

  const exams = await db.mockExam.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { questions: true } },
    },
  });

  const examIds = exams.map((e) => e.id);
  let userAttempts: Record<string, number> = {};
  let activeExamIds = new Set<string>();

  if (userId && examIds.length > 0) {
    const now = new Date();
    const [submitted, active] = await Promise.all([
      db.examSession.groupBy({
        by: ['mockExamId'],
        where: {
          userId,
          mockExamId: { in: examIds },
          submittedAt: { not: null },
        },
        _count: { id: true },
      }),
      db.examSession.findMany({
        where: {
          userId,
          mockExamId: { in: examIds },
          submittedAt: null,
          expiresAt: { gt: now },
        },
        select: { mockExamId: true },
      }),
    ]);

    userAttempts = Object.fromEntries(
      submitted
        .filter((s) => s.mockExamId)
        .map((s) => [s.mockExamId!, s._count.id]),
    );
    activeExamIds = new Set(
      active.map((s) => s.mockExamId).filter((id): id is string => Boolean(id)),
    );
  }

  return exams.map((e) => {
    const myAttemptCount = userAttempts[e.id] ?? 0;
    const hasActiveSession = activeExamIds.has(e.id);
    const attemptsRemaining = Math.max(0, e.maxAttempts - myAttemptCount);
    const canStart =
      e._count.questions > 0 && (hasActiveSession || myAttemptCount < e.maxAttempts);

    return {
      id: e.id,
      title: e.title,
      jlptLevel: e.jlptLevel,
      durationMinutes: e.durationMinutes,
      maxAttempts: e.maxAttempts,
      questionCount: e._count.questions,
      myAttemptCount,
      attemptsRemaining,
      hasActiveSession,
      canStart,
    };
  });
}
