import { cn } from '@/lib/utils';

import { useKanjiMemoryImage } from '../../hooks/use-kanji-memory-image';
import type { KanjiItem } from '../../types/kanji.types';

type KanjiMnemonicPanelProps = {
  kanji: KanjiItem;
  nextKanji?: KanjiItem | null;
  onNext?: () => void;
  className?: string;
};

export function KanjiMnemonicPanel({
  kanji,
  nextKanji,
  onNext,
  className,
}: KanjiMnemonicPanelProps) {
  const { hasImage, resolvedSrc, loading, failed } = useKanjiMemoryImage(kanji);
  const hasTip = Boolean(kanji.memoryTip?.trim());
  const hasContent = hasImage || hasTip;

  return (
    <div className={cn('flex h-full min-h-[280px] flex-col', className)}>
      <h3 className="mb-4 font-display text-xl font-extrabold text-amber-900">Mẹo ghi nhớ</h3>

      {!hasContent ? (
        <p className="rounded-3xl border border-dashed border-border bg-amber-100/60 p-5 text-center text-base font-medium text-amber-800/70">
          Chưa có hình liên tưởng hoặc mẹo cho chữ này.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {hasImage && (
            <div className="relative w-full overflow-hidden rounded-xl border border-border bg-surface-paper shadow-premium card-lift">
              {loading && (
                <div className="flex aspect-[4/3] w-full items-center justify-center text-sm font-medium text-amber-700/70">
                  Đang tải hình…
                </div>
              )}
              {!loading && failed && (
                <div className="flex aspect-[4/3] w-full items-center justify-center px-4 text-center text-sm font-medium text-amber-700/80">
                  Không tải được hình liên tưởng.
                </div>
              )}
              {resolvedSrc && !loading && (
                <img
                  key={kanji.id}
                  src={resolvedSrc}
                  alt={`Hình liên tưởng chữ ${kanji.character}`}
                  className="w-full object-contain"
                />
              )}
            </div>
          )}

          {hasTip && (
            <div className="rounded-xl border border-border bg-amber-100/80 p-4 shadow-premium card-lift">
              <p className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-amber-900">
                Câu chuyện / Mẹo
              </p>
              <p className="text-base font-medium leading-7 text-amber-950/90">{kanji.memoryTip}</p>
            </div>
          )}
        </div>
      )}

      {nextKanji && onNext && (
        <div className="mt-auto flex w-full justify-end pt-6">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-brand-soft px-6 py-3 font-display text-base font-extrabold text-brand shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-brand-muted/40 hover:shadow-premium-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tiếp theo
            <span className="font-jp text-lg font-bold">{nextKanji.character}</span>
          </button>
        </div>
      )}
    </div>
  );
}
