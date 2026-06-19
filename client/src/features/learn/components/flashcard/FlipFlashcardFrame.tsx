import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import type { SlideDirection } from '../../hooks/use-flashcard-session';

// Opacity-only — avoid transform on this wrapper so preserve-3d flip stays visible.
const slideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const FLIP_MS = 550;

type FlipFlashcardFrameProps = {
  cardKey: string;
  slideDirection: SlideDirection;
  flipped: boolean;
  onFlip: () => void;
  front: ReactNode;
  back: ReactNode;
  className?: string;
  minHeightClass?: string;
};

export function FlipFlashcardFrame({
  cardKey,
  slideDirection: _slideDirection,
  flipped,
  onFlip,
  front,
  back,
  className,
  minHeightClass = 'min-h-[320px] sm:min-h-[400px]',
}: FlipFlashcardFrameProps) {
  const flipLock = useRef(false);

  const handleFlip = useCallback(() => {
    if (flipLock.current) return;
    flipLock.current = true;
    onFlip();
    window.setTimeout(() => {
      flipLock.current = false;
    }, FLIP_MS + 80);
  }, [onFlip]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleFlip();
      }
    },
    [handleFlip],
  );

  const faceShell = cn(
    'absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-border bg-surface-paper',
    'shadow-premium [backface-visibility:hidden] [-webkit-backface-visibility:hidden]',
  );

  return (
    <div
      className={cn('group relative mx-auto w-full max-w-2xl px-1 sm:px-0', className)}
      style={{ perspective: '1600px' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={cardKey}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div
            role="button"
            tabIndex={0}
            className={cn(
              'relative mx-auto w-full cursor-pointer text-left outline-none',
              'rounded-xl transition-shadow duration-200',
              'focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
              'group-hover:shadow-premium-hover',
            )}
            onClick={handleFlip}
            onKeyDown={handleKeyDown}
            aria-label={
              flipped ? 'Mặt sau — nhấn để lật lại' : 'Mặt trước — nhấn để xem đáp án'
            }
          >
            <div
              className={cn(
                'relative mx-auto w-full',
                minHeightClass,
                '[transform-style:preserve-3d] transition-transform duration-[550ms] ease-[cubic-bezier(0.33,1,0.68,1)]',
                flipped && '[transform:rotateY(180deg)]',
              )}
            >
              <div className={faceShell}>{front}</div>
              <div className={cn(faceShell, '[transform:rotateY(180deg)]')}>{back}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
