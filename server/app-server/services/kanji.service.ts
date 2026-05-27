import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export type KanjiInput = {
  character: string;
  meaning: string;
  jlptLevel: string;
  readingsOn?: string[];
  readingsKun?: string[];
  strokeCount?: number;
  radical?: string;
};

export async function listKanji(params: { jlptLevel?: string; page?: number; limit?: number }) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const where = params.jlptLevel ? { jlptLevel: params.jlptLevel } : {};

  const [items, total] = await Promise.all([
    db.kanji.findMany({ where, orderBy: { character: 'asc' }, skip, take: limit }),
    db.kanji.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getKanji(id: string) {
  const item = await db.kanji.findUnique({ where: { id } });
  if (!item) throw new AppError('Kanji not found', 404, 'NOT_FOUND');
  return item;
}

export async function createKanji(data: KanjiInput, createdById?: string) {
  return db.kanji.create({
    data: {
      ...data,
      ...(createdById ? { createdBy: { connect: { id: createdById } } } : {}),
    },
  });
}

export async function updateKanji(id: string, data: Partial<KanjiInput>) {
  await getKanji(id);
  return db.kanji.update({ where: { id }, data });
}

export async function deleteKanji(id: string) {
  await getKanji(id);
  await db.kanji.delete({ where: { id } });
}
