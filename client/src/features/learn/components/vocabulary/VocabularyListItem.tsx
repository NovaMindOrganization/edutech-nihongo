import { Check, Star, Volume2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AddToNotebookButton } from '@/features/student/notebook/AddToNotebookButton';
import { cn } from '@/lib/utils';

import type { LessonVocabularyItem } from '../../services/vocabularyApi';
import { getVocabDisplay } from './vocab-display';

const iconBtnClass =
  'flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface-paper shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-brand-soft active:translate-x-0 active:translate-y-0 disabled:opacity-50';

type VocabularyListItemProps = {
  item: LessonVocabularyItem;
  lessonId: string;
  speaking: boolean;
  highlighted?: boolean;
  onPlayAudio: () => void;
  onToggleStar: () => void;
};

export function VocabularyListItem({
  item,
  lessonId,
  speaking,
  highlighted = false,
  onPlayAudio,
  onToggleStar,
}: VocabularyListItemProps) {
  const mastered = item.progress?.status === 'mastered';
  const starred = item.progress?.isStarred ?? false;
  const example = item.exampleSentence?.trim() || item.exampleTranslation?.trim() || null;
  const exampleSub =
    item.exampleSentence && item.exampleTranslation ? item.exampleTranslation : null;
  const { primaryText, kanjiText, speechText } = getVocabDisplay(item);

  return (
    <article
      className={cn(
        'rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift transition-all',
        'hover:-translate-y-0.5 hover:shadow-premium card-lift',
        mastered && 'bg-quaternary/15',
        highlighted && 'ring-2 ring-brand ring-offset-2',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          {mastered ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1 bg-quaternary text-quaternary-foreground">
                <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                Đã thuộc
              </Badge>
            </div>
          ) : null}

          <div className={cn('grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start', mastered ? 'mt-3' : '')}>
            <div className="min-w-0">
              <p className="font-jp truncate text-2xl font-bold text-foreground sm:text-3xl">
                {primaryText}
              </p>
              {kanjiText ? (
                <p className="mt-1 truncate font-jp text-base font-medium text-muted-foreground sm:text-lg">
                  {kanjiText}
                </p>
              ) : null}
            </div>

            <div className="min-w-0">
              <p
                className={cn(
                  'text-base font-bold leading-snug text-foreground sm:text-lg',
                  mastered && 'text-muted-foreground',
                )}
              >
                {item.meaning}
              </p>
              {example && (
                <div className="mt-3 rounded-2xl border border-dashed border-border bg-background/75 p-3">
                  {item.exampleSentence && (
                    <p className="font-jp text-sm font-semibold leading-7 text-foreground sm:text-base">
                      {item.exampleSentence}
                    </p>
                  )}
                  {exampleSub && (
                    <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground sm:text-sm">
                      {exampleSub}
                    </p>
                  )}
                  {!item.exampleSentence && item.exampleTranslation && (
                    <p className="text-xs font-medium leading-5 text-muted-foreground sm:text-sm">
                      {item.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
              {item.memoryTip ? (
                <p className="mt-2 rounded-lg bg-muted/40 px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Cách ghi nhớ: </span>
                  {item.memoryTip}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
          <button
            type="button"
            className={iconBtnClass}
            disabled={speaking}
            aria-label={`Phát âm ${speechText}`}
            onClick={onPlayAudio}
          >
            <Volume2 className="size-5 text-foreground" />
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
                starred ? 'fill-tertiary text-foreground' : 'text-muted-foreground/70',
              )}
            />
          </button>
          <AddToNotebookButton
            itemId={item.id}
            itemType="vocabulary"
            lessonId={lessonId}
            itemLabel={item.word}
            compact
          />
        </div>
      </div>
    </article>
  );
}
