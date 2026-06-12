import { OrderStatus } from '@prisma/client';

import { db } from '../config/db.js';

export async function getAdminAnalytics() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [userCount, enrollments, examSessionsCompleted, orders, revenueAgg] =
    await Promise.all([
      db.user.count(),
      db.courseEnrollment.count(),
      db.examSession.count({ where: { submittedAt: { not: null } } }),
      db.order.findMany({
        where: { status: OrderStatus.paid, createdAt: { gte: since } },
        select: { amount: true, createdAt: true },
      }),
      db.order.aggregate({
        where: { status: OrderStatus.paid },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

  const courses = await db.course.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      jlptLevel: true,
      lessons: {
        where: { isBonus: false },
        select: { id: true },
      },
    },
  });

  const completionRates = await Promise.all(
    courses.map(async (course) => {
      const lessonIds = course.lessons.map((l) => l.id);
      const total = lessonIds.length;
      if (total === 0) {
        return {
          courseId: course.id,
          title: course.title,
          jlptLevel: course.jlptLevel,
          completionPercent: 0,
        };
      }
      const completed = await db.userLessonProgress.count({
        where: {
          lessonId: { in: lessonIds },
          status: 'completed',
        },
      });
      const enrolled = await db.courseEnrollment.count({
        where: { courseId: course.id },
      });
      const denom = enrolled * total || 1;
      return {
        courseId: course.id,
        title: course.title,
        jlptLevel: course.jlptLevel,
        completionPercent: Math.round((completed / denom) * 100),
        enrolled,
      };
    }),
  );

  const difficultLessons = await db.userLessonProgress.groupBy({
    by: ['lessonId'],
    where: {
      attempts: { gt: 1 },
      status: { not: 'completed' },
    },
    _avg: { miniTestScore: true },
    _count: { _all: true },
    orderBy: { _avg: { miniTestScore: 'asc' } },
    take: 10,
  });

  const lessonMeta = difficultLessons.length
    ? await db.lesson.findMany({
        where: { id: { in: difficultLessons.map((d) => d.lessonId) } },
        select: { id: true, title: true, orderIndex: true, course: { select: { jlptLevel: true } } },
      })
    : [];
  const lessonMap = new Map(lessonMeta.map((l) => [l.id, l]));

  return {
    dau: userCount,
    enrollments,
    examSessionsCompleted,
    revenue: {
      totalPaid: Number(revenueAgg._sum.amount ?? 0),
      orderCount: revenueAgg._count,
      last30Days: orders.reduce((sum, o) => sum + Number(o.amount), 0),
    },
    completionRates,
    difficultLessons: difficultLessons.map((row) => ({
      lessonId: row.lessonId,
      avgMiniTestScore: row._avg.miniTestScore,
      stuckCount: row._count._all,
      lesson: lessonMap.get(row.lessonId) ?? null,
    })),
  };
}
