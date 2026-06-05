import { useCallback, useState } from 'react';

const STORAGE_KEY = 'flashcard-auto-play-audio';

function readStored(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === 'true';
}

export function useFlashcardAutoPlay() {
  const [autoPlay, setAutoPlayState] = useState(readStored);

  const setAutoPlay = useCallback((enabled: boolean) => {
    setAutoPlayState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, []);

  return { autoPlay, setAutoPlay };
}
