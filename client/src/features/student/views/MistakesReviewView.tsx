import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageShell } from '@/components/usable/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/router/paths';

import { getMistakes, type MistakeRow } from '../services/studentApi';

export function MistakesReviewView() {
  const [items, setItems] = useState<MistakeRow[]>([]);

  useEffect(() => {
    getMistakes()
      .then(setItems)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải lỗi'));
  }, []);

  return (
    <PageShell
      eyebrow="Ôn tập"
      title="Lỗi hay mắc"
      description="Tổng hợp từ MiniTest, ôn tập và AI."
    >
      <Link to={paths.student.review}>
        <Button className="mb-4">Ôn tập ngay</Button>
      </Link>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa ghi nhận lỗi nào.</p>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <Card key={m.id}>
              <CardContent className="space-y-1 py-4 text-sm">
                <p className="text-xs uppercase text-muted-foreground">{m.source}</p>
                {m.lesson && (
                  <p className="font-medium">
                    {m.lesson.title} (Bài {m.lesson.orderIndex})
                  </p>
                )}
                <p>
                  <span className="text-destructive">Bạn: {m.userAnswer ?? '—'}</span>
                </p>
                <p>
                  <span className="text-emerald-600">Đúng: {m.correctAnswer ?? '—'}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString('vi-VN')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
