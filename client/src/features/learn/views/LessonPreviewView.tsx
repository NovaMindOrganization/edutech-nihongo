import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPublicLessonPreview } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

export function LessonPreviewView() {
  const { lessonId = '' } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getPublicLessonPreview>> | null>(
    null,
  );

  useEffect(() => {
    getPublicLessonPreview(lessonId)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải preview'));
  }, [lessonId]);

  if (!data) {
    return <p className="text-muted-foreground">Đang tải preview…</p>;
  }

  return (
    <div className="w-full max-w-2xl">
      <Link
        to={paths.learn.course(data.course.id)}
        className="text-sm text-primary hover:underline"
      >
        ← {data.course.title}
      </Link>
      <Badge className="mt-4">{data.course.jlptLevel}</Badge>
      <h1 className="font-display mt-2 text-2xl font-bold">{data.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Xem trước nội dung — đăng nhập để học đầy đủ.
      </p>

      {data.vocabulary.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Từ vựng mẫu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.vocabulary.map((row, i) => {
              const v = row.vocabulary;
              const primary = v.reading ?? v.word;
              const kanji = v.reading ? v.word : null;
              return (
                <div key={i} className="border-b border-border/50 pb-2 last:border-0">
                  <p className="font-jp font-bold">{primary}</p>
                  {kanji && <p className="font-jp text-sm text-muted-foreground">{kanji}</p>}
                  <p className="text-sm">{v.meaning}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {data.grammar.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Ngữ pháp mẫu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.grammar.map((row, i) => (
              <div key={i}>
                <p className="font-medium">{row.grammar.title}</p>
                <p className="font-jp text-primary">{row.grammar.pattern}</p>
                <p className="text-sm text-muted-foreground">{row.grammar.meaningVi}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={paths.login}>
          <Button>Đăng nhập để học tiếp</Button>
        </Link>
        <Link to={paths.register}>
          <Button variant="outline">Đăng ký</Button>
        </Link>
      </div>
    </div>
  );
}
