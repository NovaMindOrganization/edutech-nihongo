import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import {
  EmptyState,
  emptyStatePresets,
  FlashcardSkeleton,
} from '@/components/usable/states';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/use-speech';

import { FlashcardCard } from '../components/flashcard/FlashcardCard';
import { FlashcardControls } from '../components/flashcard/FlashcardControls';
import { FlashcardHeader } from '../components/flashcard/FlashcardHeader';
import { useFlashcardAutoPlay } from '../hooks/use-flashcard-auto-play';
import { useFlashcardKeyboard } from '../hooks/use-flashcard-keyboard';
import { useFlashcardSession } from '../hooks/use-flashcard-session';

export function VocabularyFlashcardView() {
  const { lessonId = '' } = useParams();
  const { playTts, speaking } = useSpeech();
  const { autoPlay, setAutoPlay } = useFlashcardAutoPlay();
  const audioPlayedForCard = useRef<string | null>(null);

  const {
    source,
    setSource,
    current,
    index,
    flipped,
    slideDirection,
    loading,
    finished,
    progressLabel,
    progressPercent,
    total,
    reload,
    toggleFlip,
    toggleStar,
    markLearning,
    markMastered,
  } = useFlashcardSession(lessonId);

  const studyActive = !loading && !finished && current;

  const playCurrentAudio = () => {
    if (!current) return;
    if (current.audioUrl) {
      const audio = new Audio(current.audioUrl);
      void audio.play();
      return;
    }
    void playTts(current.reading ?? current.word);
  };

  useFlashcardKeyboard({
    enabled: Boolean(studyActive),
    onFlip: toggleFlip,
    onPlayAudio: playCurrentAudio,
    onMarkLearning: flipped ? markLearning : undefined,
    onMarkMastered: flipped ? markMastered : undefined,
  });

  const prevFlippedRef = useRef(false);
  useEffect(() => {
    const justRevealed = flipped && !prevFlippedRef.current;
    prevFlippedRef.current = flipped;

    if (!flipped) {
      audioPlayedForCard.current = null;
      return;
    }
    if (!justRevealed || !current || !autoPlay) return;
    if (audioPlayedForCard.current === current.id) return;
    audioPlayedForCard.current = current.id;
    playCurrentAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-play only on reveal
  }, [flipped, current?.id, autoPlay]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-8">
      <FlashcardHeader
        lessonId={lessonId}
        progressLabel={progressLabel}
        progressPercent={progressPercent}
        source={source}
        autoPlay={autoPlay}
        loading={loading}
        onSourceChange={setSource}
        onAutoPlayChange={setAutoPlay}
      />

      {loading && total === 0 && <FlashcardSkeleton />}

      {!loading && total === 0 && (
        <EmptyState
          {...emptyStatePresets.flashcards}
          action={
            <Button type="button" variant="outline" onClick={() => setSource('all')}>
              Xem tất cả
            </Button>
          }
        />
      )}

      {finished && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EmptyState
            {...emptyStatePresets.flashcardsComplete}
            action={
              <Button type="button" onClick={() => void reload()}>
                Học lại
              </Button>
            }
          />
        </motion.div>
      )}

      {studyActive && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-8"
        >
          <FlashcardCard
            card={current}
            flipped={flipped}
            slideDirection={slideDirection}
            cardKey={`${current.id}-${index}`}
            speaking={speaking}
            starred={current.progress?.isStarred ?? false}
            onFlip={toggleFlip}
            onToggleStar={() =>
              toggleStar(current.id, !(current.progress?.isStarred ?? false))
            }
            onPlayAudio={playCurrentAudio}
          />

          <FlashcardControls
            flipped={flipped}
            onLearning={markLearning}
            onMastered={markMastered}
          />
        </motion.div>
      )}
    </div>
  );
}
