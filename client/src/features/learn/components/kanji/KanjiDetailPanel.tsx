import { cn } from '@/lib/utils';

import type { KanjiItem } from '../../types/kanji.types';

type KanjiDetailPanelProps = {
  kanji: KanjiItem;
  className?: string;
};

export function KanjiDetailPanel({ kanji, className }: KanjiDetailPanelProps) {
  if (kanji.strokeCount == null && !kanji.radical) return null;

  return (
    <div className={cn('w-full rounded-xl border border-border bg-amber-200/90 p-4 shadow-premium card-lift', className)}>
      <p className="mb-3 text-center font-display text-sm font-extrabold uppercase tracking-wide text-amber-900/80">
        Chi tiết chữ
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-base text-amber-950/90">
        {kanji.strokeCount != null && (
          <span className="rounded-lg border border-border bg-surface-paper px-4 py-2 shadow-premium card-lift">
            Số nét:{' '}
            <span className="font-semibold text-foreground">{kanji.strokeCount}</span>
          </span>
        )}
        {kanji.radical && (
          <span className="rounded-lg border border-border bg-surface-paper px-4 py-2 shadow-premium card-lift">
            Bộ thủ:{' '}
            <span className="font-jp text-xl font-semibold text-foreground">{kanji.radical}</span>
          </span>
        )}
      </div>
    </div>
  );
}
