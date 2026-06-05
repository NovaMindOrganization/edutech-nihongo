import { Check, X } from 'lucide-react';

import { cn } from '@/utils/cn';

type FlashcardControlsProps = {
  flipped: boolean;
  onLearning: () => void;
  onMastered: () => void;
};

export function FlashcardControls({ flipped, onLearning, onMastered }: FlashcardControlsProps) {
  if (!flipped) {
    return (
      <p className="mx-auto max-w-2xl px-2 text-center text-sm text-muted-foreground">
        Nhấn thẻ hoặc <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Space</kbd>{' '}
        để xem đáp án · <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">A</kbd>{' '}
        nghe
      </p>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 px-1 sm:gap-4">
      <button
        type="button"
        onClick={onLearning}
        className={cn(
          'flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-3 py-3 sm:min-h-[56px]',
          'border-orange-400/60 bg-orange-50 font-bold text-orange-800 shadow-md',
          'transition-transform active:scale-[0.97] hover:bg-orange-100/90',
          'dark:bg-orange-950/40 dark:text-orange-200 dark:hover:bg-orange-950/60',
        )}
      >
        <X className="size-6 stroke-[2.5] sm:size-7" />
        <span className="text-sm sm:text-base">Chưa thuộc</span>
      </button>
      <button
        type="button"
        onClick={onMastered}
        className={cn(
          'flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-3 py-3 sm:min-h-[56px]',
          'border-emerald-400/60 bg-emerald-50 font-bold text-emerald-900 shadow-md',
          'transition-transform active:scale-[0.97] hover:bg-emerald-100/90',
          'dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/60',
        )}
      >
        <Check className="size-6 stroke-[2.5] sm:size-7" />
        <span className="text-sm sm:text-base">Đã thuộc</span>
      </button>
    </div>
  );
}
