import { Star, Volume2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { LessonVocabularyItem } from '../../services/vocabularyApi';
import { FlipFlashcardFrame } from './FlipFlashcardFrame';

type FlashcardCardProps = {
  card: LessonVocabularyItem;
  flipped: boolean;
  slideDirection: 'left' | 'right' | null;
  cardKey: string;
  speaking: boolean;
  starred: boolean;
  onFlip: () => void;
  onToggleStar: () => void;
  onPlayAudio: () => void;
};

const cornerBtnClass =
  'absolute z-20 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-surface-paper shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-brand-soft active:translate-y-0';

function FrontFace({ card }: { card: LessonVocabularyItem }) {
  const primaryText = card.reading ?? card.word;
  const kanjiText = card.reading ? card.word : null;

  return (
    <div className="flex max-w-full flex-col items-center justify-center px-5 text-center sm:px-10">
      <Badge className="mb-6 bg-brand-soft text-brand">{card.jlptLevel}</Badge>
      <p className="max-w-full break-words font-jp text-4xl font-black tracking-wide text-foreground [overflow-wrap:anywhere] sm:text-6xl">
        {primaryText}
      </p>
      {kanjiText && (
        <p className="mt-4 max-w-full break-words font-jp text-2xl font-semibold text-muted-foreground/80 [overflow-wrap:anywhere] sm:text-3xl">
          {kanjiText}
        </p>
      )}
      <p className="mt-8 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Nhấn để xem nghĩa và ví dụ
      </p>
    </div>
  );
}

function BackFace({ card }: { card: LessonVocabularyItem }) {
  const example =
    card.exampleSentence?.trim() || card.exampleTranslation?.trim() || null;
  const exampleSub =
    card.exampleSentence && card.exampleTranslation ? card.exampleTranslation : null;

  return (
    <div className="flex max-w-lg flex-col items-center justify-center gap-4 px-5 text-center sm:px-10">
      <Badge className="bg-tertiary text-tertiary-foreground">Meaning</Badge>
      <p className="max-w-full break-words text-2xl font-extrabold leading-snug text-foreground [overflow-wrap:anywhere] sm:text-4xl">
        {card.meaning}
      </p>
      {example && (
        <div className="w-full space-y-2 rounded-xl border border-border bg-background/80 p-4 shadow-premium card-lift">
          {card.exampleSentence && (
            <p className="break-words font-jp text-base font-bold leading-8 text-foreground [overflow-wrap:anywhere] sm:text-xl">
              {card.exampleSentence}
            </p>
          )}
          {exampleSub && (
            <p className="border-t-2 border-dashed border-border pt-2 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              {exampleSub}
            </p>
          )}
          {!card.exampleSentence && card.exampleTranslation && (
            <p className="text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              {card.exampleTranslation}
            </p>
          )}
        </div>
      )}
      <p className="mt-4 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Nhấn để lật lại
      </p>
    </div>
  );
}

export function FlashcardCard({
  card,
  flipped,
  slideDirection,
  cardKey,
  speaking,
  starred,
  onFlip,
  onToggleStar,
  onPlayAudio,
}: FlashcardCardProps) {
  return (
    <FlipFlashcardFrame
      cardKey={cardKey}
      slideDirection={slideDirection}
      flipped={flipped}
      onFlip={onFlip}
      front={
        <>
          <button
            type="button"
            className={cn(cornerBtnClass, 'left-3 top-3 sm:left-4 sm:top-4')}
            disabled={speaking}
            aria-label={`Phát âm ${card.reading ?? card.word}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio();
            }}
          >
            <Volume2
              className={cn('size-6', speaking ? 'text-muted-foreground/50' : 'text-foreground')}
            />
          </button>
          <button
            type="button"
            className={cn(cornerBtnClass, 'right-3 top-3 sm:right-4 sm:top-4')}
            aria-label={starred ? 'Bỏ gắn sao' : 'Gắn sao'}
            aria-pressed={starred}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
          >
            <Star
              className={cn(
                'size-6',
                starred ? 'fill-tertiary text-foreground' : 'text-muted-foreground/70',
              )}
            />
          </button>
          <div className="flex flex-1 items-center justify-center pb-6 pt-14">
            <FrontFace card={card} />
          </div>
        </>
      }
      back={
        <div className="flex flex-1 items-center justify-center py-10">
          <BackFace card={card} />
        </div>
      }
    />
  );
}
