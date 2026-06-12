import { ArrowRight, BookOpen, Flame, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth';
import { getDashboard } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

const cardBase = 'rounded-xl border border-[#e7e5e4] bg-white shadow-sm';
const cardInteractive =
  'rounded-xl border border-[#e7e5e4] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md';

function ProgressBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const value = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f5f5f4]">
      <div
        className={cn('h-full rounded-full bg-primary transition-all duration-500', className)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className={cn(cardBase, 'flex min-h-[112px] flex-col justify-between p-4 md:p-5')}>
      <p className="text-xs font-medium uppercase tracking-wide text-[#78716c]">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tabular-nums leading-none text-[#44403c]">{value}</p>
          {sub ? <p className="mt-1 text-xs text-[#78716c]">{sub}</p> : null}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fafaf9]">
          <AppIcon icon={icon} size="md" />
        </div>
      </div>
    </div>
  );
}

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-[#78716c]">Đang tải tổng quan…</p>;
  }

  const stats = data?.stats;
  const courses = data?.progressChart?.byCourse ?? [];
  const displayName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'bạn';

  const focusCourse =
    courses.find((c) => c.courseId === stats?.activeCourseId) ?? courses[0] ?? null;

  const continueHref = stats?.activeLessonId
    ? paths.learn.lesson(stats.activeLessonId)
    : focusCourse
      ? paths.learn.course(focusCourse.courseId)
      : paths.learn.hub;

  const lessonTitle = stats?.lessonsActive ?? 'Bắt đầu khóa học đầu tiên';
  const coursePercent = focusCourse?.percent ?? 0;
  const courseCompleted = focusCourse?.completed ?? stats?.lessonsCompleted ?? 0;
  const courseTotal = focusCourse?.total ?? stats?.lessonsTotal ?? 0;
  const remainingLessons = Math.max(0, courseTotal - courseCompleted);
  const goalLevel = focusCourse?.jlptLevel ?? data?.enrollments?.[0]?.course.jlptLevel ?? 'N5';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#44403c] md:text-3xl">
          Xin chào, {displayName}
        </h1>
        <p className="text-sm text-[#78716c] md:text-base">
          Tiếp tục bài học hôm nay để duy trì chuỗi ngày học.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-[#e7e5e4] bg-white shadow-sm">
        <div className="border-l-4 border-l-primary p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Tiếp tục học
              </span>
              <h2 className="font-display text-xl font-bold leading-snug text-[#44403c] md:text-2xl">
                {lessonTitle}
              </h2>

              {focusCourse ? (
                <div className="max-w-md space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#78716c]">Tiến độ khóa học</span>
                    <span className="font-semibold tabular-nums text-primary">{coursePercent}%</span>
                  </div>
                  <ProgressBar percent={coursePercent} />
                  <p className="text-sm text-[#78716c]">
                    {remainingLessons > 0
                      ? `Còn ${remainingLessons} bài chưa hoàn thành`
                      : 'Đã hoàn thành tất cả bài trong khóa này'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#78716c]">
                  Ghi danh khóa N5 để bắt đầu lộ trình học có khóa bài.
                </p>
              )}
            </div>

            <Link to={continueHref} className="shrink-0">
              <Button size="lg" className="h-11 w-full gap-2 px-6 font-semibold md:w-auto">
                Tiếp tục học
                <ArrowRight className="size-4 shrink-0" strokeWidth={2} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#44403c]">Thống kê học tập</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Flame}
            label="Ngày học liên tiếp"
            value={`${stats?.currentStreak ?? 0} ngày`}
            sub={
              stats?.longestStreak
                ? `Kỷ lục ${stats.longestStreak} ngày`
                : undefined
            }
          />
          <StatCard
            icon={TrendingUp}
            label="Tiến độ"
            value={`${courseCompleted} / ${courseTotal}`}
            sub="bài học"
          />
          <StatCard
            icon={Target}
            label="Mục tiêu"
            value={`JLPT ${goalLevel}`}
            sub="Cấp độ đang theo đuổi"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#44403c]">Khóa học của tôi</h2>
          <Link
            to={paths.learn.hub}
            className="text-sm font-medium text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {courses.length === 0 ? (
          <div
            className={cn(
              cardBase,
              'flex flex-col items-center justify-center border-dashed px-6 py-12 text-center',
            )}
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#f5f5f4]">
              <AppIcon icon={BookOpen} size="lg" />
            </div>
            <p className="text-sm text-[#78716c]">Bạn chưa ghi danh khóa học nào.</p>
            <Link to={paths.learn.hub} className="mt-4">
              <Button>Khám phá khóa học</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.courseId}
                to={paths.learn.course(c.courseId)}
                className={cn(cardInteractive, 'block p-5 md:p-6')}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f4]">
                    <AppIcon icon={BookOpen} size="md" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {c.jlptLevel}
                    </span>
                    <h3 className="mt-2 line-clamp-2 font-semibold leading-snug text-[#44403c]">
                      {c.title}
                    </h3>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#78716c]">Tiến độ</span>
                    <span className="font-bold tabular-nums text-primary">{c.percent}%</span>
                  </div>
                  <ProgressBar percent={c.percent} />
                  <p className="text-sm text-[#78716c]">
                    {c.completed} / {c.total} bài học
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
