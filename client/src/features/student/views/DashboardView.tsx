import { motion } from 'framer-motion';
import { Flame, BookOpen, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth';
import { getDashboard } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

function ProgressBars({
  data,
}: {
  data: Array<{ label: string; title?: string; percent: number; completed: number; total: number }>;
}) {
  const max = Math.max(...data.map((d) => d.percent), 1);
  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.label + (row.title ?? '')}>
          <div className="mb-1 flex justify-between text-xs">
            <span>{row.title ?? row.label}</span>
            <span className="text-muted-foreground">
              {row.completed}/{row.total} ({row.percent}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(row.percent / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
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
    return <p className="text-muted-foreground">Đang tải tổng quan...</p>;
  }

  const chart = data?.progressChart;
  const statusMax = Math.max(...(chart?.byStatus.map((s) => s.value) ?? [1]), 1);

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-display text-sm tracking-widest text-primary uppercase">Dashboard</p>
        <h1 className="font-display mt-2 text-3xl font-bold">
          Xin chào{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="flex items-center gap-4 pt-6">
            <Flame className="size-10 text-primary" />
            <div>
              <p className="text-2xl font-bold">{data?.stats.currentStreak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Ngày streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <RotateCcw className="size-10 text-accent" />
            <div>
              <p className="text-2xl font-bold">{data?.stats.lessonsCompleted ?? 0}</p>
              <p className="text-xs text-muted-foreground">Tiết đã hoàn thành</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <BookOpen className="size-10 text-primary/70" />
            <div>
              <p className="text-sm font-medium">{data?.stats.lessonsActive ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Tiết đang học</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ theo khóa</CardTitle>
          </CardHeader>
          <CardContent>
            {(chart?.byCourse.length ?? 0) > 0 ? (
              <ProgressBars
                data={(chart?.byCourse ?? []).map((c) => ({
                  label: c.courseId,
                  title: `${c.jlptLevel} — ${c.title}`,
                  percent: c.percent,
                  completed: c.completed,
                  total: c.total,
                }))}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Chưa ghi danh khóa nào.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái tiết học</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-3 h-32">
            {(chart?.byStatus ?? []).map((s) => (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${(s.value / statusMax) * 100}%`, minHeight: s.value ? 8 : 2 }}
                />
                <span className="text-xs capitalize text-muted-foreground">{s.label}</span>
                <span className="text-sm font-medium">{s.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Khóa đang học</CardTitle>
          <Link to={paths.learn.hub}>
            <Button variant="outline" size="sm">
              Tất cả khóa
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.enrollments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <Link to={paths.learn.hub} className="text-primary hover:underline">
                Chọn khóa N5
              </Link>
            </p>
          ) : (
            data?.enrollments.map((e) => (
              <Link
                key={e.course.id}
                to={paths.learn.course(e.course.id)}
                className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <div>
                  <Badge className="mb-1">{e.course.jlptLevel}</Badge>
                  <p className="font-medium">{e.course.title}</p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={paths.student.review}>
          <Button>Ôn tập</Button>
        </Link>
        <Link to={paths.student.practice}>
          <Button variant="outline">Luyện đề</Button>
        </Link>
      </div>
    </div>
  );
}
