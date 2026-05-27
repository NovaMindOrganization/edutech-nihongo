import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import { getConfigValue } from './config.service.js';

export async function getMiniTestQuestions(userId: string, lessonId: string) {
  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (!progress || progress.status === 'locked') {
    throw new AppError('Lesson is locked', 403, 'LESSON_LOCKED');
  }

  const links = await db.lessonQuestion.findMany({
    where: { lessonId },
    include: {
      question: {
        select: {
          id: true,
          questionText: true,
          questionType: true,
          options: true,
          audioUrl: true,
          questionCategory: true,
        },
      },
    },
  });

  return links.map((l) => l.question);
}

export async function submitMiniTest(
  userId: string,
  lessonId: string,
  answers: Array<{ questionId: string; answer: string }>,
) {
  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    include: { lesson: { include: { course: { include: { lessons: { where: { isBonus: false }, orderBy: { orderIndex: 'asc' } } } } } } },
  });

  if (!progress || progress.status === 'locked') {
    throw new AppError('Lesson is locked', 403, 'LESSON_LOCKED');
  }

  const questions = await db.lessonQuestion.findMany({
    where: { lessonId },
    include: { question: true },
  });

  if (questions.length === 0) {
    throw new AppError('No mini-test questions for this lesson', 404, 'NO_QUESTIONS');
  }

  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
  let correct = 0;

  for (const lq of questions) {
    const userAnswer = answerMap.get(lq.questionId)?.trim();
    if (userAnswer && userAnswer === lq.question.correctAnswer.trim()) {
      correct += 1;
    } else if (userAnswer) {
      await db.userErrorLog.create({
        data: {
          userId,
          source: 'mini_test',
          originalText: userAnswer,
          correction: lq.question.correctAnswer,
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
      ...(passed
        ? { status: 'completed', completedAt: new Date() }
        : {}),
    },
  });

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
      ? progress.lesson.course.lessons.find((l) => l.orderIndex === progress.lesson.orderIndex + 1)?.id ?? null
      : null,
  };
}
