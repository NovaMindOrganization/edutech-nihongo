import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboard } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

export function KanjiHubView() {
  const [enrollments, setEnrollments] = useState<
    Array<{ course: { id: string; title: string; jlptLevel: string } }>
  >([]);

  useEffect(() => {
    getDashboard().then((d) => setEnrollments(d.enrollments));
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Kanji</h1>
      <p className="mt-2 text-sm text-muted-foreground">Học kanji theo khóa hoặc sổ tay cá nhân</p>
      <div className="mt-8 grid gap-4">
        {enrollments.map((e) => (
          <Link key={e.course.id} to={paths.learn.kanjiCourse(e.course.id)}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader className="flex-row items-center gap-2">
                <Badge>{e.course.jlptLevel}</Badge>
                <CardTitle className="text-base">Kanji {e.course.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Toàn bộ kanji từ các tiết đã mở
              </CardContent>
            </Card>
          </Link>
        ))}
        {enrollments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            <Link to={paths.learn.hub} className="text-primary hover:underline">
              Ghi danh khóa
            </Link>{' '}
            để xem kanji theo lộ trình.
          </p>
        )}
        <Link to={paths.learn.kanjiHandbook}>
          <Card className="transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle>Sổ tay kanji</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Kanji đã thêm vào sổ tay cá nhân
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
