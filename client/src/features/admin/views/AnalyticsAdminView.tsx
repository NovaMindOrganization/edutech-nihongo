import {
  Activity,
  BarChart3,
  Bot,
  CircleDollarSign,
  Filter,
  GraduationCap,
  RefreshCcw,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { getAnalytics, type AdminAnalytics } from '../services/systemAdminApi';

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

type CompletionRow = AdminAnalytics['completionRates'][number];
type HealthFilter = 'all' | 'healthy' | 'needs-attention';

function averageCompletion(rows: CompletionRow[]) {
  if (rows.length === 0) return 0;
  return Math.round(rows.reduce((sum, row) => sum + row.completionPercent, 0) / rows.length);
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function KpiCard({
  title,
  value,
  detail,
  icon,
  accent,
  priority = false,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
  priority?: boolean;
}) {
  return (
    <Card className={cn('overflow-hidden bg-surface-paper', priority && 'shadow-premium card-lift')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">{title}</p>
            <p className={cn('mt-3 font-display font-extrabold tracking-tight text-foreground', priority ? 'text-4xl' : 'text-3xl')}>
              {value}
            </p>
          </div>
          <AppIcon icon={icon} size={priority ? 'lg' : 'md'} className={accent} />
        </div>
        <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function CompletionBar({ row }: { row: CompletionRow }) {
  const percent = clampPercent(row.completionPercent);
  return (
    <div className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-surface-paper text-muted-foreground">
              {row.jlptLevel}
            </Badge>
            <p className="font-display text-sm font-extrabold text-foreground">{row.title}</p>
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {formatNumber(row.enrolled ?? 0)} learners enrolled
          </p>
        </div>
        <p className="font-display text-lg font-black text-foreground">{percent}%</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-border bg-muted">
        <div
          className={cn(
            'h-full rounded-full',
            percent >= 70 ? 'bg-quaternary' : percent >= 40 ? 'bg-tertiary' : 'bg-secondary',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function AnalyticsAdminView() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [levelFilter, setLevelFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải analytics'));
  }, []);

  const levelOptions = useMemo(() => {
    if (!data) return ['all'];
    return ['all', ...Array.from(new Set(data.completionRates.map((row) => row.jlptLevel)))];
  }, [data]);

  const filteredCompletionRates = useMemo(() => {
    if (!data) return [];
    return data.completionRates.filter((row) => {
      const matchesLevel = levelFilter === 'all' || row.jlptLevel === levelFilter;
      const matchesHealth =
        healthFilter === 'all' ||
        (healthFilter === 'healthy' ? row.completionPercent >= 60 : row.completionPercent < 60);
      return matchesLevel && matchesHealth;
    });
  }, [data, healthFilter, levelFilter]);

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-surface-paper p-6 shadow-premium card-lift">
        <p className="text-sm font-semibold text-muted-foreground">Đang tải analytics…</p>
      </div>
    );
  }

  const averageCompletionPercent = averageCompletion(data.completionRates);
  const filteredAverageCompletionPercent = averageCompletion(filteredCompletionRates);
  const retentionSignal = clampPercent(Math.round((averageCompletionPercent + Math.min(data.examSessionsCompleted, 100)) / 2));
  const stuckLearners = data.difficultLessons.reduce((sum, row) => sum + row.stuckCount, 0);
  const revenueFromLast30Days =
    data.revenue.totalPaid > 0 ? Math.round((data.revenue.last30Days / data.revenue.totalPaid) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface-paper p-6 shadow-premium card-lift">
        <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full border border-border bg-primary/5" />
        <div className="pointer-events-none absolute bottom-8 right-20 hidden size-8 rotate-12 rounded-xl border border-border bg-tertiary/60 md:block" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AppIcon icon={BarChart3} size="lg" active />
            <div>
              <Badge variant="outline" className="bg-surface-paper text-muted-foreground">
                Analytics dashboard
              </Badge>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Growth and learning health
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-muted-foreground">
                Đọc nhanh DAU, revenue, retention signal, course completion và các vùng cần instrument thêm cho AI usage.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm shadow-premium card-lift">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Data window
            </p>
            <p className="mt-1 font-bold text-foreground">Current endpoint · 30-day revenue</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="DAU"
          value={formatNumber(data.dau)}
          detail="Active user signal from current admin analytics endpoint."
          icon={Users}
          accent="bg-quaternary"
          priority
        />
        <KpiCard
          title="Revenue"
          value={formatVnd(data.revenue.totalPaid)}
          detail={`${formatVnd(data.revenue.last30Days)} in last 30 days · ${formatNumber(data.revenue.orderCount)} paid orders.`}
          icon={CircleDollarSign}
          accent="bg-tertiary"
          priority
        />
        <KpiCard
          title="Retention"
          value={`${retentionSignal}%`}
          detail="Proxy signal from average course completion and completed JLPT sessions."
          icon={TrendingUp}
          accent="bg-brand-soft"
        />
        <KpiCard
          title="AI Usage"
          value="Ready"
          detail="Dashboard slot prepared; backend still needs AI event metrics for exact usage."
          icon={Bot}
          accent="bg-secondary"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden bg-surface-paper">
          <CardHeader className="border-b border-border bg-muted">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AppIcon icon={Filter} size="md" active />
                <div>
                  <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    Filtering
                  </p>
                  <CardTitle className="text-xl text-foreground">Course completion filters</CardTitle>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLevelFilter('all');
                  setHealthFilter('all');
                }}
              >
                <RefreshCcw className="size-4" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={levelFilter === level ? 'default' : 'outline'}
                  onClick={() => setLevelFilter(level)}
                >
                  {level === 'all' ? 'All JLPT' : level}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All courses' },
                { value: 'healthy', label: 'Healthy >= 60%' },
                { value: 'needs-attention', label: 'Needs attention < 60%' },
              ].map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={healthFilter === option.value ? 'default' : 'outline'}
                  onClick={() => setHealthFilter(option.value as HealthFilter)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-paper">
          <CardContent className="p-5">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Filtered average
            </p>
            <p className="mt-3 font-display text-4xl font-black text-foreground">
              {filteredAverageCompletionPercent}%
            </p>
            <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
              {filteredCompletionRates.length} courses shown · overall average {averageCompletionPercent}%.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden bg-surface-paper">
          <CardHeader className="border-b border-border bg-muted">
            <div className="flex items-center gap-3">
              <AppIcon icon={GraduationCap} size="md" active />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Course completion
                </p>
                <CardTitle className="text-xl text-foreground">Completion chart</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {filteredCompletionRates.length === 0 ? (
              <p className="rounded-xl border border-border bg-muted p-6 text-center text-sm font-medium text-muted-foreground shadow-premium card-lift">
                Không có khóa học phù hợp với filter hiện tại.
              </p>
            ) : (
              filteredCompletionRates.map((row) => <CompletionBar key={row.courseId} row={row} />)
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-surface-paper">
          <CardHeader className="border-b border-border bg-muted">
            <div className="flex items-center gap-3">
              <AppIcon icon={Activity} size="md" className="bg-secondary" />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Retention risk
                </p>
                <CardTitle className="text-xl text-foreground">Lessons needing attention</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="rounded-xl border border-border bg-muted p-4 shadow-premium card-lift">
              <p className="font-display text-3xl font-black text-foreground">{formatNumber(stuckLearners)}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">stuck learner signals across difficult lessons</p>
            </div>
            {data.difficultLessons.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface-paper p-4 text-sm font-medium text-muted-foreground shadow-premium card-lift">
                Chưa có lesson risk từ MiniTest.
              </p>
            ) : (
              data.difficultLessons.map((row) => (
                <div key={row.lessonId} className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-sm font-extrabold text-foreground">
                        {row.lesson
                          ? `${row.lesson.course.jlptLevel} · Bài ${row.lesson.orderIndex}: ${row.lesson.title}`
                          : row.lessonId}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {formatNumber(row.stuckCount)} học viên cần hỗ trợ
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-surface-paper text-muted-foreground">
                      TB {row.avgMiniTestScore ?? '—'}%
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden bg-surface-paper">
          <CardHeader className="border-b border-border bg-muted">
            <div className="flex items-center gap-3">
              <AppIcon icon={CircleDollarSign} size="md" className="bg-tertiary" />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Revenue
                </p>
                <CardTitle className="text-xl text-foreground">Revenue breakdown</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted p-4 shadow-premium card-lift">
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Total paid</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{formatVnd(data.revenue.totalPaid)}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted p-4 shadow-premium card-lift">
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Last 30 days</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{formatVnd(data.revenue.last30Days)}</p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm font-bold text-muted-foreground">
                <span>30-day contribution</span>
                <span>{revenueFromLast30Days}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-border bg-muted">
                <div className="h-full rounded-full bg-tertiary" style={{ width: `${clampPercent(revenueFromLast30Days)}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-surface-paper">
          <CardHeader className="border-b border-border bg-muted">
            <div className="flex items-center gap-3">
              <AppIcon icon={Bot} size="md" className="bg-secondary" />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  AI usage
                </p>
                <CardTitle className="text-xl text-foreground">AI instrumentation status</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {[
              'Track AI speaking sessions and correction requests.',
              'Track OCR analysis requests, success rate, and processing time.',
              'Track LLM provider errors, latency, and token/cost estimates.',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-muted p-4 text-sm font-medium leading-6 text-muted-foreground shadow-premium card-lift">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
