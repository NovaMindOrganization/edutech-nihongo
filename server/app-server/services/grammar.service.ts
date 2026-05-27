import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export type GrammarInput = {
  pattern: string;
  meaning: string;
  meaningEn?: string;
  structure?: string;
  grammarType?: string;
  usageNote?: string;
  jlptLevel: string;
  sourceLesson?: number;
  exampleSentences?: unknown;
};

export async function listGrammar(params: {
  jlptLevel?: string;
  lesson?: number;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;
  const search = params.search?.trim();

  const where = {
    ...(params.jlptLevel ? { jlptLevel: params.jlptLevel } : {}),
    ...(params.lesson != null ? { sourceLesson: params.lesson } : {}),
    ...(search
      ? {
          OR: [
            { pattern: { contains: search, mode: 'insensitive' as const } },
            { meaning: { contains: search, mode: 'insensitive' as const } },
            { structure: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.grammar.findMany({ where, orderBy: [{ sourceLesson: 'asc' }, { pattern: 'asc' }], skip, take: limit }),
    db.grammar.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getGrammar(id: string) {
  const item = await db.grammar.findUnique({ where: { id } });
  if (!item) throw new AppError('Grammar not found', 404, 'NOT_FOUND');
  return item;
}

export async function createGrammar(data: GrammarInput, createdById?: string) {
  return db.grammar.create({
    data: { ...data, createdById },
  });
}

export async function updateGrammar(id: string, data: Partial<GrammarInput>) {
  await getGrammar(id);
  return db.grammar.update({ where: { id }, data });
}

export async function deleteGrammar(id: string) {
  await getGrammar(id);
  await db.grammar.delete({ where: { id } });
}
