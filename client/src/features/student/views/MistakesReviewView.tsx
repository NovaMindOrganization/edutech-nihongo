import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, History, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageShell } from '@/components/usable/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

import { getMistakes, type MistakeRow } from '../services/studentApi';

const SOURCE_LABELS: Record<string, string> = {
  mini_test: 'MiniTest',
  review: 'Ôn tập',
  ai_speaking: 'Luyện nói AI',
  lesson_speaking: 'Nói trong bài',
  webrtc_eval: 'Gọi luyện nói',
};

function sourceLabel(source: string) {
  return SOURCE_LABELS[source] ?? source;
}

function isSpeakingSource(source: string) {
  return source === 'ai_speaking' || source === 'lesson_speaking' || source === 'webrtc_eval';
}

function MistakeCard({ row, index }: { row: MistakeRow; index: number }) {
  const speaking = isSpeakingSource(row.source);
  const question = row.questionText?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="overflow-hidden shadow-premium card-lift">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/40 px-4 py-3">
            <Badge variant="outline" className="border-primary/30 bg-background text-primary">
              {sourceLabel(row.source)}
            </Badge>
            {row.lesson && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="size-3.5 shrink-0" />
                {row.lesson.title} · Bài {row.lesson.orderIndex}
              </span>
            )}
            <time className="ml-auto text-xs text-muted-foreground">
              {new Date(row.createdAt).toLocaleString('vi-VN')}
            </time>
          </div>

          <div className="space-y-4 p-4 md:p-5">
            <div className="rounded-xl border-l-4 border-l-primary bg-primary/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
                {speaking ? 'Nội dung' : 'Câu hỏi'}
              </p>
              <p
                className={cn(
                  'mt-2 text-lg leading-relaxed',
                  speaking ? 'text-foreground' : 'font-jp font-medium text-foreground',
                )}
              >
                {question || '—'}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
                <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                    {speaking ? 'Bạn nói / viết' : 'Bạn chọn'}
                  </p>
                  <p className="mt-1.5 break-words text-base font-medium text-destructive">
                    {row.userAnswer?.trim() || '—'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {speaking ? 'Gợi ý sửa' : 'Đáp án đúng'}
                  </p>
                  <p className="mt-1.5 break-words text-base font-medium text-emerald-700 dark:text-emerald-400">
                    {row.correctAnswer?.trim() || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MistakesReviewView() {
  const [items, setItems] = useState<MistakeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMistakes()
      .then(setItems)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải lỗi'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      eyebrow="Theo dõi"
      title="Ôn lỗi sai"
      description="Xem lại câu hỏi, đáp án bạn chọn và đáp án đúng."
      icon={History}
      iconClassName="bg-secondary"
      tone="secondary"
      chips={['MiniTest', 'Luyện nói AI', 'Ôn tập']}
      footer="Lỗi được ghi tự động từ bài test, luyện nói và các phiên ôn — dùng để tránh lặp lại sai sót."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to={paths.student.notebookDefault}>
          <Button className="gap-2">
            Ôn tập ngay
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        {!loading && items.length > 0 && (
          <p className="text-sm text-muted-foreground">{items.length} lỗi gần đây</p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Chưa ghi nhận lỗi nào. Làm MiniTest hoặc ôn tập để hệ thống ghi nhận chỗ cần cải thiện.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((m, i) => (
            <MistakeCard key={m.id} row={m} index={i} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
