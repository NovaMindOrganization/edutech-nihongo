import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageGrid, PageShell } from '@/components/usable/page-shell';
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
    <PageShell
      eyebrow="Học → Kanji"
      title="Kanji"
      description="Học kanji theo khóa đang ghi danh hoặc sổ tay cá nhân."
    >
      <PageGrid cols="wide">
        {enrollments.map((e) => (
          <Link key={e.course.id} to={paths.learn.kanjiCourse(e.course.id)} className="block h-full">
            <Card className="h-full transition-colors hover:border-primary/40">
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
        <Link to={paths.learn.kanjiHandbook} className="block h-full">
          <Card className="h-full border-accent/30 transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle>Sổ tay kanji</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Kanji đã thêm vào sổ tay cá nhân
            </CardContent>
          </Card>
        </Link>
      </PageGrid>
      {enrollments.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to={paths.learn.hub} className="text-primary hover:underline">
            Ghi danh khóa
          </Link>{' '}
          để xem kanji theo lộ trình.
        </p>
      )}
    </PageShell>
  );
}
