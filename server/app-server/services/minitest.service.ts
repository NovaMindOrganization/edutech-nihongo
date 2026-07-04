import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import { assertStudentLessonAccess } from '../utils/lesson-access.js';
import {
  buildLessonMiniTestMcqs,
  extractGrammarQuizzesFromLesson,
  toClientMiniTestQuestion,
  type MiniTestKanjiRow,
  type MiniTestVocabRow,
} from '../utils/minitest-generator.js';
import { touchStreak } from './dashboard.service.js';
import { getConfigValue } from './config.service.js';
import { loadLessonVocabulary } from './lesson.service.js';
import {
  consumeMiniTestSession,
  createMiniTestSession,
} from './minitest-session.store.js';

async function assertLessonUnlocked(userId: string, lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true, isBonus: true, lessonType: true },
  });
  if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
  await assertStudentLessonAccess(userId, lesson);
  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  return progress ?? { status: 'active' as const, miniTestScore: null };
}

async function loadMiniTestSource(lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      courseId: true,
      orderIndex: true,
      passThreshold: true,
      course: { select: { jlptLevel: true } },
    },
  });
  if (!lesson) {
    throw new AppError('Lesson not found', 404, 'NOT_FOUND');
  }

  const vocabularyRows = await loadLessonVocabulary(lessonId);
  const lessonVocab: MiniTestVocabRow[] = vocabularyRows.map((v) => ({
    id: v.id,
    lessonId: v.lessonId,
    word: v.word,
    reading: v.reading,
    meaning: v.meaning,
  }));

  const courseVocab = await db.vocabulary.findMany({
    where: {
      lesson: { courseId: lesson.courseId },
      jlptLevel: lesson.course.jlptLevel,
    },
    select: {
      id: true,
      lessonId: true,
      word: true,
      reading: true,
      meaning: true,
    },
  });

  const kanjiLinks = await db.lessonKanji.findMany({
    where: { lessonId },
    include: {
      kanji: {
        select: {
          character: true,
          meaning: true,
          hanVietPronunciation: true,
        },
      },
    },
  });

  const lessonKanji: MiniTestKanjiRow[] = kanjiLinks.map((link) => link.kanji);

  const grammarLinks = await db.lessonGrammar.findMany({
    where: { lessonId },
    include: { grammar: { select: { quiz: true } } },
    orderBy: { grammar: { order: "asc" } },
  });
  const grammarQuizzes = extractGrammarQuizzesFromLesson(
    grammarLinks.map((link) => ({ quiz: link.grammar.quiz })),
  );

  return { lesson, lessonVocab, courseVocab, lessonKanji, grammarQuizzes };
}

export async function startMiniTest(userId: string, lessonId: string) {
  await assertLessonUnlocked(userId, lessonId);

  const { lesson, lessonVocab, courseVocab, lessonKanji, grammarQuizzes } =
    await loadMiniTestSource(lessonId);

  const questions = buildLessonMiniTestMcqs({
    lessonVocab,
    courseVocab,
    lessonKanji,
    grammarQuizzes,
    jlptLevel: lesson.course.jlptLevel,
  });

  if (questions.length === 0) {
    throw new AppError('No mini-test content for this lesson', 404, 'NO_QUESTIONS');
  }

  const sessionId = await createMiniTestSession({
    userId,
    lessonId,
    questions,
  });

  return {
    sessionId,
    questions: questions.map(toClientMiniTestQuestion),
  };
}

/** @deprecated Use startMiniTest — kept for route naming compatibility. */
export async function getMiniTestQuestions(userId: string, lessonId: string) {
  return startMiniTest(userId, lessonId);
}

export async function submitMiniTest(
  userId: string,
  lessonId: string,
  input: {
    sessionId: string;
    answers: Array<{ questionId: string; answer: string }>;
  },
) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true, isBonus: true, lessonType: true },
  });
  if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
  await assertStudentLessonAccess(userId, lesson);

  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    include: {
      lesson: {
        include: {
          course: {
            include: {
              lessons: {
                where: { isBonus: false },
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!progress) {
    throw new AppError('Lesson progress not found', 404, 'NOT_FOUND');
  }

  const questions = await consumeMiniTestSession(input.sessionId, userId, lessonId);
  if (!questions?.length) {
    throw new AppError('MiniTest session expired or invalid', 400, 'INVALID_SESSION');
  }

  const answerMap = new Map(input.answers.map((a) => [a.questionId, a.answer]));
  let correct = 0;

  for (const q of questions) {
    const userAnswer = answerMap.get(q.id)?.trim();
    if (userAnswer && userAnswer === q.correctAnswer.trim()) {
      correct += 1;
    } else if (userAnswer) {
      await db.userErrorLog.create({
        data: {
          userId,
          source: 'mini_test',
          questionText: q.questionText,
          originalText: userAnswer,
          correction: q.correctAnswer,
          lessonId,
        },
      });
    }
  }

  const score = Math.round((correct / questions.length) * 100);
  const defaultThreshold = Number(await getConfigValue('default_pass_threshold', '70'));
  const passThreshold = progress.lesson.passThreshold ?? defaultThreshold;
  const passed = score >= passThreshold;

  await db.userLessonProgress.update({
    where: { id: progress.id },
    data: {
      miniTestScore: score,
      attempts: { increment: 1 },
      ...(passed ? { status: 'completed', completedAt: new Date() } : {}),
    },
  });

  await touchStreak(userId);

  if (passed) {
    const courseLessons = progress.lesson.course.lessons;
    const currentIdx = courseLessons.findIndex((l) => l.id === lessonId);
    const nextLesson = courseLessons[currentIdx + 1];

    if (nextLesson) {
      await db.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: nextLesson.id } },
        create: { userId, lessonId: nextLesson.id, status: 'active' },
        update: { status: 'active' },
      });
    }
  }

  return {
    score,
    passThreshold,
    passed,
    correct,
    total: questions.length,
    unlockedNext: passed
      ? progress.lesson.course.lessons.find(
          (l) => l.orderIndex === progress.lesson.orderIndex + 1,
        )?.id ?? null
      : null,
  };
}
