import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { KanjiItem } from '../../types/kanji.types';
import { KanjiDetailPanel } from './KanjiDetailPanel';
import { KanjiDrawingBoard } from './KanjiDrawingBoard';
import { KanjiInfoPanel } from './KanjiInfoPanel';
import { KanjiMnemonicPanel } from './KanjiMnemonicPanel';

type KanjiPracticeViewProps = {
  kanji: KanjiItem;
  learned?: boolean;
  currentIndex?: number;
  totalCount?: number;
  nextKanji?: KanjiItem | null;
  onBack: () => void;
  onNext?: () => void;
  onPracticeComplete?: () => void;
};

const columnClass = 'min-w-0 bg-amber-50 p-6 lg:p-8';

export function KanjiPracticeView({
  kanji,
  learned = false,
  currentIndex,
  totalCount,
  nextKanji,
  onBack,
  onNext,
  onPracticeComplete,
}: KanjiPracticeViewProps) {
  const showProgress =
    currentIndex != null && totalCount != null && totalCount > 0;

  return (
    <div className="-mx-4 bg-slate-50 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto w-full max-w-screen-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 gap-1.5 bg-white/80 text-base shadow-sm"
              onClick={onBack}
            >
              <ArrowLeft className="size-5" />
              Quay lại
            </Button>
            {learned && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                <CheckCircle2 className="size-4" />
                Đã luyện xong
              </span>
            )}
          </div>
          {showProgress && (
            <p className="rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium tabular-nums text-muted-foreground shadow-sm">
              {currentIndex} / {totalCount}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl bg-amber-50 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <section className={columnClass}>
              <KanjiInfoPanel key={`info-${kanji.id}`} kanji={kanji} />
            </section>

            <section
              className={`${columnClass} flex flex-col items-center justify-center lg:min-h-[480px]`}
            >
              <KanjiDrawingBoard
                key={`board-${kanji.id}`}
                character={kanji.character}
                onPracticeComplete={onPracticeComplete}
              />
              <KanjiDetailPanel
                key={`detail-${kanji.id}`}
                kanji={kanji}
                className="mt-6 max-w-[320px]"
              />
            </section>

            <section className={`${columnClass} lg:col-span-2 xl:col-span-1`}>
              <KanjiMnemonicPanel
                key={`mnemonic-${kanji.id}`}
                kanji={kanji}
                nextKanji={nextKanji}
                onNext={onNext}
                className="h-full"
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
