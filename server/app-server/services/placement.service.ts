import { db } from '../config/db.js';

import { enrollAndInitProgress } from './lesson.service.js';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export type PlacementRoadmap = {
  courseId: string;
  courseTitle: string;
  jlptLevel: string;
  startLessonId: string | null;
  startLessonTitle: string | null;
  startLessonOrderIndex: number | null;
};

async function buildRoadmap(level: string): Promise<PlacementRoadmap | null> {
  const course = await db.course.findFirst({
    where: { jlptLevel: level, isPublished: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      jlptLevel: true,
      lessons: {
        where: { isBonus: false },
        orderBy: { orderIndex: 'asc' },
        take: 1,
        select: { id: true, title: true, orderIndex: true },
      },
    },
  });
  if (!course) return null;
  const start = course.lessons[0] ?? null;
  return {
    courseId: course.id,
    courseTitle: course.title,
    jlptLevel: course.jlptLevel,
    startLessonId: start?.id ?? null,
    startLessonTitle: start?.title ?? null,
    startLessonOrderIndex: start?.orderIndex ?? null,
  };
}

export async function startPlacementTest() {
  const links = await db.placementQuestion.findMany({
    include: { question: true },
    orderBy: { sortOrder: 'asc' },
    take: 20,
  });

  if (links.length === 0) {
    const fallback = await db.question.findMany({
      where: { jlptLevel: { in: LEVELS } },
      take: 15,
    });
    return fallback.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      jlptLevel: q.jlptLevel,
    }));
  }

  return links.map((l) => ({
    id: l.question.id,
    questionText: l.question.questionText,
    questionType: l.question.questionType,
    options: l.question.options,
    jlptLevel: l.question.jlptLevel,
  }));
}

export async function submitPlacementTest(
  userId: string | undefined,
  answers: Array<{ questionId: string; answer: string }>,
) {
  const questions = await db.question.findMany({
    where: { id: { in: answers.map((a) => a.questionId) } },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const scoresByLevel: Record<string, { correct: number; total: number }> = {};
  for (const level of LEVELS) {
    scoresByLevel[level] = { correct: 0, total: 0 };
  }

  for (const a of answers) {
    const q = qMap.get(a.questionId);
    if (!q?.jlptLevel) continue;
    scoresByLevel[q.jlptLevel].total += 1;
    if (a.answer.trim() === q.correctAnswer.trim()) {
      scoresByLevel[q.jlptLevel].correct += 1;
    }
  }

  let recommendedLevel = 'N5';
  for (const level of [...LEVELS].reverse()) {
    const s = scoresByLevel[level];
    if (s.total > 0 && s.correct / s.total >= 0.6) {
      recommendedLevel = level;
      break;
    }
  }

  const roadmap = await buildRoadmap(recommendedLevel);

  let enrolled = false;
  if (userId) {
    await db.placementResult.create({
      data: { userId, recommendedLevel, scoresByLevel },
    });
    if (roadmap?.courseId) {
      try {
        await enrollAndInitProgress(userId, roadmap.courseId);
        enrolled = true;
      } catch {
        enrolled = false;
      }
    }
  }

  return {
    recommendedLevel,
    scoresByLevel,
    roadmap,
    enrolled,
    requiresLogin: !userId,
  };
}
