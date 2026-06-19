import { Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type FlashcardControlsProps = {
  flipped: boolean;
  onLearning: () => void;
  onMastered: () => void;
};

export function FlashcardControls({ flipped, onLearning, onMastered }: FlashcardControlsProps) {
  if (!flipped) {
    return (
      <p className="mx-auto max-w-2xl px-2 text-center text-sm text-muted-foreground">
        Nhấn thẻ hoặc <kbd className="rounded-lg border border-border bg-surface-paper px-1.5 py-0.5 text-xs font-bold shadow-premium card-lift">Space</kbd>{' '}
        để xem đáp án · <kbd className="rounded-lg border border-border bg-surface-paper px-1.5 py-0.5 text-xs font-bold shadow-premium card-lift">A</kbd>{' '}
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
          'flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border px-3 py-3 sm:min-h-[56px]',
          'border-border bg-secondary/20 font-display font-extrabold text-foreground shadow-premium card-lift',
          'transition-all active:scale-[0.97] hover:-translate-y-0.5 hover:bg-secondary/30 hover:shadow-premium card-lift',
        )}
      >
        <X className="size-6 stroke-[2.5] sm:size-7" />
        <span className="text-sm sm:text-base">Chưa thuộc</span>
      </button>
      <button
        type="button"
        onClick={onMastered}
        className={cn(
          'flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border px-3 py-3 sm:min-h-[56px]',
          'border-border bg-quaternary/25 font-display font-extrabold text-foreground shadow-premium card-lift',
          'transition-all active:scale-[0.97] hover:-translate-y-0.5 hover:bg-quaternary/35 hover:shadow-premium card-lift',
        )}
      >
        <Check className="size-6 stroke-[2.5] sm:size-7" />
        <span className="text-sm sm:text-base">Đã thuộc</span>
      </button>
    </div>
  );
}
