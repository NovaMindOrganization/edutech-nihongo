import { MasteryItemType } from '@prisma/client';

import { db } from '../config/db.js';

export async function listNotebookVocabulary(
  userId: string,
  params: { level: string; topic?: string; learned?: boolean; page?: number; limit?: number },
) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const items = await db.vocabulary.findMany({
    where: {
      jlptLevel: params.level,
      ...(params.topic ? { topic: params.topic } : {}),
    },
    orderBy: { word: 'asc' },
    skip,
    take: limit,
  });

  const mastery = await db.userMasteryItem.findMany({
    where: {
      userId,
      itemType: MasteryItemType.vocabulary,
      itemId: { in: items.map((i) => i.id) },
      ...(params.learned != null ? { isLearned: params.learned } : {}),
    },
  });
  const masteryMap = new Map(mastery.map((m) => [m.itemId, m]));

  const filtered = params.learned != null
    ? items.filter((v) => {
        const m = masteryMap.get(v.id);
        return params.learned ? m?.isLearned : !m?.isLearned;
      })
    : items;

  return {
    items: filtered.map((v) => ({
      ...v,
      mastery: masteryMap.get(v.id) ?? null,
    })),
    page,
    limit,
  };
}

export async function upsertMastery(
  userId: string,
  data: { itemId: string; itemType: 'vocabulary' | 'kanji' | 'grammar'; isLearned?: boolean; isFavorite?: boolean; note?: string },
) {
  return db.userMasteryItem.upsert({
    where: {
      userId_itemId_itemType: {
        userId,
        itemId: data.itemId,
        itemType: data.itemType as MasteryItemType,
      },
    },
    create: {
      userId,
      itemId: data.itemId,
      itemType: data.itemType as MasteryItemType,
      isLearned: data.isLearned ?? false,
      isFavorite: data.isFavorite ?? false,
      note: data.note,
    },
    update: {
      ...(data.isLearned != null ? { isLearned: data.isLearned } : {}),
      ...(data.isFavorite != null ? { isFavorite: data.isFavorite } : {}),
      ...(data.note != null ? { note: data.note } : {}),
    },
  });
}
