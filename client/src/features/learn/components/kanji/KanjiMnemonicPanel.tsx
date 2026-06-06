import { cn } from '@/utils/cn';

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
      <h3 className="mb-4 text-lg font-bold text-amber-900">Mẹo ghi nhớ</h3>

      {!hasContent ? (
        <p className="text-center text-base text-amber-800/70">
          Chưa có hình liên tưởng hoặc mẹo cho chữ này.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {hasImage && (
            <div className="relative w-full overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
              {loading && (
                <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-amber-700/70">
                  Đang tải hình…
                </div>
              )}
              {!loading && failed && (
                <div className="flex aspect-[4/3] w-full items-center justify-center px-4 text-center text-sm text-amber-700/80">
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
            <div className="rounded-lg border border-amber-200 bg-amber-100/80 p-4">
              <p className="mb-2 text-sm font-semibold text-amber-900">Câu chuyện / Mẹo</p>
              <p className="text-base leading-relaxed text-amber-950/90">{kanji.memoryTip}</p>
            </div>
          )}
        </div>
      )}

      {nextKanji && onNext && (
        <div className="mt-auto flex w-full justify-end pt-6">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Tiếp theo
            <span className="font-jp text-lg font-bold">{nextKanji.character}</span>
          </button>
        </div>
      )}
    </div>
  );
}
