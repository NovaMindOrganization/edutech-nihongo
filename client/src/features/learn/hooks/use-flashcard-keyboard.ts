import { useEffect } from 'react';

type FlashcardKeyboardHandlers = {
  onFlip: () => void;
  onPlayAudio?: () => void;
  onMarkLearning?: () => void;
  onMarkMastered?: () => void;
  enabled?: boolean;
};

export function useFlashcardKeyboard({
  onFlip,
  onPlayAudio,
  onMarkLearning,
  onMarkMastered,
  enabled = true,
}: FlashcardKeyboardHandlers) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        onFlip();
        return;
      }

      if ((event.key === 'a' || event.key === 'A') && onPlayAudio) {
        event.preventDefault();
        onPlayAudio();
        return;
      }

      if (event.key === 'ArrowLeft' && onMarkLearning) {
        event.preventDefault();
        onMarkLearning();
        return;
      }

      if (event.key === 'ArrowRight' && onMarkMastered) {
        event.preventDefault();
        onMarkMastered();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onFlip, onPlayAudio, onMarkLearning, onMarkMastered]);
}
