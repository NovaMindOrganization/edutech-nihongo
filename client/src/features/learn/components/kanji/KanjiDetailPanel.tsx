import { cn } from '@/utils/cn';

import type { KanjiItem } from '../../types/kanji.types';

type KanjiDetailPanelProps = {
  kanji: KanjiItem;
  className?: string;
};

export function KanjiDetailPanel({ kanji, className }: KanjiDetailPanelProps) {
  if (kanji.strokeCount == null && !kanji.radical) return null;

  return (
    <div className={cn('w-full rounded-xl bg-amber-200/90 p-4', className)}>
      <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-amber-900/80">
        Chi tiết chữ
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-base text-amber-950/90">
        {kanji.strokeCount != null && (
          <span className="rounded-lg border border-amber-300 bg-white px-4 py-2 shadow-sm">
            Số nét:{' '}
            <span className="font-semibold text-gray-800">{kanji.strokeCount}</span>
          </span>
        )}
        {kanji.radical && (
          <span className="rounded-lg border border-amber-300 bg-white px-4 py-2 shadow-sm">
            Bộ thủ:{' '}
            <span className="font-jp text-xl font-semibold text-gray-800">{kanji.radical}</span>
          </span>
        )}
      </div>
    </div>
  );
}
