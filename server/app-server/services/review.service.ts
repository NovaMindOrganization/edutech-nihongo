import { MasteryItemType } from '@prisma/client';

import { db } from '../config/db.js';
import { toClientReviewQuestion } from '../utils/review-question.js';
import {
  getProgressLessonIds,
  type NotebookContentType,
} from './notebook-content.service.js';
import { touchStreak } from './dashboard.service.js';

type ReviewType = 'kanji' | 'vocabulary' | 'grammar' | 'mixed';
type ReviewPool = 'learned' | 'collected';
type ReviewGenerateMode = 'random' | 'weakness' | 'flashcard' | 'lesson' | 'pick';

export type GenerateReviewInput = {
  mode?: ReviewGenerateMode;
  count?: number;
  type?: ReviewType;
  pool?: ReviewPool;
  lessonIds?: string[];
  itemIds?: string[];
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

async function flashcardFromLearned(
  userId: string,
  type: NotebookContentType,
  count: number,
  lessonIds?: string[],
) {
  const ids = await getProgressLessonIds(userId, lessonIds);
  if (ids.length === 0) return [];

  if (type === 'kanji') {
    const rows = await db.lessonKanji.findMany({
      where: { lessonId: { in: ids } },
      include: { kanji: true },
    });
    const unique = [...new Map(rows.map((r) => [r.kanji.id, r.kanji])).values()];
    return shuffle(unique)
      .slice(0, count)
      .map((k) => ({
        id: k.id,
        itemType: 'kanji' as const,
        front: k.character,
        back: k.meaning,
        reading: k.readingsKun[0] ?? k.readingsOn[0],
      }));
  }

  if (type === 'vocabulary') {
    const rows = await db.lessonVocabulary.findMany({
      where: { lessonId: { in: ids } },
      include: { vocabulary: true },
    });
    const unique = [...new Map(rows.map((r) => [r.vocabulary.id, r.vocabulary])).values()];
    return shuffle(unique)
      .slice(0, count)
      .map((v) => ({
        id: v.id,
        itemType: 'vocabulary' as const,
        front: v.word,
        back: v.meaning,
        reading: v.reading ?? undefined,
      }));
  }

  const rows = await db.lessonGrammar.findMany({
    where: { lessonId: { in: ids } },
    include: { grammar: true },
  });
  const unique = [...new Map(rows.map((r) => [r.grammar.id, r.grammar])).values()];
  return shuffle(unique)
    .slice(0, count)
    .map((g) => ({
      id: g.id,
      itemType: 'grammar' as const,
      front: g.pattern,
      back: g.meaningVi,
    }));
}

async function flashcardFromCollected(
  userId: string,
  type: 'kanji' | 'vocabulary',
  count: number,
  itemIds?: string[],
) {
  const itemType = type === 'kanji' ? MasteryItemType.kanji : MasteryItemType.vocabulary;
  const mastery = await db.userMasteryItem.findMany({
    where: {
      userId,
      itemType,
      ...(itemIds?.length ? { itemId: { in: itemIds } } : {}),
    },
  });
  if (mastery.length === 0) return [];

  const picked = shuffle(itemIds?.length ? mastery : mastery).slice(0, count);
  const ids = picked.map((m) => m.itemId);

  if (type === 'kanji') {
    const kanji = await db.kanji.findMany({ where: { id: { in: ids } } });
    const map = new Map(kanji.map((k) => [k.id, k]));
    return picked
      .map((m) => map.get(m.itemId))
      .filter(Boolean)
      .map((k) => ({
        id: k!.id,
        itemType: 'kanji' as const,
        front: k!.character,
        back: k!.meaning,
        reading: k!.readingsKun[0] ?? k!.readingsOn[0],
      }));
  }

  const vocab = await db.vocabulary.findMany({ where: { id: { in: ids } } });
  const map = new Map(vocab.map((v) => [v.id, v]));
  return picked
    .map((m) => map.get(m.itemId))
    .filter(Boolean)
    .map((v) => ({
      id: v!.id,
      itemType: 'vocabulary' as const,
      front: v!.word,
      back: v!.meaning,
      reading: v!.reading ?? undefined,
    }));
}

export async function generateReview(userId: string, input: GenerateReviewInput = {}) {
  const legacyMode = input.mode ?? 'random';
  const mode: ReviewGenerateMode =
    legacyMode === 'flashcard' ? 'random' : legacyMode;
  const count = Math.min(input.count ?? 20, 50);
  const type = input.type ?? 'mixed';
  const pool = input.pool ?? 'learned';

  if (pool === 'collected' && type !== 'mixed' && type !== 'grammar') {
    const reviewMode = input.mode === 'pick' || mode === 'pick' ? 'pick' : 'random';
    const items = await flashcardFromCollected(
      userId,
      type,
      count,
      reviewMode === 'pick' ? input.itemIds : undefined,
    );
    return { mode: reviewMode, type, pool, items, questions: [] };
  }

  if (
    pool === 'learned' &&
    type !== 'mixed' &&
    (mode === 'random' || mode === 'lesson' || legacyMode === 'flashcard')
  ) {
    const lessonFilter =
      mode === 'lesson' && input.lessonIds?.length ? input.lessonIds : undefined;
    const items = await flashcardFromLearned(userId, type, count, lessonFilter);
    return {
      mode: mode === 'lesson' ? 'lesson' : 'random',
      type,
      pool,
      items,
      questions: [],
    };
  }

  const completed = await db.userLessonProgress.findMany({
    where: { userId, status: 'completed' },
    select: { lessonId: true },
  });
  const lessonIds = completed.map((c) => c.lessonId);

  if (lessonIds.length === 0) {
    return { mode, type, pool, questions: [], items: [] };
  }

  if (type === 'kanji') {
    const items = await flashcardFromLearned(userId, 'kanji', count);
    return { mode, type, pool: 'learned' as const, items, questions: [] };
  }

  if (type === 'vocabulary') {
    const items = await flashcardFromLearned(userId, 'vocabulary', count);
    return { mode, type, pool: 'learned' as const, items, questions: [] };
  }

  if (type === 'grammar') {
    const items = await flashcardFromLearned(userId, 'grammar', count);
    return { mode, type, pool: 'learned' as const, items, questions: [] };
  }

  if (mode === 'weakness') {
    const errors = await db.userErrorLog.findMany({
      where: { userId, lessonId: { in: lessonIds } },
      orderBy: { createdAt: 'desc' },
      take: count * 2,
    });
    if (errors.length > 0) {
      const lessonQuestions = await db.lessonQuestion.findMany({
        where: { lessonId: { in: lessonIds } },
        include: { question: true },
        take: count,
      });
      return {
        mode,
        type,
        pool,
        questions: lessonQuestions.map((lq) =>
          toClientReviewQuestion(lq.question, lq.lessonId, mode),
        ),
        items: [],
      };
    }
  }

  const lessonQuestions = await db.lessonQuestion.findMany({
    where: { lessonId: { in: lessonIds } },
    include: { question: true },
  });

  const shuffled = shuffle(lessonQuestions).slice(0, count);

  const legacyQuestionMode =
    mode === 'lesson' || mode === 'pick' ? 'random' : mode;
  return {
    mode,
    type,
    pool,
    questions: shuffled.map((lq) =>
      toClientReviewQuestion(lq.question, lq.lessonId, legacyQuestionMode),
    ),
    items: [],
  };
}

export async function submitReview(
  userId: string,
  results: Array<{ questionId: string; correct: boolean; answer?: string }>,
) {
  for (const r of results.filter((x) => !x.correct)) {
    const q = await db.question.findUnique({ where: { id: r.questionId } });
    if (q) {
      const lessonLink = await db.lessonQuestion.findFirst({
        where: { questionId: r.questionId },
        select: { lessonId: true },
      });
      await db.userErrorLog.create({
        data: {
          userId,
          source: 'review',
          questionText: q.questionText,
          originalText: r.answer,
          correction: q.correctAnswer,
          lessonId: lessonLink?.lessonId,
        },
      });
    }
  }

  if (results.length > 0) {
    await touchStreak(userId);
  }

  return { logged: results.filter((r) => !r.correct).length };
}
