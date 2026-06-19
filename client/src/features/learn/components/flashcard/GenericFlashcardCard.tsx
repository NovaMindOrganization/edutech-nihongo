import { Volume2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { SlideDirection } from '../../hooks/use-flashcard-session';
import { FlipFlashcardFrame } from './FlipFlashcardFrame';

const cornerBtnClass =
  'absolute z-20 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-surface-paper shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-brand-soft active:translate-y-0';

export type GenericFlashcardData = {
  id: string;
  front: string;
  back: string;
  reading?: string;
  badge?: string;
};

type GenericFlashcardCardProps = {
  card: GenericFlashcardData;
  flipped: boolean;
  slideDirection: SlideDirection;
  cardKey: string;
  speaking?: boolean;
  onFlip: () => void;
  onPlayAudio?: () => void;
};

export function GenericFlashcardCard({
  card,
  flipped,
  slideDirection,
  cardKey,
  speaking = false,
  onFlip,
  onPlayAudio,
}: GenericFlashcardCardProps) {
  return (
    <FlipFlashcardFrame
      cardKey={cardKey}
      slideDirection={slideDirection}
      flipped={flipped}
      onFlip={onFlip}
      front={
        <>
          {onPlayAudio && (
            <button
              type="button"
              className={cn(cornerBtnClass, 'left-3 top-3 sm:left-4 sm:top-4')}
              disabled={speaking}
              aria-label="Nghe phát âm"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
            >
              <Volume2
                className={cn('size-6', speaking ? 'text-muted-foreground/50' : 'text-foreground')}
              />
            </button>
          )}
          <div className="flex flex-1 items-center justify-center px-5 pb-6 pt-14 text-center sm:px-10">
            {card.badge && (
              <Badge className="absolute left-1/2 top-14 -translate-x-1/2 bg-brand-soft text-brand">
                {card.badge}
              </Badge>
            )}
            <div>
              <p className="max-w-full break-words font-jp text-4xl font-black tracking-wide text-foreground [overflow-wrap:anywhere] sm:text-6xl">
                {card.front}
              </p>
              {card.reading && (
                <p className="mt-4 max-w-full break-words font-jp text-2xl font-semibold text-muted-foreground/80 [overflow-wrap:anywhere] sm:text-3xl">
                  {card.reading}
                </p>
              )}
              <p className="mt-8 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Nhấn để xem nghĩa
              </p>
            </div>
          </div>
        </>
      }
      back={
        <div className="flex flex-1 items-center justify-center px-5 py-10 text-center sm:px-10">
          <div className="max-w-lg">
            <Badge className="bg-tertiary text-tertiary-foreground">Nghĩa</Badge>
            <p className="mt-4 max-w-full break-words text-2xl font-extrabold leading-snug text-foreground [overflow-wrap:anywhere] sm:text-4xl">
              {card.back}
            </p>
            <p className="mt-8 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Nhấn để lật lại
            </p>
          </div>
        </div>
      }
    />
  );
}
