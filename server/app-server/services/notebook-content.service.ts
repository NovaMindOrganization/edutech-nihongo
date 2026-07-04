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
  if (lessonIds.length === 0) {
    return { items: [] as unknown[], levels: [] as string[] };
  }

  if (type === 'kanji') {
    const lessons = await db.lesson.findMany({
      where: { id: { in: lessonIds } },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        courseId: true,
        course: { select: { id: true, title: true, jlptLevel: true } },
      },
      orderBy: [{ courseId: 'asc' }, { orderIndex: 'asc' }],
    });
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));

    const rows = await db.lessonKanji.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { kanji: { select: KANJI_SELECT } },
    });

    const allLevels = [...new Set(rows.map((r) => r.kanji.jlptLevel))].sort();
    const filteredRows = params.level
      ? rows.filter((r) => r.kanji.jlptLevel === params.level)
      : rows;

    const kanjiIds = [...new Set(filteredRows.map((r) => r.kanjiId))];
    const mastery =
      kanjiIds.length > 0
        ? await db.userMasteryItem.findMany({
            where: {
              userId,
              itemType: MasteryItemType.kanji,
              itemId: { in: kanjiIds },
            },
          })
        : [];
    const learnedSet = new Set(
      mastery.filter((m) => m.isLearned).map((m) => m.itemId),
    );

    const items = filteredRows
      .filter((r) => lessonMap.has(r.lessonId))
      .map((r) => {
        const lesson = lessonMap.get(r.lessonId)!;
        return {
          id: r.kanji.id,
          kanji: r.kanji,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonOrderIndex: lesson.orderIndex,
          courseId: lesson.course.id,
          courseTitle: lesson.course.title,
          courseJlptLevel: lesson.course.jlptLevel,
          isLearned: learnedSet.has(r.kanji.id),
        };
      })
      .sort((a, b) => {
        if (a.courseId !== b.courseId) return a.courseId.localeCompare(b.courseId);
        if (a.lessonOrderIndex !== b.lessonOrderIndex) {
          return a.lessonOrderIndex - b.lessonOrderIndex;
        }
        return a.kanji.character.localeCompare(b.kanji.character);
      });

    return { items, levels: allLevels };
  }

  if (type === 'vocabulary') {
    const lessons = await db.lesson.findMany({
      where: { id: { in: lessonIds } },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        courseId: true,
        course: { select: { id: true, title: true, jlptLevel: true } },
      },
      orderBy: [{ courseId: 'asc' }, { orderIndex: 'asc' }],
    });
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));

    const rows = await db.lessonVocabulary.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { vocabulary: true },
    });

    const allLevels = [...new Set(rows.map((r) => r.vocabulary.jlptLevel))].sort();
    const filteredRows = params.level
      ? rows.filter((r) => r.vocabulary.jlptLevel === params.level)
      : rows;

    const vocabIds = [...new Set(filteredRows.map((r) => r.vocabularyId))];
    const mastery =
      vocabIds.length > 0
        ? await db.userMasteryItem.findMany({
            where: {
              userId,
              itemType: MasteryItemType.vocabulary,
              itemId: { in: vocabIds },
            },
          })
        : [];
    const learnedSet = new Set(
      mastery.filter((m) => m.isLearned).map((m) => m.itemId),
    );

    const items = filteredRows
      .filter((r) => lessonMap.has(r.lessonId))
      .map((r) => {
        const lesson = lessonMap.get(r.lessonId)!;
        const v = r.vocabulary;
        return {
          id: v.id,
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          jlptLevel: v.jlptLevel,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonOrderIndex: lesson.orderIndex,
          courseId: lesson.course.id,
          courseTitle: lesson.course.title,
          courseJlptLevel: lesson.course.jlptLevel,
          isLearned: learnedSet.has(v.id),
        };
      })
      .sort((a, b) => {
        if (a.courseId !== b.courseId) return a.courseId.localeCompare(b.courseId);
        if (a.lessonOrderIndex !== b.lessonOrderIndex) {
          return a.lessonOrderIndex - b.lessonOrderIndex;
        }
        return a.word.localeCompare(b.word, 'ja');
      });

    return { items, levels: allLevels };
  }

  const lessons = await db.lesson.findMany({
    where: { id: { in: lessonIds } },
    select: {
      id: true,
      title: true,
      orderIndex: true,
      courseId: true,
      course: { select: { id: true, title: true, jlptLevel: true } },
    },
    orderBy: [{ courseId: 'asc' }, { orderIndex: 'asc' }],
  });
  const lessonMap = new Map(lessons.map((l) => [l.id, l]));

  const rows = await db.lessonGrammar.findMany({
    where: { lessonId: { in: lessonIds } },
    include: { grammar: true },
  });

  const allLevels = [...new Set(rows.map((r) => r.grammar.jlpt).filter(Boolean))].sort();
  const filteredRows = params.level
    ? rows.filter((r) => r.grammar.jlpt === params.level)
    : rows;

  const grammarIds = [...new Set(filteredRows.map((r) => r.grammarId))];
  const mastery =
    grammarIds.length > 0
      ? await db.userMasteryItem.findMany({
          where: {
            userId,
            itemType: MasteryItemType.grammar,
            itemId: { in: grammarIds },
          },
        })
      : [];
  const learnedSet = new Set(
    mastery.filter((m) => m.isLearned).map((m) => m.itemId),
  );

  const items = filteredRows
    .filter((r) => lessonMap.has(r.lessonId))
    .map((r) => {
      const lesson = lessonMap.get(r.lessonId)!;
      const g = r.grammar;
      return {
        id: g.id,
        pattern: g.pattern,
        meaningVi: g.meaningVi,
        title: g.title,
        jlpt: g.jlpt,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonOrderIndex: lesson.orderIndex,
        courseId: lesson.course.id,
        courseTitle: lesson.course.title,
        courseJlptLevel: lesson.course.jlptLevel,
        isLearned: learnedSet.has(g.id),
      };
    })
    .sort((a, b) => {
      if (a.courseId !== b.courseId) return a.courseId.localeCompare(b.courseId);
      if (a.lessonOrderIndex !== b.lessonOrderIndex) {
        return a.lessonOrderIndex - b.lessonOrderIndex;
      }
      return a.pattern.localeCompare(b.pattern, 'ja');
    });

  return { items, levels: allLevels };
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
