import { AnimatePresence, motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';

import { cn } from '@/utils/cn';

import type { LessonVocabularyItem } from '../../services/vocabularyApi';

type FlashcardCardProps = {
  card: LessonVocabularyItem;
  flipped: boolean;
  slideDirection: 'left' | 'right' | null;
  cardKey: string;
  speaking: boolean;
  starred: boolean;
  onReveal: () => void;
  onToggleStar: () => void;
  onPlayAudio: () => void;
};

const cornerBtnClass =
  'absolute z-20 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors hover:bg-muted/90 active:bg-muted';

function FrontFace({ card }: { card: LessonVocabularyItem }) {
  const showReading = Boolean(card.reading && card.reading !== card.word);

  return (
    <div className="flex flex-col items-center justify-center px-10 text-center">
      <p className="font-jp text-4xl font-bold tracking-wide text-foreground sm:text-5xl">{card.word}</p>
      {showReading && (
        <p className="font-jp mt-4 text-xl text-muted-foreground/75 sm:text-2xl">{card.reading}</p>
      )}
    </div>
  );
}

function BackFace({ card }: { card: LessonVocabularyItem }) {
  const example =
    card.exampleSentence?.trim() ||
    card.exampleTranslation?.trim() ||
    null;
  const exampleSub =
    card.exampleSentence && card.exampleTranslation
      ? card.exampleTranslation
      : null;

  return (
    <div className="flex max-w-md flex-col items-center justify-center gap-4 px-10 text-center">
      <p className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">{card.meaning}</p>
      {example && (
        <div className="space-y-1 border-t border-border/60 pt-4">
          {card.exampleSentence && (
            <p className="font-jp text-base text-muted-foreground sm:text-lg">{card.exampleSentence}</p>
          )}
          {exampleSub && (
            <p className="text-sm text-muted-foreground/80 sm:text-base">{exampleSub}</p>
          )}
          {!card.exampleSentence && card.exampleTranslation && (
            <p className="text-sm text-muted-foreground/80 sm:text-base">{card.exampleTranslation}</p>
          )}
        </div>
      )}
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
  onReveal,
  onToggleStar,
  onPlayAudio,
}: FlashcardCardProps) {
  const slideVariants = {
    enter: (dir: 'left' | 'right' | null) => ({
      x: dir === 'left' ? 64 : dir === 'right' ? -64 : 0,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'left' | 'right' | null) => ({
      x: dir === 'left' ? -64 : dir === 'right' ? 64 : 0,
      opacity: 0,
    }),
  };

  const faceClass = cn(
    'absolute inset-0 flex flex-col rounded-[1.75rem] border [backface-visibility:hidden]',
    'shadow-lg transition-shadow duration-200',
  );

  return (
    <div
      className="group relative mx-auto w-full max-w-2xl px-1 sm:px-0"
      style={{ perspective: 1600 }}
    >
      <AnimatePresence mode="wait" custom={slideDirection}>
        <motion.div
          key={cardKey}
          custom={slideDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'w-full cursor-pointer transition-transform duration-200 ease-out will-change-transform',
            'group-hover:scale-[1.02]',
          )}
          onClick={() => {
            if (!flipped) onReveal();
          }}
          role="button"
          tabIndex={0}
          aria-label={
            flipped ? 'Mặt sau — Space để lật lại hoặc chọn mức độ nhớ' : 'Mặt trước — nhấn để xem đáp án'
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!flipped) onReveal();
            }
          }}
        >
          <div
            className={cn(
              'relative mx-auto min-h-[350px] w-full sm:min-h-[400px]',
              '[transform-style:preserve-3d] transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
              flipped && '[transform:rotateY(180deg)]',
            )}
          >
            {/* Front */}
            <div
              className={cn(
                faceClass,
                'border-border/80 bg-gradient-to-b from-card to-[var(--nc-cream)]/35',
                'group-hover:shadow-xl',
              )}
            >
              <button
                type="button"
                className={cn(cornerBtnClass, 'left-3 top-3 sm:left-4 sm:top-4')}
                disabled={speaking}
                aria-label={`Phát âm ${card.word}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
              >
                <Volume2
                  className={cn('size-6', speaking ? 'text-muted-foreground/50' : 'text-muted-foreground')}
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
                    starred ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/70',
                  )}
                />
              </button>
              <div className="flex flex-1 items-center justify-center pb-6 pt-14">
                <FrontFace card={card} />
              </div>
            </div>

            {/* Back */}
            <div
              className={cn(
                faceClass,
                'border-primary/20 bg-gradient-to-b from-primary/[0.06] to-card',
                '[transform:rotateY(180deg)]',
              )}
            >
              <div className="flex flex-1 items-center justify-center py-10">
                <BackFace card={card} />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
