import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateReview } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

type ReviewType = 'kanji' | 'vocabulary' | 'grammar';

const titles: Record<ReviewType, string> = {
  kanji: 'Kanji',
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
};

export function ReviewByTypeView({ type }: { type: ReviewType }) {
  const [items, setItems] = useState<
    Array<{ id: string; front: string; back: string; reading?: string }>
  >([]);
  const [idx, setIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);

  async function start() {
    try {
      const res = await generateReview('flashcard', 15, type);
      setItems(res.items);
      setIdx(0);
      setShowBack(false);
      if (res.items.length === 0) toast.message('Hoàn thành thêm bài học để ôn tập');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  const current = items[idx];

  return (
    <div className="mx-auto max-w-lg">
      <Link to={paths.student.review} className="text-sm text-primary hover:underline">
        ← Ôn tập
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">Ôn {titles[type]}</h1>
      <Button className="mt-4" onClick={start}>
        Bắt đầu
      </Button>
      {current && (
        <Card className="mt-6">
          <CardContent className="pt-6 text-center">
            <p className="font-jp text-3xl font-bold">{current.front}</p>
            {current.reading && <p className="text-primary/80">{current.reading}</p>}
            {showBack && <p className="mt-4 text-lg">{current.back}</p>}
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setShowBack(!showBack)}>
                {showBack ? 'Ẩn' : 'Xem'} đáp án
              </Button>
              <Button
                onClick={() => {
                  setShowBack(false);
                  setIdx((i) => Math.min(i + 1, items.length - 1));
                }}
              >
                Tiếp
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {idx + 1} / {items.length}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
