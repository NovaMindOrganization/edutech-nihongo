import { MasteryItemType } from '@prisma/client';

import { db } from '../config/db.js';

export type NotebookContentType = 'kanji' | 'vocabulary' | 'grammar';

const KANJI_SELECT = {
  id: true,
  character: true,
  hanVietPronunciation: true,
  meaning: true,
  memoryTip: true,
  memoryImageUrl: true,
  memoryImageUpdatedAt: true,
  slug: true,
  readingsOn: true,
  readingsKun: true,
  strokeCount: true,
  jlptLevel: true,
  radical: true,
  examples: {
    orderBy: { orderIndex: 'asc' as const },
    select: { word: true, reading: true, meaning: true },
    take: 1,
  },
};

export async function getProgressLessonIds(userId: string, lessonIds?: string[]) {
  const rows = await db.userLessonProgress.findMany({
    where: {
      userId,
      status: { in: ['active', 'completed'] },
      ...(lessonIds?.length ? { lessonId: { in: lessonIds } } : {}),
    },
    select: { lessonId: true },
  });
  return [...new Set(rows.map((r) => r.lessonId))];
}

export async function getLearnedItemIdSet(userId: string, type: NotebookContentType) {
  const lessonIds = await getProgressLessonIds(userId);
  if (lessonIds.length === 0) return new Set<string>();

  if (type === 'kanji') {
    const rows = await db.lessonKanji.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { kanjiId: true },
    });
    return new Set(rows.map((r) => r.kanjiId));
  }
  if (type === 'vocabulary') {
    const rows = await db.lessonVocabulary.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { vocabularyId: true },
    });
    return new Set(rows.map((r) => r.vocabularyId));
  }
  const rows = await db.lessonGrammar.findMany({
    where: { lessonId: { in: lessonIds } },
    select: { grammarId: true },
  });
  return new Set(rows.map((r) => r.grammarId));
}

export async function listLearnedContent(
  userId: string,
  type: NotebookContentType,
  params: { lessonId?: string; level?: string } = {},
) {
  const lessonIds = await getProgressLessonIds(
    userId,
    params.lessonId ? [params.lessonId] : undefined,
  );
  if (lessonIds.length === 0) return { items: [] as unknown[] };

  if (type === 'kanji') {
    const rows = await db.lessonKanji.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { kanji: { select: KANJI_SELECT } },
    });
    const unique = [...new Map(rows.map((r) => [r.kanji.id, r.kanji])).values()];
    const filtered = params.level
      ? unique.filter((k) => k.jlptLevel === params.level)
      : unique;
    return {
      items: filtered.map((kanji) => ({ id: kanji.id, kanji })),
    };
  }

  if (type === 'vocabulary') {
    const rows = await db.lessonVocabulary.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { vocabulary: true },
    });
    const unique = [...new Map(rows.map((r) => [r.vocabulary.id, r.vocabulary])).values()];
    const filtered = params.level
      ? unique.filter((v) => v.jlptLevel === params.level)
      : unique;
    const mastery = await db.userMasteryItem.findMany({
      where: {
        userId,
        itemType: MasteryItemType.vocabulary,
        itemId: { in: filtered.map((v) => v.id) },
      },
    });
    const masteryMap = new Map(mastery.map((m) => [m.itemId, m]));
    return {
      items: filtered.map((v) => ({
        id: v.id,
        word: v.word,
        reading: v.reading,
        meaning: v.meaning,
        jlptLevel: v.jlptLevel,
        mastery: masteryMap.get(v.id) ?? null,
      })),
    };
  }

  const rows = await db.lessonGrammar.findMany({
    where: { lessonId: { in: lessonIds } },
    include: { grammar: true },
  });
  const unique = [...new Map(rows.map((r) => [r.grammar.id, r.grammar])).values()];
  const filtered = params.level ? unique.filter((g) => g.jlpt === params.level) : unique;
  return {
    items: filtered.map((g) => ({
      id: g.id,
      pattern: g.pattern,
      meaningVi: g.meaningVi,
      title: g.title,
      jlpt: g.jlpt,
    })),
  };
}

export async function listCollectedContent(
  userId: string,
  type: NotebookContentType,
  params: { level?: string } = {},
) {
  if (type === 'grammar') {
    return { items: [] as unknown[] };
  }

  const itemType =
    type === 'kanji' ? MasteryItemType.kanji : MasteryItemType.vocabulary;
  const learnedIds = await getLearnedItemIdSet(userId, type);

  const mastery = await db.userMasteryItem.findMany({
    where: { userId, itemType },
  });

  const collectedMastery = mastery.filter((m) => {
    const inLearned = learnedIds.has(m.itemId);
    const hasPersonal = m.isFavorite || Boolean(m.note?.trim());
    return !inLearned || hasPersonal;
  });

  const ids = collectedMastery.map((m) => m.itemId);
  if (ids.length === 0) return { items: [] as unknown[] };

  if (type === 'kanji') {
    const kanji = await db.kanji.findMany({
      where: {
        id: { in: ids },
        ...(params.level ? { jlptLevel: params.level } : {}),
      },
      select: KANJI_SELECT,
    });
    const kanjiMap = new Map(kanji.map((k) => [k.id, k]));
    return {
      items: collectedMastery
        .map((m) => ({
          id: m.id,
          itemId: m.itemId,
          isLearned: m.isLearned,
          isFavorite: m.isFavorite,
          note: m.note,
          kanji: kanjiMap.get(m.itemId),
        }))
        .filter((x) => x.kanji),
    };
  }

  const vocab = await db.vocabulary.findMany({
    where: {
      id: { in: ids },
      ...(params.level ? { jlptLevel: params.level } : {}),
    },
  });
  const vocabMap = new Map(vocab.map((v) => [v.id, v]));
  return {
    items: collectedMastery
      .map((m) => {
        const v = vocabMap.get(m.itemId);
        if (!v) return null;
        return {
          id: v.id,
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          jlptLevel: v.jlptLevel,
          mastery: {
            isLearned: m.isLearned,
            isFavorite: m.isFavorite,
            note: m.note,
          },
        };
      })
      .filter(Boolean),
  };
}

export async function listNotebookLessons(userId: string, type: NotebookContentType) {
  const lessonIds = await getProgressLessonIds(userId);
  if (lessonIds.length === 0) return { lessons: [] as unknown[] };

  let contentLessonIds: string[] = [];
  if (type === 'kanji') {
    const rows = await db.lessonKanji.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { lessonId: true },
      distinct: ['lessonId'],
    });
    contentLessonIds = rows.map((r) => r.lessonId);
  } else if (type === 'vocabulary') {
    const rows = await db.lessonVocabulary.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { lessonId: true },
      distinct: ['lessonId'],
    });
    contentLessonIds = rows.map((r) => r.lessonId);
  } else {
    const rows = await db.lessonGrammar.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { lessonId: true },
      distinct: ['lessonId'],
    });
    contentLessonIds = rows.map((r) => r.lessonId);
  }

  if (contentLessonIds.length === 0) return { lessons: [] };

  const lessons = await db.lesson.findMany({
    where: { id: { in: contentLessonIds } },
    select: {
      id: true,
      title: true,
      orderIndex: true,
      course: { select: { id: true, title: true, jlptLevel: true } },
    },
    orderBy: [{ courseId: 'asc' }, { orderIndex: 'asc' }],
  });

  return { lessons };
}
