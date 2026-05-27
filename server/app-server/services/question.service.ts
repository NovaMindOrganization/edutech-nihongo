import type { Prisma } from '@prisma/client';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export type QuestionInput = {
  questionText: string;
  questionType: string;
  options?: Prisma.InputJsonValue;
  correctAnswer: string;
  explanation?: string;
  jlptLevel?: string;
  questionCategory?: string;
  difficulty?: number;
};

export async function listQuestions(params: {
  jlptLevel?: string;
  questionType?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const where = {
    ...(params.jlptLevel ? { jlptLevel: params.jlptLevel } : {}),
    ...(params.questionType ? { questionType: params.questionType } : {}),
  };

  const [items, total] = await Promise.all([
    db.question.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.question.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getQuestion(id: string) {
  const item = await db.question.findUnique({ where: { id } });
  if (!item) throw new AppError('Question not found', 404, 'NOT_FOUND');
  return item;
}

export async function createQuestion(data: QuestionInput, createdById?: string) {
  return db.question.create({
    data: {
      ...data,
      ...(createdById ? { createdBy: { connect: { id: createdById } } } : {}),
    },
  });
}

export async function updateQuestion(id: string, data: Partial<QuestionInput>) {
  await getQuestion(id);
  return db.question.update({ where: { id }, data: data as Prisma.QuestionUpdateInput });
}

export async function deleteQuestion(id: string) {
  await getQuestion(id);
  await db.question.delete({ where: { id } });
}
