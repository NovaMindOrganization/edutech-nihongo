import { db } from '../config/db.js';
import { toClientReviewQuestion } from '../utils/review-question.js';
import { touchStreak } from './dashboard.service.js';

type ReviewType = 'kanji' | 'vocabulary' | 'grammar' | 'mixed';

export async function generateReview(
  userId: string,
  mode: 'random' | 'weakness' | 'flashcard',
  count: number,
  type: ReviewType = 'mixed',
) {
  const completed = await db.userLessonProgress.findMany({
    where: { userId, status: 'completed' },
    select: { lessonId: true },
  });
  const lessonIds = completed.map((c) => c.lessonId);

  if (lessonIds.length === 0) {
    return { mode, type, questions: [], items: [] };
  }

  if (type === 'kanji') {
    const rows = await db.lessonKanji.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { kanji: true },
    });
    const unique = [...new Map(rows.map((r) => [r.kanji.id, r.kanji])).values()];
    const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, count);
    return {
      mode,
      type,
      items: shuffled.map((k) => ({
        id: k.id,
        itemType: 'kanji' as const,
        front: k.character,
        back: k.meaning,
        readingsOn: k.readingsOn,
        readingsKun: k.readingsKun,
      })),
      questions: [],
    };
  }

  if (type === 'vocabulary') {
    const rows = await db.lessonVocabulary.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { vocabulary: true },
    });
    const unique = [...new Map(rows.map((r) => [r.vocabulary.id, r.vocabulary])).values()];
    const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, count);
    return {
      mode,
      type,
      items: shuffled.map((v) => ({
        id: v.id,
        itemType: 'vocabulary' as const,
        front: v.word,
        reading: v.reading,
        back: v.meaning,
      })),
      questions: [],
    };
  }

  if (type === 'grammar') {
    const rows = await db.lessonGrammar.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { grammar: true },
    });
    const unique = [...new Map(rows.map((r) => [r.grammar.id, r.grammar])).values()];
    const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, count);
    return {
      mode,
      type,
      items: shuffled.map((g) => ({
        id: g.id,
        itemType: 'grammar' as const,
        front: g.pattern,
        back: g.meaningVi,
      })),
      questions: [],
    };
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

  const shuffled = lessonQuestions.sort(() => Math.random() - 0.5).slice(0, count);

  return {
    mode,
    type,
    questions: shuffled.map((lq) =>
      toClientReviewQuestion(lq.question, lq.lessonId, mode),
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
