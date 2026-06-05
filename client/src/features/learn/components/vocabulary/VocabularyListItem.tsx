import { Check, Star, Volume2 } from 'lucide-react';

import { cn } from '@/utils/cn';

import type { LessonVocabularyItem } from '../../services/vocabularyApi';

const iconBtnClass =
  'flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-muted/80 active:bg-muted';

type VocabularyListItemProps = {
  item: LessonVocabularyItem;
  speaking: boolean;
  onPlayAudio: () => void;
  onToggleStar: () => void;
};

export function VocabularyListItem({
  item,
  speaking,
  onPlayAudio,
  onToggleStar,
}: VocabularyListItemProps) {
  const mastered = item.progress?.status === 'mastered';
  const starred = item.progress?.isStarred ?? false;
  const showReading = Boolean(item.reading && item.reading !== item.word);

  return (
    <article
      className={cn(
        'rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all',
        'hover:border-primary/25 hover:shadow-md',
        mastered && 'border-emerald-500/20 bg-emerald-50/50 opacity-80 dark:bg-emerald-950/20',
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 sm:max-w-[38%]">
          <p className="font-jp truncate text-xl font-bold text-foreground sm:text-2xl">
            {item.word}
          </p>
          {showReading && (
            <p className="font-jp mt-0.5 truncate text-sm text-muted-foreground sm:text-base">
              {item.reading}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-[1.4] items-center gap-2">
          <p
            className={cn(
              'line-clamp-2 text-sm leading-snug text-foreground/90 sm:text-base',
              mastered && 'text-muted-foreground',
            )}
          >
            {item.meaning}
          </p>
          {mastered && (
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-500/15 p-1 text-emerald-600 dark:text-emerald-400"
              title="Đã thuộc"
            >
              <Check className="size-4 stroke-[2.5]" aria-hidden />
              <span className="sr-only">Đã thuộc</span>
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            className={iconBtnClass}
            disabled={speaking}
            aria-label={`Phát âm ${item.word}`}
            onClick={onPlayAudio}
          >
            <Volume2 className="size-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            className={iconBtnClass}
            aria-label={starred ? 'Bỏ gắn sao' : 'Gắn sao'}
            aria-pressed={starred}
            onClick={onToggleStar}
          >
            <Star
              className={cn(
                'size-5',
                starred ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/70',
              )}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
