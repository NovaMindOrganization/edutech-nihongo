import type {
  FeedbackCategory,
  FeedbackStatus,
  Prisma,
  UserRole,
} from '@prisma/client';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import type {
  CreateFeedbackInput,
  FeedbackListQuery,
} from '../validators/feedback.validator.js';

type Viewer = { id: string; role: UserRole };

const authorSelect = {
  select: { id: true, displayName: true, email: true, role: true },
};

const feedbackInclude = {
  user: authorSelect,
  assignee: authorSelect,
  course: { select: { id: true, title: true } },
  lesson: { select: { id: true, title: true } },
  messages: {
    include: { author: authorSelect },
    orderBy: { createdAt: 'asc' as const },
  },
};

const CLOSED_STATUSES: FeedbackStatus[] = ['closed', 'rejected', 'resolved'];

function isStaff(role: UserRole) {
  return role === 'admin' || role === 'instructor';
}

function canStaffAccessFeedback(viewer: Viewer, category: FeedbackCategory) {
  if (viewer.role === 'admin') return true;
  if (viewer.role === 'instructor') return category === 'lesson_content';
  return false;
}

async function validateContextRefs(body: CreateFeedbackInput) {
  if (body.lessonId) {
    const lesson = await db.lesson.findUnique({
      where: { id: body.lessonId },
      select: { id: true, courseId: true },
    });
    if (!lesson) {
      throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    }
    if (body.courseId && body.courseId !== lesson.courseId) {
      throw new AppError('Lesson does not belong to course', 422, 'VALIDATION_ERROR');
    }
  } else if (body.courseId) {
    const course = await db.course.findUnique({ where: { id: body.courseId }, select: { id: true } });
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }
  }
}

function mapFeedbackRow(
  row: Prisma.UserFeedbackGetPayload<{ include: typeof feedbackInclude }>,
  viewer: Viewer,
) {
  const showInternal = isStaff(viewer.role);
  return {
    id: row.id,
    userId: row.userId,
    category: row.category,
    title: row.title,
    description: row.description,
    status: row.status,
    courseId: row.courseId,
    lessonId: row.lessonId,
    pageUrl: row.pageUrl,
    assigneeId: row.assigneeId,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: row.user,
    assignee: row.assignee,
    course: row.course,
    lesson: row.lesson,
    messages: row.messages
      .filter((m) => showInternal || !m.isInternal)
      .map((m) => ({
        id: m.id,
        feedbackId: m.feedbackId,
        authorId: m.authorId,
        body: m.body,
        isInternal: m.isInternal,
        createdAt: m.createdAt,
        author: m.author,
      })),
  };
}

function buildListWhere(viewer: Viewer, query: FeedbackListQuery): Prisma.UserFeedbackWhereInput {
  const search = query.search?.trim();
  const base: Prisma.UserFeedbackWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  if (viewer.role === 'student') {
    return { ...base, userId: viewer.id };
  }
  if (viewer.role === 'instructor') {
    return { ...base, category: 'lesson_content' };
  }
  return base;
}

export async function createFeedback(userId: string, body: CreateFeedbackInput) {
  await validateContextRefs(body);

  let courseId = body.courseId ?? null;
  if (body.lessonId && !courseId) {
    const lesson = await db.lesson.findUnique({
      where: { id: body.lessonId },
      select: { courseId: true },
    });
    courseId = lesson?.courseId ?? null;
  }

  const feedback = await db.userFeedback.create({
    data: {
      userId,
      category: body.category,
      title: body.title.trim(),
      description: body.description.trim(),
      courseId,
      lessonId: body.lessonId ?? null,
      pageUrl: body.pageUrl ?? null,
      messages: {
        create: {
          authorId: userId,
          body: body.description.trim(),
        },
      },
    },
    include: feedbackInclude,
  });

  return mapFeedbackRow(feedback, { id: userId, role: 'student' });
}

export async function listFeedbacks(viewer: Viewer, query: FeedbackListQuery) {
  const where = buildListWhere(viewer, query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    db.userFeedback.findMany({
      where,
      include: {
        user: authorSelect,
        assignee: authorSelect,
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
    }),
    db.userFeedback.count({ where }),
  ]);

  return {
    items: items.map((row) => ({
      id: row.id,
      userId: row.userId,
      category: row.category,
      title: row.title,
      description: row.description,
      status: row.status,
      courseId: row.courseId,
      lessonId: row.lessonId,
      pageUrl: row.pageUrl,
      assigneeId: row.assigneeId,
      resolvedAt: row.resolvedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user,
      assignee: row.assignee,
      course: row.course,
      lesson: row.lesson,
    })),
    total,
    page: query.page,
    limit: query.limit,
  };
}

