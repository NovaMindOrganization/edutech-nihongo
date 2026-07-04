import { Check, PenTool } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AddToNotebookButton } from '@/features/student/notebook/AddToNotebookButton';

import { cn } from '@/lib/utils';

import type { KanjiItem } from '../../types/kanji.types';

type KanjiCardProps = {
  kanji: KanjiItem;
  lessonId?: string;
  learned?: boolean;
  onClick: () => void;
};

export function KanjiCard({ kanji, lessonId, learned = false, onClick }: KanjiCardProps) {
  const onReading = kanji.readingsOn[0];
  const kunReading = kanji.readingsKun[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex min-h-[260px] w-full flex-col rounded-xl border border-border bg-surface-paper p-4 text-left',
        'shadow-premium card-lift transition-all duration-200',
        'hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-premium card-lift',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        learned && 'bg-emerald-50/70',
      )}
    >
      {learned && (
        <span
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-xl border border-border bg-quaternary text-quaternary-foreground shadow-premium card-lift"
          aria-hidden
        >
          <Check className="size-3.5 stroke-[3]" />
        </span>
      )}
      {lessonId && (
        <span className="absolute left-3 top-3" onClick={(e) => e.stopPropagation()}>
          <AddToNotebookButton
            itemId={kanji.id}
            itemType="kanji"
            lessonId={lessonId}
            itemLabel={kanji.character}
            compact
          />
        </span>
      )}

      <div className="flex items-center gap-2">
        <Badge className="bg-amber-200 text-amber-950">{kanji.jlptLevel}</Badge>
        {kanji.strokeCount != null && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-premium card-lift">
            <PenTool className="size-3.5" />
            {kanji.strokeCount} nét
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center">
        <span className="font-jp text-6xl font-black leading-none text-foreground sm:text-8xl">
          {kanji.character}
        </span>
        {kanji.hanVietPronunciation && (
          <span className="mt-3 font-display text-lg font-extrabold text-muted-foreground">
            {kanji.hanVietPronunciation}
          </span>
        )}
        <span className="mt-1 line-clamp-2 text-base font-bold leading-snug text-foreground/80">
          {kanji.meaning}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs font-bold text-muted-foreground">
        <div className="rounded-2xl border border-dashed border-border bg-red-50 px-3 py-2 text-red-900/80">
          On: <span className="font-jp text-red-700">{onReading ?? '—'}</span>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-blue-50 px-3 py-2 text-blue-900/80">
          Kun: <span className="font-jp text-blue-700">{kunReading ?? '—'}</span>
        </div>
        {kanji.radical && (
          <div className="rounded-2xl border border-dashed border-border bg-amber-50 px-3 py-2 text-amber-900/80">
            Bộ thủ: <span className="font-jp text-base text-foreground">{kanji.radical}</span>
          </div>
        )}
      </div>
    </button>
  );
}
