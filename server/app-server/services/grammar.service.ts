import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import type { Prisma } from '@prisma/client';

export type GrammarInput = {
  title: string;
  jlpt: string;
  type?: string;
  pattern: string;
  meaningVi: string;
  usage?: string;
  notes?: string;
  lessonId?: string;
  order?: number;
  examples?: Prisma.InputJsonValue;
  quiz?: Prisma.InputJsonValue;
};

export async function listGrammar(params: {
  jlpt?: string;
  lessonId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;
  const search = params.search?.trim()?.toLowerCase();

  // If lessonId provided, load via junction to avoid referencing grammar.lesson_id
  if (params.lessonId) {
    const linked = await db.lessonGrammar.findMany({
      where: { lessonId: params.lessonId },
      include: { grammar: true },
    });

    let items = linked.map((l) => l.grammar);
    if (params.jlpt) items = items.filter((g) => g.jlpt === params.jlpt);
    if (search)
      items = items.filter(
        (g) =>
          (g.title ?? "").toLowerCase().includes(search) ||
          (g.pattern ?? "").toLowerCase().includes(search) ||
          (g.meaningVi ?? "").toLowerCase().includes(search),
      );

    items = items.sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) ||
        (a.pattern ?? "").localeCompare(b.pattern ?? ""),
    );

    const total = items.length;
    const pageItems = items.slice(skip, skip + limit);
    return { items: pageItems, total, page, limit };
  }

  // No lessonId: query normally
  const where = {
    ...(params.jlpt ? { jlpt: params.jlpt } : {}),
    ...(params.lessonId ? { lessonId: params.lessonId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { pattern: { contains: search, mode: 'insensitive' as const } },
            { meaningVi: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.grammar.findMany({ where, orderBy: [{ order: 'asc' }, { pattern: 'asc' }], skip, take: limit }),
    db.grammar.count({ where }),
  ]);

  return { items, total, page, limit };
}
