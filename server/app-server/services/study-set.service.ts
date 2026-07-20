import type { Prisma, StudySetContentType } from '@prisma/client';

import { db } from '../config/db.js';
import {
  parseStudySetItem,
  type studySetItemInputSchema,
} from '../validators/study-set.validator.js';
import { AppError } from '../utils/app-error.js';
import { generateAndStoreStudySetQuiz, parseStoredQuiz } from './study-set-quiz.service.js';
import type { z } from 'zod';

type StudySetItemInput = z.infer<typeof studySetItemInputSchema>;

const ownerSelect = {
  select: { id: true, displayName: true, email: true },
};

const itemsOrder = { orderBy: { orderIndex: 'asc' as const } };

function countByContentType(items: { contentType: StudySetContentType }[]) {
  const counts: Record<StudySetContentType, number> = {
    vocabulary: 0,
    grammar: 0,
    kanji: 0,
    listening: 0,
    speaking: 0,
  };
  for (const item of items) {
    counts[item.contentType] += 1;
  }
  return counts;
}

function mapListRow(
  set: {
    id: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    tags: unknown;
    isPublic: boolean;
    moderationStatus: string;
    moderationNote: string | null;
    viewCount: number;
    cloneCount: number;
    quiz?: unknown;
    quizGeneratedAt?: Date | null;
    createdAt: Date;
    owner?: { id: string; displayName: string | null; email: string };
    items?: { contentType: StudySetContentType }[];
    _count?: { items: number };
  },
) {
  const items = set.items ?? [];
  return {
    id: set.id,
    title: set.title,
    description: set.description,
    coverImageUrl: set.coverImageUrl,
    tags: Array.isArray(set.tags) ? set.tags : [],
    isPublic: set.isPublic,
    moderationStatus: set.moderationStatus,
    moderationNote: set.moderationNote,
    viewCount: set.viewCount,
    cloneCount: set.cloneCount,
    createdAt: set.createdAt,
    owner: set.owner,
    itemCount: set._count?.items ?? items.length,
    typeCounts: countByContentType(items),
  };
}

function mapDetailExtras(set: {
  quiz?: unknown;
  quizGeneratedAt?: Date | null;
  items: unknown[];
  ownerId: string;
}) {
  return {
    quiz: parseStoredQuiz(set.quiz),
    quizQuestionCount: set.quizQuestionCount ?? null,
    quizGeneratedAt: set.quizGeneratedAt?.toISOString() ?? null,
  };
}

function assertCanViewSet(
  set: { ownerId: string; isPublic: boolean; moderationStatus: string },
  userId?: string,
) {
  if (userId && set.ownerId === userId) return;
  if (set.isPublic && set.moderationStatus === 'approved') return;
  throw new AppError('Study set not found', 404, 'NOT_FOUND');
}

function normalizeItems(items: StudySetItemInput[]) {
  return items.map((item, index) => {
    const parsed = parseStudySetItem(item);
    return {
      contentType: parsed.contentType,
      content: parsed.content as Prisma.InputJsonValue,
      orderIndex: index,
    };
  });
}

