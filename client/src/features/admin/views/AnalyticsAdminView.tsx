import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getAnalytics, type AdminAnalytics } from '../services/systemAdminApi';

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function AnalyticsAdminView() {
  const [data, setData] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải analytics'));
  }, []);

  if (!data) {
    return <p className="text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Thống kê hệ thống</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.dau}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ghi danh</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.enrollments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatVnd(data.revenue.totalPaid)}</p>
            <p className="text-xs text-muted-foreground">
              30 ngày: {formatVnd(data.revenue.last30Days)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bài thi JLPT hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.examSessionsCompleted}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tỷ lệ hoàn thành khóa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.completionRates.map((c) => (
            <div key={c.courseId}>
              <div className="mb-1 flex justify-between text-sm">
                <span>
                  {c.jlptLevel} — {c.title}
                </span>
                <span>{c.completionPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${c.completionPercent}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {data.difficultLessons.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bài khó (điểm MiniTest thấp)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.difficultLessons.map((row) => (
              <div key={row.lessonId} className="flex justify-between border-b border-border/50 py-2">
                <span>
                  {row.lesson
                    ? `${row.lesson.course.jlptLevel} · Bài ${row.lesson.orderIndex}: ${row.lesson.title}`
                    : row.lessonId}
                </span>
                <span className="text-muted-foreground">
                  TB {row.avgMiniTestScore ?? '—'}% · {row.stuckCount} học viên
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
