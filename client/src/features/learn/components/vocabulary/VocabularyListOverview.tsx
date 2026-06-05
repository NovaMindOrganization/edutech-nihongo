import { cn } from '@/utils/cn';

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
    <div className="space-y-4 rounded-2xl border border-border/60 bg-gradient-to-br from-card to-[var(--nc-cream)]/30 p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Từ vựng bài học</p>
        <h2 className="mt-1 font-display text-2xl font-bold leading-tight">{lessonTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> từ ·{' '}
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{masteredCount}</span>{' '}
          đã thuộc
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tiến độ thuộc từ</span>
          <span className="font-semibold tabular-nums text-foreground">{masteredPercent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500',
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
