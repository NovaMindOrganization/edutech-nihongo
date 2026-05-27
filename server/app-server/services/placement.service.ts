import { db } from '../config/db.js';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

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

  if (userId) {
    await db.placementResult.create({
      data: { userId, recommendedLevel, scoresByLevel },
    });
  }

  return { recommendedLevel, scoresByLevel, requiresLogin: !userId };
}