export async function listPublicStudySets(query: {
  page?: number;
  limit?: number;
  search?: string;
  contentType?: StudySetContentType;
}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 24;
  const skip = (page - 1) * limit;
  const search = query.search?.trim();

  const where: Prisma.StudySetWhereInput = {
    isPublic: true,
    moderationStatus: 'approved',
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(query.contentType
      ? { items: { some: { contentType: query.contentType } } }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.studySet.findMany({
      where,
      include: {
        owner: ownerSelect,
        items: { select: { contentType: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.studySet.count({ where }),
  ]);

  return {
    items: rows.map(mapListRow),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function listMyStudySets(userId: string) {
  const rows = await db.studySet.findMany({
    where: { ownerId: userId },
    include: {
      items: { select: { contentType: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapListRow);
}

export async function getStudySetById(
  id: string,
  userId?: string,
  options?: { incrementView?: boolean },
) {
  const set = await db.studySet.findUnique({
    where: { id },
    include: {
      owner: ownerSelect,
      items: itemsOrder,
    },
  });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  assertCanViewSet(set, userId);

  if (options?.incrementView && set.isPublic && set.moderationStatus === 'approved') {
    await db.studySet.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    set.viewCount += 1;
  }

  if (
    set.moderationStatus === 'approved' &&
    set.isPublic &&
    !set.quiz &&
    !set.quizGeneratedAt
  ) {
    void generateAndStoreStudySetQuiz(id, set.ownerId);
  }

  return {
    ...mapListRow({ ...set, _count: { items: set.items.length } }),
    items: set.items,
    canEdit: Boolean(userId && set.ownerId === userId),
    ...mapDetailExtras(set),
  };
}

export async function getStudySetForAdmin(id: string) {
  const set = await db.studySet.findUnique({
    where: { id },
    include: {
      owner: ownerSelect,
      items: itemsOrder,
    },
  });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  return {
    ...mapListRow({ ...set, _count: { items: set.items.length } }),
    items: set.items,
    ...mapDetailExtras(set),
  };
}

export async function createStudySet(
  userId: string,
  data: {
    title: string;
    description?: string;
    coverImageUrl?: string;
    tags?: string[];
    isPublic?: boolean;
    items?: StudySetItemInput[];
  },
) {
  // Community uploads default to public → enter moderation queue
  const isPublic = data.isPublic ?? true;
  const items = data.items?.length ? normalizeItems(data.items) : [];

  return db.studySet.create({
    data: {
      ownerId: userId,
      title: data.title,
      description: data.description,
      coverImageUrl: data.coverImageUrl,
      tags: data.tags ?? [],
      isPublic,
      moderationStatus: isPublic ? 'pending' : 'approved',
      items: items.length ? { create: items } : undefined,
    },
    include: { items: itemsOrder, owner: ownerSelect },
  });
}

export async function updateStudySet(
  userId: string,
  id: string,
  data: {
    title?: string;
    description?: string | null;
    coverImageUrl?: string | null;
    tags?: string[];
    isPublic?: boolean;
    items?: Array<StudySetItemInput & { id?: string }>;
  },
) {
  const set = await db.studySet.findFirst({ where: { id, ownerId: userId } });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');

  const nextPublic = data.isPublic ?? set.isPublic;
  const moderationPatch =
    nextPublic && !set.isPublic
      ? { moderationStatus: 'pending' as const, moderatedAt: null, moderationNote: null }
      : {};

  return db.$transaction(async (tx) => {
    if (data.items) {
      await tx.studySetItem.deleteMany({ where: { studySetId: id } });
      const normalized = normalizeItems(data.items);
      if (normalized.length) {
        await tx.studySetItem.createMany({
          data: normalized.map((item) => ({ ...item, studySetId: id })),
        });
      }
    }

    return tx.studySet.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        tags: data.tags,
        isPublic: data.isPublic,
        ...moderationPatch,
      },
      include: { items: itemsOrder, owner: ownerSelect },
    });
  });
}

export async function deleteStudySet(userId: string, id: string) {
  const set = await db.studySet.findFirst({ where: { id, ownerId: userId } });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  await db.studySet.delete({ where: { id } });
}

export async function addStudySetItems(
  userId: string,
  studySetId: string,
  items: StudySetItemInput[],
) {
  const set = await db.studySet.findFirst({ where: { id: studySetId, ownerId: userId } });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');

  const maxOrder = await db.studySetItem.aggregate({
    where: { studySetId },
    _max: { orderIndex: true },
  });
  const start = (maxOrder._max.orderIndex ?? -1) + 1;
  const normalized = normalizeItems(items).map((item, i) => ({
    ...item,
    studySetId,
    orderIndex: start + i,
  }));

  await db.studySetItem.createMany({ data: normalized });
  return getStudySetById(studySetId, userId);
}

export async function removeStudySetItem(
  userId: string,
  studySetId: string,
  itemId: string,
) {
  const set = await db.studySet.findFirst({ where: { id: studySetId, ownerId: userId } });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');

  const deleted = await db.studySetItem.deleteMany({
    where: { id: itemId, studySetId },
  });
  if (!deleted.count) throw new AppError('Item not found', 404, 'NOT_FOUND');
}

export async function listAdminStudySets(query: {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  search?: string;
}) {
  const status = query.status ?? 'pending';
  const search = query.search?.trim();

  const where: Prisma.StudySetWhereInput = {
    isPublic: true,
    ...(status !== 'all' ? { moderationStatus: status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { owner: { email: { contains: search, mode: 'insensitive' } } },
            { owner: { displayName: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const rows = await db.studySet.findMany({
    where,
    include: {
      owner: ownerSelect,
      items: { select: { contentType: true }, take: 20 },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  return rows.map(mapListRow);
}

/** @deprecated use listAdminStudySets */
export async function listPendingStudySets() {
  return listAdminStudySets({ status: 'pending' });
}

export async function moderateStudySet(
  id: string,
  status: 'approved' | 'rejected',
  options?: { moderationNote?: string; quizQuestionCount?: number },
) {
  const set = await db.studySet.findUnique({
    where: { id },
    include: { _count: { select: { items: true } } },
  });
  if (!set) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  if (!set.isPublic) {
    throw new AppError('Only public study sets can be moderated', 422, 'VALIDATION_ERROR');
  }

  if (status === 'approved' && options?.quizQuestionCount == null) {
    throw new AppError('Quiz question count is required when approving', 422, 'VALIDATION_ERROR');
  }

  const updated = await db.studySet.update({
    where: { id },
    data: {
      moderationStatus: status,
      moderatedAt: new Date(),
      moderationNote: status === 'rejected' ? options?.moderationNote ?? null : null,
      ...(status === 'rejected'
        ? { quiz: null, quizGeneratedAt: null, quizQuestionCount: null }
        : { quizQuestionCount: options!.quizQuestionCount, quiz: null, quizGeneratedAt: null }),
    },
    include: { items: itemsOrder, owner: ownerSelect },
  });

  if (status === 'approved') {
    await generateAndStoreStudySetQuiz(id, updated.ownerId);
    const refreshed = await db.studySet.findUnique({
      where: { id },
      include: { items: itemsOrder, owner: ownerSelect },
    });
    return refreshed ?? updated;
  }

  return updated;
}

export async function cloneStudySet(userId: string, id: string) {
  const source = await db.studySet.findUnique({
    where: { id },
    include: { items: itemsOrder },
  });
  if (!source) throw new AppError('Study set not found', 404, 'NOT_FOUND');
  assertCanViewSet(source, userId);

  const [, clone] = await db.$transaction([
    db.studySet.update({
      where: { id },
      data: { cloneCount: { increment: 1 } },
    }),
    db.studySet.create({
      data: {
        ownerId: userId,
        title: `${source.title} (copy)`,
        description: source.description,
        coverImageUrl: source.coverImageUrl,
        tags: source.tags ?? [],
        isPublic: false,
        moderationStatus: 'approved',
        clonedFrom: source.id,
        quiz: source.quiz ?? undefined,
        quizQuestionCount: source.quizQuestionCount,
        quizGeneratedAt: source.quizGeneratedAt,
        items: {
          create: source.items.map((c) => ({
            contentType: c.contentType,
            content: c.content as Prisma.InputJsonValue,
            orderIndex: c.orderIndex,
          })),
        },
      },
      include: { items: itemsOrder },
    }),
  ]);

  return clone;
}
