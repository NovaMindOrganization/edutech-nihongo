import { BookMarked } from 'lucide-react';

import { AppIcon } from '@/components/usable/app-icon';
import { cn } from '@/lib/utils';

type VocabularyListOverviewProps = {
  lessonTitle: string;
  total: number;
  masteredCount: number;
  masteredPercent: number;
};

export function VocabularyListOverview({
  lessonTitle,
  total,
  masteredCount,
  masteredPercent,
}: VocabularyListOverviewProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface-paper p-5 shadow-premium card-lift">
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border bg-quaternary/35" />
      <div className="relative flex items-start gap-3">
        <AppIcon icon={BookMarked} size="lg" className="bg-quaternary" />
        <div className="min-w-0 flex-1">
        <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">Từ vựng bài học</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">{lessonTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> từ ·{' '}
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{masteredCount}</span>{' '}
          đã thuộc
        </p>
        </div>
      </div>

      <div className="relative mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">Tiến độ thuộc từ</span>
          <span className="font-display tabular-nums text-primary">{masteredPercent}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border border-border bg-muted">
          <div
            className={cn(
              'h-full rounded-full bg-quaternary transition-all duration-500',
            )}
            style={{ width: `${masteredPercent}%` }}
            role="progressbar"
            aria-valuenow={masteredPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${masteredPercent}% từ đã thuộc`}
          />
        </div>
      </div>
    </div>
  );
}
