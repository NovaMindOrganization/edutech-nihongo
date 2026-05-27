import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export async function listConversations(query: { page?: number; limit?: number; jlptLevel?: string }) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 50, 100);
  const where = query.jlptLevel ? { jlptLevel: query.jlptLevel } : {};
  const [items, total] = await Promise.all([
    db.conversation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.conversation.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function getConversation(id: string) {
  const row = await db.conversation.findUnique({ where: { id } });
  if (!row) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  return row;
}

export async function createConversation(
  data: { title?: string; dialogue: unknown; audioUrl?: string; jlptLevel?: string },
  createdById?: string,
) {
  return db.conversation.create({
    data: {
      title: data.title,
      dialogue: data.dialogue as object,
      audioUrl: data.audioUrl,
      jlptLevel: data.jlptLevel,
      createdById,
    },
  });
}

export async function updateConversation(
  id: string,
  data: Partial<{ title: string; dialogue: unknown; audioUrl: string; jlptLevel: string }>,
) {
  await getConversation(id);
  return db.conversation.update({
    where: { id },
    data: {
      ...data,
      dialogue: data.dialogue !== undefined ? (data.dialogue as object) : undefined,
    },
  });
}

export async function deleteConversation(id: string) {
  await getConversation(id);
  await db.conversation.delete({ where: { id } });
}

export async function assignConversationsToLesson(lessonId: string, conversationIds: string[]) {
  await db.lessonConversation.deleteMany({ where: { lessonId } });
  if (conversationIds.length === 0) return { count: 0 };
  await db.lessonConversation.createMany({
    data: conversationIds.map((conversationId) => ({ lessonId, conversationId })),
    skipDuplicates: true,
  });
  return { count: conversationIds.length };
}
