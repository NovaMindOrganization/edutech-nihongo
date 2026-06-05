import type { VocabularyProgressStatus } from '@prisma/client';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import { loadLessonVocabulary } from './lesson.service.js';

export type VocabSourceFilter = 'all' | 'starred' | 'unmastered' | 'mastered';

async function assertLessonUnlocked(userId: string, lessonId: string) {
  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (!progress || progress.status === 'locked') {
    throw new AppError('Lesson is locked', 403, 'LESSON_LOCKED');
  }
}

export async function listLessonVocabularyWithProgress(
  userId: string,
  lessonId: string,
  source: VocabSourceFilter = 'all',
) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, title: true, orderIndex: true, courseId: true },
  });
  if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');

  await assertLessonUnlocked(userId, lessonId);

  const vocabulary = await loadLessonVocabulary(lessonId);
  const vocabIds = vocabulary.map((v) => v.id);

  const progressRows =
    vocabIds.length > 0
      ? await db.userVocabularyProgress.findMany({
          where: { userId, vocabularyId: { in: vocabIds } },
        })
      : [];

  const progressMap = new Map(progressRows.map((p) => [p.vocabularyId, p]));

  const items = vocabulary.map((v) => {
    const progress = progressMap.get(v.id);
    return {
      id: v.id,
      word: v.word,
      reading: v.reading,
      meaning: v.meaning,
      exampleSentence: v.exampleSentence,
      exampleTranslation: v.exampleTranslation,
      audioUrl: v.audioUrl,
      jlptLevel: v.jlptLevel,
      progress: progress
        ? {
            isStarred: progress.isStarred,
            status: progress.status,
            updatedAt: progress.updatedAt,
          }
        : null,
    };
  });

  const filtered = items.filter((item) => {
    if (source === 'starred') return item.progress?.isStarred === true;
    if (source === 'mastered') return item.progress?.status === 'mastered';
    if (source === 'unmastered') {
      return item.progress?.status !== 'mastered';
    }
    return true;
  });

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      orderIndex: lesson.orderIndex,
      courseId: lesson.courseId,
    },
    items: filtered,
    total: filtered.length,
  };
}

export async function upsertVocabularyProgress(
  userId: string,
  data: {
    vocabularyId: string;
    isStarred?: boolean;
    status?: VocabularyProgressStatus;
  },
) {
  const vocabulary = await db.vocabulary.findUnique({
    where: { id: data.vocabularyId },
    select: { id: true, lessonId: true },
  });
  if (!vocabulary) throw new AppError('Vocabulary not found', 404, 'NOT_FOUND');

  if (vocabulary.lessonId) {
    await assertLessonUnlocked(userId, vocabulary.lessonId);
  } else {
    const link = await db.lessonVocabulary.findFirst({
      where: { vocabularyId: vocabulary.id },
      select: { lessonId: true },
    });
    if (link) await assertLessonUnlocked(userId, link.lessonId);
  }

  const existing = await db.userVocabularyProgress.findUnique({
    where: {
      userId_vocabularyId: { userId, vocabularyId: data.vocabularyId },
    },
  });

  const row = await db.userVocabularyProgress.upsert({
    where: {
      userId_vocabularyId: { userId, vocabularyId: data.vocabularyId },
    },
    create: {
      userId,
      vocabularyId: data.vocabularyId,
      isStarred: data.isStarred ?? false,
      status: data.status ?? null,
    },
    update: {
      ...(data.isStarred !== undefined ? { isStarred: data.isStarred } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });

  return {
    vocabularyId: row.vocabularyId,
    isStarred: row.isStarred,
    status: row.status,
    updatedAt: row.updatedAt,
    created: !existing,
  };
}
