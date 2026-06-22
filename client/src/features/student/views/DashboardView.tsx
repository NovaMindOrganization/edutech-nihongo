import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  Flame,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { PageHero } from '@/components/usable/page-hero';
import {
  DashboardSkeleton,
  EmptyState,
  emptyStatePresets,
} from '@/components/usable/states';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth';
import { getDashboard } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

const cardBase = 'rounded-xl border border-border bg-surface-paper shadow-premium card-lift';
const cardInteractive =
  'sticker-lift rounded-xl border border-border bg-surface-paper shadow-premium card-lift';

function ProgressBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const value = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-4 w-full overflow-hidden rounded-full border border-border bg-muted">
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
  accent = 'bg-tertiary/50',
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={cn(cardBase, 'relative flex min-h-[128px] flex-col justify-between overflow-hidden p-4 md:p-5')}>
      <div className={cn('pointer-events-none absolute -right-5 -top-5 size-16 rounded-full border border-border', accent)} />
      <p className="relative font-display text-xs font-extrabold uppercase tracking-widest text-primary">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-extrabold tabular-nums leading-none text-foreground">{value}</p>
          {sub ? <p className="mt-1 text-xs font-medium text-muted-foreground">{sub}</p> : null}
        </div>
        <AppIcon icon={icon} size="lg" />
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function WeeklyActivity({ items }: { items: Array<{ week: string; count: number }> }) {
  const recent = items.slice(-6);
  const max = Math.max(...recent.map((item) => item.count), 1);

  return (
    <div className={cn(cardBase, 'relative overflow-hidden p-5 md:p-6')}>
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border bg-secondary/40" />
      <SectionTitle eyebrow="Nhịp học" title="Hoạt động gần đây" />
      {recent.length ? (
        <div className="mt-6 flex h-40 items-end gap-3">
          {recent.map((item, index) => {
            const height = Math.max(16, Math.round((item.count / max) * 100));
            return (
              <div key={`${item.week}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-lg border border-border bg-muted p-1 shadow-premium card-lift">
                  <div
                    className={cn(
                      'w-full rounded-xl border border-border transition-all',
                      index % 3 === 0 && 'bg-primary',
                      index % 3 === 1 && 'bg-tertiary',
                      index % 3 === 2 && 'bg-quaternary',
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{item.week}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          embedded
          size="sm"
          tone="default"
          title="Chưa có dữ liệu tuần"
          description="Hoàn thành bài học đầu tiên để tạo nhịp học trên biểu đồ."
        />
      )}
    </div>
  );
}

function AchievementBadge({
  icon,
  title,
  desc,
  unlocked,
  accent,
}: {
  icon: typeof Trophy;
  title: string;
  desc: string;
  unlocked: boolean;
  accent: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border p-4 shadow-premium card-lift transition-all',
        unlocked ? 'bg-surface-paper' : 'bg-muted opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <AppIcon icon={icon} size="md" className={unlocked ? accent : 'bg-muted'} />
        <div>
          <p className="font-display font-extrabold tracking-tight">{title}</p>
          <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">{desc}</p>
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
    return <DashboardSkeleton />;
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
  const weeklyActivity = data?.progressChart?.weeklyActivity ?? [];
  const byStatus = data?.progressChart?.byStatus ?? [];
  const activeCount = stats?.lessonsActiveCount ?? stats?.lessonsInProgress ?? 0;
  const lockedCount = stats?.lessonsLocked ?? 0;
  const totalLessons = stats?.lessonsTotal ?? courseTotal;
  const statusTotal = byStatus.reduce((sum, item) => sum + item.value, 0);
  const completionPercent = totalLessons > 0 ? Math.round((courseCompleted / totalLessons) * 100) : coursePercent;
  const achievementList = [
    {
      icon: Flame,
      title: 'Streak Starter',
      desc: 'Duy trì ít nhất 3 ngày học liên tiếp.',
      unlocked: (stats?.currentStreak ?? 0) >= 3,
      accent: 'bg-secondary',
    },
    {
      icon: Trophy,
      title: 'Lesson Finisher',
      desc: 'Hoàn thành 5 bài học đầu tiên.',
      unlocked: courseCompleted >= 5,
      accent: 'bg-tertiary',
    },
    {
      icon: Award,
      title: 'JLPT Focus',
      desc: `Có mục tiêu rõ ràng ở cấp ${goalLevel}.`,
      unlocked: Boolean(goalLevel),
      accent: 'bg-quaternary',
    },
    {
      icon: CalendarCheck,
      title: 'Consistency Builder',
      desc: 'Có hoạt động học trong các tuần gần đây.',
      unlocked: weeklyActivity.some((item) => item.count > 0),
      accent: 'bg-brand-soft',
    },
  ];
  const recommendations = [
    {
      icon: BookOpen,
      title: focusCourse ? 'Tiếp tục khóa đang học' : 'Khám phá khóa học',
      desc: focusCourse
        ? `Còn ${remainingLessons} bài để hoàn thành ${focusCourse.jlptLevel}.`
        : 'Bắt đầu với khóa N5 để có lộ trình học rõ ràng.',
      to: continueHref,
      cta: focusCourse ? 'Học tiếp' : 'Xem khóa học',
      accent: 'bg-tertiary',
    },
    {
      icon: ClipboardCheck,
      title: 'Ôn tập thông minh',
      desc: data?.recentErrors?.length
        ? 'Bạn có lỗi sai gần đây. Quay lại ôn để biến lỗi thành điểm mạnh.'
        : 'Tạo phiên ôn tập để củng cố kanji, từ vựng và ngữ pháp.',
      to: data?.recentErrors?.length ? paths.student.mistakes : paths.student.notebookDefault,
      cta: 'Ôn tập ngay',
      accent: 'bg-secondary',
    },
    {
      icon: Lightbulb,
      title: 'Luyện thêm kỹ năng',
      desc: 'Thử AI Speaking hoặc mô phỏng JLPT để giữ động lực.',
      to: paths.student.aiSpeaking,
      cta: 'Luyện nói',
      accent: 'bg-quaternary',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <PageHero
        animate={false}
        className="mb-0"
        badge="Bảng học tập"
        badgeClassName="bg-quaternary text-quaternary-foreground"
        tone="quaternary"
        chips={['Tiến độ khóa', 'Streak', 'Gợi ý học']}
        title={`Xin chào, ${displayName}`}
        description="Mỗi bài hoàn thành là một sticker mới trên hành trình JLPT của bạn."
        aside={
          <div className="rounded-xl border border-border bg-brand-soft p-5 text-brand shadow-premium card-lift">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-brand/80">
              Tổng tiến độ
            </p>
            <p className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{completionPercent}%</p>
            <p className="mt-1 text-sm font-bold text-brand/80">
              {courseCompleted}/{totalLessons || courseTotal} bài đã hoàn thành
            </p>
          </div>
        }
      />

      <section className="relative overflow-hidden rounded-xl border border-border bg-surface-paper shadow-premium-hover">
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-border bg-secondary/70" />
        <div className="pointer-events-none absolute bottom-8 right-24 size-12 rotate-12 rounded-lg border border-border bg-tertiary" />
        <div className="pointer-events-none absolute bottom-6 right-8 size-8 rounded-full border border-border bg-quaternary" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <span className="inline-flex rounded-full border border-border bg-tertiary px-3 py-1 font-display text-xs font-extrabold text-tertiary-foreground shadow-premium card-lift">
                Tiếp tục học
              </span>
              <h2 className="font-display text-2xl font-extrabold leading-snug text-foreground md:text-4xl">
                {lessonTitle}
              </h2>

              {focusCourse ? (
                <div className="max-w-md space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted-foreground">Tiến độ khóa học</span>
                    <span className="font-display font-extrabold tabular-nums text-primary">{coursePercent}%</span>
                  </div>
                  <ProgressBar percent={coursePercent} />
                  <p className="text-sm font-medium text-muted-foreground">
                    {remainingLessons > 0
                      ? `Còn ${remainingLessons} bài chưa hoàn thành`
                      : 'Đã hoàn thành tất cả bài trong khóa này'}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">
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
        <SectionTitle eyebrow="KPI stickers" title="Hôm nay bạn đang tiến lên" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Flame}
            label="Ngày học liên tiếp"
            value={`${stats?.currentStreak ?? 0} ngày`}
            accent="bg-secondary/60"
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
            accent="bg-tertiary/60"
          />
          <StatCard
            icon={Target}
            label="Mục tiêu"
            value={`JLPT ${goalLevel}`}
            sub="Cấp độ đang theo đuổi"
            accent="bg-quaternary/60"
          />
          <StatCard
            icon={Sparkles}
            label="Đang mở"
            value={`${activeCount}`}
            sub={`${lockedCount} bài đang khóa`}
            accent="bg-primary/35"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <WeeklyActivity items={weeklyActivity} />
        <div className={cn(cardBase, 'relative overflow-hidden p-5 md:p-6')}>
          <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border bg-tertiary/45" />
          <SectionTitle eyebrow="Trạng thái" title="Bức tranh bài học" />
          <div className="mt-6 space-y-4">
            {byStatus.length ? (
              byStatus.map((item, index) => {
                const percent = statusTotal > 0 ? Math.round((item.value / statusTotal) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>{item.label}</span>
                      <span className="text-primary">{item.value}</span>
                    </div>
                    <ProgressBar
                      percent={percent}
                      className={cn(
                        index % 3 === 0 && 'bg-primary',
                        index % 3 === 1 && 'bg-secondary',
                        index % 3 === 2 && 'bg-quaternary',
                      )}
                    />
                  </div>
                );
              })
            ) : (
              <EmptyState
                embedded
                size="sm"
                tone="default"
                title="Chưa có trạng thái bài học"
                description="Hoàn thành bài học để xem biểu đồ trạng thái."
              />
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle eyebrow="Achievements" title="Huy hiệu động lực" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {achievementList.map((achievement) => (
            <AchievementBadge key={achievement.title} {...achievement} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle eyebrow="Active courses" title="Khóa học đang chạy" />
          <Link
            to={paths.learn.hub}
            className="text-sm font-bold text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            {...emptyStatePresets.dashboardCourses}
            action={
              <Link to={paths.learn.hub}>
                <Button>Khám phá khóa học</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.courseId}
                to={paths.learn.course(c.courseId)}
                className={cn(cardInteractive, 'block p-5 md:p-6')}
              >
                <div className="flex items-start gap-3">
                  <AppIcon icon={BookOpen} size="lg" className="bg-quaternary" />
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-0.5 font-display text-xs font-extrabold text-secondary-foreground shadow-premium card-lift">
                      {c.jlptLevel}
                    </span>
                    <h3 className="mt-3 line-clamp-2 font-display text-lg font-extrabold leading-snug text-foreground">
                      {c.title}
                    </h3>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted-foreground">Tiến độ</span>
                    <span className="font-display font-extrabold tabular-nums text-primary">{c.percent}%</span>
                  </div>
                  <ProgressBar percent={c.percent} />
                  <p className="text-sm font-medium text-muted-foreground">
                    {c.completed} / {c.total} bài học
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle eyebrow="Recommendations" title="Gợi ý tiếp theo" />
        <div className="grid gap-4 lg:grid-cols-3">
          {recommendations.map((item) => (
            <Link key={item.title} to={item.to} className={cn(cardInteractive, 'relative overflow-hidden p-5')}>
              <div className={cn('pointer-events-none absolute -right-6 -top-6 size-20 rounded-full border border-border', item.accent)} />
              <AppIcon icon={item.icon} size="lg" className={item.accent} />
              <h3 className="mt-5 font-display text-xl font-extrabold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{item.desc}</p>
              <span className="mt-5 inline-flex items-center gap-2 font-display text-sm font-extrabold text-primary">
                {item.cta}
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