async function getFeedbackOrThrow(id: string) {
  const feedback = await db.userFeedback.findUnique({
    where: { id },
    include: feedbackInclude,
  });
  if (!feedback) {
    throw new AppError('Feedback not found', 404, 'NOT_FOUND');
  }
  return feedback;
}

function assertCanView(viewer: Viewer, feedback: { userId: string; category: FeedbackCategory }) {
  if (viewer.role === 'student' && feedback.userId !== viewer.id) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }
  if (isStaff(viewer.role) && !canStaffAccessFeedback(viewer, feedback.category)) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }
}

export async function getFeedbackDetail(id: string, viewer: Viewer) {
  const feedback = await getFeedbackOrThrow(id);
  assertCanView(viewer, feedback);
  return mapFeedbackRow(feedback, viewer);
}

export async function addMessage(
  feedbackId: string,
  author: Viewer,
  body: string,
  isInternal = false,
) {
  const feedback = await getFeedbackOrThrow(feedbackId);
  assertCanView(author, feedback);

  if (author.role === 'student') {
    if (feedback.userId !== author.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    if (CLOSED_STATUSES.includes(feedback.status)) {
      throw new AppError('Feedback is closed', 422, 'VALIDATION_ERROR');
    }
    if (isInternal) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
  } else {
    if (!canStaffAccessFeedback(author, feedback.category)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    if (feedback.status === 'closed' || feedback.status === 'rejected') {
      throw new AppError('Feedback is closed', 422, 'VALIDATION_ERROR');
    }
  }

  const updateData: Prisma.UserFeedbackUpdateInput = {};
  if (isStaff(author.role) && feedback.status === 'pending') {
    updateData.status = 'in_progress';
    if (!feedback.assigneeId) {
      updateData.assignee = { connect: { id: author.id } };
    }
  }

  await db.$transaction([
    db.feedbackMessage.create({
      data: {
        feedbackId,
        authorId: author.id,
        body: body.trim(),
        isInternal: isStaff(author.role) ? isInternal : false,
      },
    }),
    ...(Object.keys(updateData).length
      ? [db.userFeedback.update({ where: { id: feedbackId }, data: updateData })]
      : []),
  ]);

  return getFeedbackDetail(feedbackId, author);
}

export async function updateFeedbackStatus(
  feedbackId: string,
  staff: Viewer,
  status: FeedbackStatus,
) {
  if (!isStaff(staff.role)) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const feedback = await getFeedbackOrThrow(feedbackId);
  if (!canStaffAccessFeedback(staff, feedback.category)) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const staffStatuses: FeedbackStatus[] = ['in_progress', 'resolved', 'rejected'];
  if (!staffStatuses.includes(status)) {
    throw new AppError('Invalid status transition', 422, 'VALIDATION_ERROR');
  }

  await db.userFeedback.update({
    where: { id: feedbackId },
    data: {
      status,
      resolvedAt: status === 'resolved' ? new Date() : feedback.resolvedAt,
      assigneeId: feedback.assigneeId ?? staff.id,
    },
  });

  return getFeedbackDetail(feedbackId, staff);
}

export async function closeFeedback(feedbackId: string, userId: string) {
  const feedback = await getFeedbackOrThrow(feedbackId);
  if (feedback.userId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }
  if (feedback.status === 'closed') {
    return mapFeedbackRow(feedback, { id: userId, role: 'student' });
  }

  await db.userFeedback.update({
    where: { id: feedbackId },
    data: { status: 'closed' },
  });

  return getFeedbackDetail(feedbackId, { id: userId, role: 'student' });
}

export async function getFeedbackStats() {
  const groups = await db.userFeedback.groupBy({
    by: ['category', 'status'],
    _count: { _all: true },
  });

  const pendingByCategory: Record<string, number> = {};
  let totalPending = 0;

  for (const row of groups) {
    if (row.status === 'pending') {
      pendingByCategory[row.category] = (pendingByCategory[row.category] ?? 0) + row._count._all;
      totalPending += row._count._all;
    }
  }

  return { totalPending, pendingByCategory };
}
