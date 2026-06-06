import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';

import type { KanjiItem } from '../../types/kanji.types';

type KanjiCardProps = {
  kanji: KanjiItem;
  learned?: boolean;
  onClick: () => void;
};

export function KanjiCard({ kanji, learned = false, onClick }: KanjiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-3 py-6',
        'shadow-sm transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        learned && 'border-emerald-100 bg-emerald-50/40',
      )}
    >
      {learned && (
        <span
          className="absolute top-2.5 right-2.5 inline-flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
          aria-hidden
        >
          <Check className="size-3.5 stroke-[3]" />
        </span>
      )}

      <span className="font-jp text-4xl font-bold leading-none text-foreground sm:text-5xl">
        {kanji.character}
      </span>
      <span className="mt-2 line-clamp-2 text-center text-sm text-gray-500">
        {kanji.hanVietPronunciation ?? kanji.meaning}
      </span>
    </button>
  );
}
