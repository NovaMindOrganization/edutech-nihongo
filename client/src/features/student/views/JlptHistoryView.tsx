import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { toast } from 'sonner';

import { PageShell } from '@/components/usable/page-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { getJlptHistory, type JlptHistoryItem } from '../services/studentApi';

export function JlptHistoryView() {
  const [items, setItems] = useState<JlptHistoryItem[]>([]);

  useEffect(() => {
    getJlptHistory()
      .then(setItems)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải lịch sử'));
  }, []);

  return (
    <PageShell
      eyebrow="Luyện đề"
      title="Lịch sử thi JLPT"
      description="Xem lại các lần thi thử JLPT và điểm số của bạn."
      icon={History}
      iconClassName="bg-tertiary"
      tone="quaternary"
      chips={['Điểm tổng', 'Theo cấp độ', 'Lịch sử nộp bài']}
      footer="Điểm và thời gian nộp được lưu sau mỗi lần hoàn thành đề thi thử."
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có lần thi nào.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div>
                  <Badge className="mb-1">{item.level ?? 'JLPT'}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {item.submittedAt
                      ? new Date(item.submittedAt).toLocaleString('vi-VN')
                      : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {item.score?.total ?? '—'}
                  </p>
                  {item.isAutoSubmitted && (
                    <p className="text-xs text-muted-foreground">Tự động nộp (hết giờ)</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
