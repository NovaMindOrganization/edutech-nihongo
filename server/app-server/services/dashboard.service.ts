import { db } from '../config/db.js';

/** Calendar-day key (UTC) for consistent streak math with @db.Date */
function calendarDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type StreakStats = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
};

/** Days with real study signals (not dashboard visits). */
export async function collectStudyActivityDays(userId: string): Promise<string[]> {
  const days = new Set<string>();

  const progressRows = await db.userLessonProgress.findMany({
    where: {
      userId,
      OR: [{ status: 'completed', completedAt: { not: null } }, { attempts: { gt: 0 } }],
    },
    select: { completedAt: true, updatedAt: true, attempts: true },
  });

  for (const row of progressRows) {
    if (row.completedAt) {
      days.add(calendarDayKey(row.completedAt));
    } else if (row.attempts > 0) {
      days.add(calendarDayKey(row.updatedAt));
    }
  }

  const errorRows = await db.userErrorLog.findMany({
    where: { userId },
    select: { createdAt: true },
  });
  for (const row of errorRows) {
    days.add(calendarDayKey(row.createdAt));
  }

  return [...days].sort();
}

/** Consecutive calendar days ending today or yesterday (Duolingo-style). */
export function computeCurrentStreakFromDays(sortedDays: string[], today = new Date()): number {
  if (!sortedDays.length) return 0;

  const set = new Set(sortedDays);
  const todayKey = calendarDayKey(today);
  const yesterdayMs = Date.parse(`${todayKey}T00:00:00.000Z`) - 86400000;
  const yesterdayKey = new Date(yesterdayMs).toISOString().slice(0, 10);

  let endKey: string | null = null;
  if (set.has(todayKey)) endKey = todayKey;
  else if (set.has(yesterdayKey)) endKey = yesterdayKey;
  else return 0;

  let count = 0;
  let key: string | null = endKey;
  while (key && set.has(key)) {
    count += 1;
    const prevMs = Date.parse(`${key}T00:00:00.000Z`) - 86400000;
    key = new Date(prevMs).toISOString().slice(0, 10);
  }
  return count;
}

export function computeLongestStreakFromDays(sortedDays: string[]): number {
  if (!sortedDays.length) return 0;

  let maxRun = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i += 1) {
    const prevMs = Date.parse(`${sortedDays[i - 1]}T00:00:00.000Z`);
    const currMs = Date.parse(`${sortedDays[i]}T00:00:00.000Z`);
    if (currMs - prevMs === 86400000) {
      run += 1;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 1;
    }
  }
  return maxRun;
}

export async function computeStreakStats(userId: string): Promise<StreakStats> {
  const days = await collectStudyActivityDays(userId);
  return {
    currentStreak: computeCurrentStreakFromDays(days),
    longestStreak: computeLongestStreakFromDays(days),
    lastActiveDate: days.at(-1) ?? null,
  };
}

function streakStatsFromRow(row: {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
}): StreakStats {
  return {
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastActiveDate: row.lastActiveDate?.toISOString().slice(0, 10) ?? null,
  };
}

/** Persist streak to `user_streaks` (source of truth for dashboard). */
async function syncStreakRecord(userId: string, stats: StreakStats) {
  const lastDate = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null;
  return db.userStreak.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastActiveDate: lastDate,
    },
    update: {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastActiveDate: lastDate,
    },
  });
}

/** Recompute from activity tables, then write + return the DB row. */
export async function persistStreakStats(userId: string) {
  const stats = await computeStreakStats(userId);
  const row = await syncStreakRecord(userId, stats);
  return { row, stats: streakStatsFromRow(row) };
}

export async function getStoredStreakStats(userId: string): Promise<StreakStats> {
  const row = await db.userStreak.findUnique({ where: { userId } });
  if (!row) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }
  return streakStatsFromRow(row);
}

export async function getStudentDashboard(userId: string) {
  const [enrollments, progress, recentErrors] = await Promise.all([
    db.courseEnrollment.findMany({
      where: { userId },
      include: { course: { select: { id: true, title: true, jlptLevel: true } } },
    }),
    db.userLessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { title: true, orderIndex: true, courseId: true, id: true } } },
    }),
    db.userErrorLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const completed = progress.filter((p) => p.status === 'completed').length;
  const activeLessons = progress.filter((p) => p.status === 'active');
  const active = activeLessons[0];
  const locked = progress.filter((p) => p.status === 'locked').length;
  const activeCount = activeLessons.length;

  const courseIds = enrollments.map((e) => e.courseId);
  const lessonTotals =
    courseIds.length > 0
      ? await db.lesson.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds }, isBonus: false },
          _count: { id: true },
        })
      : [];
  const lessonTotalByCourse = new Map(
    lessonTotals.map((row) => [row.courseId, row._count.id]),
  );

  const byCourse = enrollments.map((e) => {
    const courseProgress = progress.filter((p) => p.lesson.courseId === e.courseId);
    const total = lessonTotalByCourse.get(e.courseId) ?? courseProgress.length;
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

  // Streak: recompute from activity → upsert user_streaks → return persisted values
  const { stats: streakStats } = await persistStreakStats(userId);

  return {
    enrollments,
    stats: {
      lessonsCompleted: completed,
      lessonsActive: active?.lesson.title ?? null,
      activeLessonId: active?.lesson.id ?? null,
      activeCourseId: active?.lesson.courseId ?? null,
      lessonsActiveCount: activeCount,
      lessonsLocked: locked,
      lessonsTotal: progress.length,
      lessonsInProgress: activeCount,
      currentStreak: streakStats.currentStreak,
      longestStreak: streakStats.longestStreak,
      lastActiveDate: streakStats.lastActiveDate,
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

/** Call after study activity (mini-test, review) — updates `user_streaks`. */
export async function touchStreak(userId: string) {
  const { row } = await persistStreakStats(userId);
  return row;
}
