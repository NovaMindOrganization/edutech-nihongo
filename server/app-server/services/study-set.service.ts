import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export async function listPublicStudySets() {
  return db.studySet.findMany({
    where: { isPublic: true, moderationStatus: 'approved' },
    include: { _count: { select: { cards: true } }, owner: { select: { displayName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function listMyStudySets(userId: string) {
  return db.studySet.findMany({
    where: { ownerId: userId },
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createStudySet(
  userId: string,
  data: { title: string; description?: string; isPublic?: boolean; cards?: Array<{ front: string; back: string }> },
) {
  const isPublic = data.isPublic ?? false;
  return db.studySet.create({
    data: {
      ownerId: userId,
      title: data.title,
      description: data.description,
      isPublic,
      moderationStatus: isPublic ? 'pending' : 'approved',
      cards: data.cards?.length
        ? { create: data.cards.map((c, i) => ({ ...c, orderIndex: i })) }
        : undefined,
    },
    include: { cards: true },
  });
}

export async function updateStudySet(
  userId: string,
  id: string,
  data: Partial<{ title: string; description: string; isPublic: boolean }>,
) {
  const set = await db.studySet.findFirst({ where: { id, ownerId: userId } });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  return db.studySet.update({ where: { id }, data, include: { cards: true } });
}

export async function deleteStudySet(userId: string, id: string) {
  const set = await db.studySet.findFirst({ where: { id, ownerId: userId } });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  await db.studySet.delete({ where: { id } });
}

export async function listPendingStudySets() {
  return db.studySet.findMany({
    where: { isPublic: true, moderationStatus: 'pending' },
    include: {
      _count: { select: { cards: true } },
      owner: { select: { displayName: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function moderateStudySet(
  id: string,
  status: 'approved' | 'rejected',
) {
  const set = await db.studySet.findUnique({ where: { id } });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  return db.studySet.update({
    where: { id },
    data: { moderationStatus: status, moderatedAt: new Date() },
    include: { cards: true },
  });
}

export async function cloneStudySet(userId: string, id: string) {
  const source = await db.studySet.findUnique({
    where: { id },
    include: { cards: true },
  });
  if (!source) throw new AppError('Study set not found', 404, 'NOT_FOUND');

  return db.studySet.create({
    data: {
      ownerId: userId,
      title: `${source.title} (copy)`,
      description: source.description,
      isPublic: false,
      clonedFrom: source.id,
      cards: {
        create: source.cards.map((c) => ({
          front: c.front,
          back: c.back,
          orderIndex: c.orderIndex,
        })),
      },
    },
    include: { cards: true },
  });
}
