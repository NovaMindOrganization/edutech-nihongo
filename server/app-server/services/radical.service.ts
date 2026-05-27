import { Prisma } from '@prisma/client';
import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

interface ListRadicalsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export async function listRadicals(query: ListRadicalsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 250;
  const skip = (page - 1) * limit;

  const where: Prisma.RadicalWhereInput = {};

  if (query.search) {
    const parsedNumber = parseInt(query.search, 10);
    const isNumber = !isNaN(parsedNumber);

    where.OR = [
      { character: { contains: query.search, mode: 'insensitive' } },
      { sinoVietnamese: { contains: query.search, mode: 'insensitive' } },
      { meaning: { contains: query.search, mode: 'insensitive' } }
    ];

    if (isNumber) {
      where.OR.push({ radicalIndex: parsedNumber });
    }
  }

  const [items, total] = await Promise.all([
    db.radical.findMany({
      where,
      skip,
      take: limit,
      orderBy: { radicalIndex: 'asc' },
    }),
    db.radical.count({ where }),
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRadical(id: string) {
  const item = await db.radical.findUnique({ where: { id } });
  if (!item) {
    throw new AppError('Radical not found', 404, 'NOT_FOUND');
  }
  return item;
}

export async function createRadical(data: {
  radicalIndex?: number;
  character: string;
  sinoVietnamese: string;
  meaning: string;
  strokeCount: number;
}) {
  let radicalIndex = data.radicalIndex;
  if (radicalIndex == null) {
    const last = await db.radical.findFirst({
      orderBy: { radicalIndex: 'desc' },
      select: { radicalIndex: true },
    });
    radicalIndex = (last?.radicalIndex ?? 0) + 1;
  }

  return db.radical.create({
    data: {
      character: data.character,
      sinoVietnamese: data.sinoVietnamese,
      meaning: data.meaning,
      strokeCount: data.strokeCount,
      radicalIndex,
    },
  });
}

export async function updateRadical(id: string, data: Partial<{
  radicalIndex: number;
  character: string;
  sinoVietnamese: string;
  meaning: string;
  strokeCount: number;
}>) {
  const exists = await db.radical.findUnique({ where: { id } });
  if (!exists) {
    throw new AppError('Radical not found', 404, 'NOT_FOUND');
  }

  return db.radical.update({
    where: { id },
    data,
  });
}

export async function deleteRadical(id: string) {
  const exists = await db.radical.findUnique({ where: { id } });
  if (!exists) {
    throw new AppError('Radical not found', 404, 'NOT_FOUND');
  }

  return db.radical.delete({ where: { id } });
}
