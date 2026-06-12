import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  getLessonVocabulary,
  patchVocabularyProgress,
  type LessonVocabularyItem,
  type VocabSourceFilter,
} from '../services/vocabularyApi';

export type SlideDirection = 'left' | 'right' | null;

export function useFlashcardSession(lessonId: string) {
  const [source, setSource] = useState<VocabSourceFilter>('all');
  const [cards, setCards] = useState<LessonVocabularyItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [loading, setLoading] = useState(true);
  const progressQueue = useRef<Promise<void>>(Promise.resolve());

  const current = cards[index] ?? null;
  const finished = cards.length > 0 && index >= cards.length;

  const enqueueProgress = useCallback(
    (task: () => Promise<void>) => {
      progressQueue.current = progressQueue.current.then(task).catch(() => {});
    },
    [],
  );

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLessonVocabulary(lessonId, source);
      if (data.items.length === 0) {
        toast.message('Không có từ vựng phù hợp với bộ lọc.');
        setCards([]);
        setIndex(0);
        setFlipped(false);
        return;
      }
      setCards(data.items);
      setIndex(0);
      setFlipped(false);
      setSlideDirection(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được từ vựng');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId, source]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const goToIndex = useCallback((nextIndex: number, direction: SlideDirection) => {
    setSlideDirection(direction);
    setFlipped(false);
    setIndex(nextIndex);
  }, []);

  const reveal = useCallback(() => {
    setFlipped(true);
  }, []);

  const toggleFlip = useCallback(() => {
    setFlipped((v) => !v);
  }, []);

  const advance = useCallback(() => {
    if (index < cards.length - 1) {
      goToIndex(index + 1, 'left');
    } else {
      setSlideDirection('left');
      setIndex(cards.length);
      setFlipped(false);
    }
  }, [cards.length, goToIndex, index]);

  const updateLocalCard = useCallback(
    (vocabularyId: string, patch: Partial<LessonVocabularyItem['progress']>) => {
      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== vocabularyId) return card;
          const base = card.progress ?? {
            isStarred: false,
            status: null,
            updatedAt: new Date().toISOString(),
          };
          return { ...card, progress: { ...base, ...patch } };
        }),
      );
    },
    [],
  );

  const toggleStar = useCallback(
    (vocabularyId: string, nextStarred: boolean) => {
      updateLocalCard(vocabularyId, { isStarred: nextStarred });
      enqueueProgress(async () => {
        await patchVocabularyProgress({ vocabularyId, isStarred: nextStarred }).catch((e) => {
          updateLocalCard(vocabularyId, { isStarred: !nextStarred });
          toast.error(e instanceof Error ? e.message : 'Không cập nhật được sao');
        });
      });
    },
    [enqueueProgress, updateLocalCard],
  );

  const markStatus = useCallback(
    (status: 'learning' | 'mastered') => {
      if (!current) return;
      const vocabularyId = current.id;
      updateLocalCard(vocabularyId, { status });
      enqueueProgress(async () => {
        await patchVocabularyProgress({ vocabularyId, status }).catch((e) => {
          toast.error(e instanceof Error ? e.message : 'Không lưu tiến độ');
        });
      });
      advance();
    },
    [advance, current, enqueueProgress, updateLocalCard],
  );

  const markLearning = useCallback(() => markStatus('learning'), [markStatus]);
  const markMastered = useCallback(() => markStatus('mastered'), [markStatus]);

  useEffect(() => {
    const t = window.setTimeout(() => setSlideDirection(null), 320);
    return () => window.clearTimeout(t);
  }, [index]);

  const currentNumber = finished ? cards.length : Math.min(index + 1, cards.length);
  const total = cards.length;

  const progressPercent = useMemo(() => {
    if (total === 0) return 0;
    if (finished) return 100;
    return Math.round((currentNumber / total) * 100);
  }, [currentNumber, finished, total]);

  const progressLabel = useMemo(() => {
    if (total === 0) return '0 / 0';
    return `${currentNumber} / ${total}`;
  }, [currentNumber, total]);

  return {
    source,
    setSource,
    cards,
    current,
    index,
    flipped,
    slideDirection,
    loading,
    finished,
    progressLabel,
    progressPercent,
    total,
    reload: loadCards,
    reveal,
    toggleFlip,
    toggleStar,
    markLearning,
    markMastered,
  };
}
