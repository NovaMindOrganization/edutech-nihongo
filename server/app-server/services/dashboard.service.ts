import { db } from '../config/db.js';

export async function getStudentDashboard(userId: string) {
  const [enrollments, progress, streak, recentErrors] = await Promise.all([
    db.courseEnrollment.findMany({
      where: { userId },
      include: { course: { select: { id: true, title: true, jlptLevel: true } } },
    }),
    db.userLessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { title: true, orderIndex: true, courseId: true, id: true } } },
    }),
    db.userStreak.findUnique({ where: { userId } }),
    db.userErrorLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const completed = progress.filter((p) => p.status === 'completed').length;
  const active = progress.find((p) => p.status === 'active');
  const locked = progress.filter((p) => p.status === 'locked').length;
  const activeCount = progress.filter((p) => p.status === 'active').length;

  const byCourse = enrollments.map((e) => {
    const courseProgress = progress.filter((p) => p.lesson.courseId === e.courseId);
    const total = courseProgress.length;
    const done = courseProgress.filter((p) => p.status === 'completed').length;
    return {
      courseId: e.courseId,
      title: e.course.title,
      jlptLevel: e.course.jlptLevel,
      completed: done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  const weeklyActivity = buildWeeklyActivity(progress);

  return {
    enrollments,
    stats: {
      lessonsCompleted: completed,
      lessonsActive: active?.lesson.title ?? null,
      lessonsLocked: locked,
      lessonsInProgress: activeCount,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    },
    progressChart: {
      byStatus: [
        { label: 'completed', value: completed },
        { label: 'active', value: activeCount },
        { label: 'locked', value: locked },
      ],
      byCourse,
      weeklyActivity,
    },
    recentErrors,
  };
}

function buildWeeklyActivity(
  progress: Array<{ completedAt: Date | null; updatedAt: Date }>,
): Array<{ week: string; count: number }> {
  const buckets = new Map<string, number>();
  for (const p of progress) {
    if (!p.completedAt) continue;
    const d = new Date(p.completedAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, count]) => ({ week, count }));
}

export async function touchStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await db.userStreak.upsert({
    where: { userId },
    create: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    update: {},
  });

  const last = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
  if (last) {
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);
    if (diffDays === 0) return streak;
    const current = diffDays === 1 ? streak.currentStreak + 1 : 1;
    return db.userStreak.update({
      where: { userId },
      data: {
        currentStreak: current,
        longestStreak: Math.max(current, streak.longestStreak),
        lastActiveDate: today,
      },
    });
  }

  return streak;
}
