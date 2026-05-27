import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { getCourseKanji } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { kanjiMemoryImageAssetUrl } from '@/services/httpClient';

export function KanjiCourseView() {
  const { courseId = '' } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getCourseKanji>> | null>(null);

  useEffect(() => {
    getCourseKanji(courseId)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, [courseId]);

  return (
    <div>
      <Link to={paths.learn.kanjiHub} className="text-sm text-primary hover:underline">
        ← Kanji
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">
        Kanji — {data?.course.title ?? '…'}
      </h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(data?.kanji ?? []).map((k) => (
          <Card key={k.id}>
            <CardContent className="pt-6 text-center">
              <p className="font-jp text-3xl font-bold">{k.character}</p>
              <p className="mt-1 text-sm">{k.meaning}</p>
              {k.memoryImageUrl && (
                <img
                  src={kanjiMemoryImageAssetUrl(k.id)}
                  alt={`Memoric ${k.character}`}
                  className="mx-auto mt-2 h-20 w-40 rounded object-contain border border-border/60 bg-muted/20 p-1"
                />
              )}
              {k.radical && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Bộ thủ: <span className="font-jp text-base">{k.radical}</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
