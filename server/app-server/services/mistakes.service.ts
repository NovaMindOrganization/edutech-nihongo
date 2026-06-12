import { db } from '../config/db.js';

export async function listUserMistakes(userId: string, limit = 30) {
  const errors = await db.userErrorLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 100),
    include: {
      lesson: { select: { id: true, title: true, orderIndex: true } },
    },
  });

  return errors.map((e) => ({
    id: e.id,
    source: e.source,
    userAnswer: e.originalText,
    correctAnswer: e.correction,
    createdAt: e.createdAt,
    lesson: e.lesson,
  }));
}
