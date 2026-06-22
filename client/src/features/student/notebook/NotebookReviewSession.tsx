import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState, emptyStatePresets } from '@/components/usable/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlashcardControls } from '@/features/learn/components/flashcard/FlashcardControls';
import { GenericFlashcardCard } from '@/features/learn/components/flashcard/GenericFlashcardCard';
import { useFlashcardKeyboard } from '@/features/learn/hooks/use-flashcard-keyboard';
import type { SlideDirection } from '@/features/learn/hooks/use-flashcard-session';
import { useSpeech } from '@/hooks/use-speech';
import { generateNotebookReview } from '@/features/student/services/studentApi';
import {
  POOL_LABELS,
  TYPE_LABELS,
  type NotebookPool,
  type NotebookReviewMode,
  type NotebookType,
} from './notebook-types';

type FlashcardItem = {
  id: string;
  front: string;
  back: string;
  reading?: string;
};

type NotebookReviewSessionProps = {
  open: boolean;
  onClose: () => void;
  pool: NotebookPool;
  type: NotebookType;
  mode: NotebookReviewMode;
  lessonIds?: string[];
  itemIds?: string[];
};

export function NotebookReviewSession({
  open,
  onClose,
  pool,
  type,
  mode,
  lessonIds,
  itemIds,
}: NotebookReviewSessionProps) {
  const [items, setItems] = useState<FlashcardItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [loading, setLoading] = useState(false);
  const { playTts, speaking } = useSpeech();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await generateNotebookReview({
        pool,
        type,
        mode,
        count: 15,
        lessonIds,
        itemIds,
      });
      setItems(res.items);
      setIndex(0);
      setFlipped(false);
      setSlideDirection(null);
      if (res.items.length === 0) {
        toast.message(
          pool === 'learned'
            ? 'Hoàn thành thêm bài học để có nội dung ôn tập'
            : 'Chưa có mục nào trong sưu tập',
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể bắt đầu ôn tập');
    } finally {
      setLoading(false);
    }
  }, [pool, type, mode, lessonIds, itemIds]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      void load();
    });
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setSlideDirection(null), 320);
    return () => window.clearTimeout(t);
  }, [index, open]);

  const current = items[index] ?? null;
  const finished = items.length > 0 && index >= items.length;
  const studyActive = !loading && !finished && current;

  const currentNumber = finished ? items.length : Math.min(index + 1, items.length);
  const progressPercent = useMemo(() => {
    if (items.length === 0) return 0;
    if (finished) return 100;
    return Math.round((currentNumber / items.length) * 100);
  }, [currentNumber, finished, items.length]);

  const toggleFlip = useCallback(() => {
    setFlipped((v) => !v);
  }, []);

  const playCurrentAudio = useCallback(() => {
    if (!current) return;
    void playTts(current.reading ?? current.front);
  }, [current, playTts]);

  const advance = useCallback(() => {
    if (index < items.length - 1) {
      setSlideDirection('left');
      setFlipped(false);
      setIndex((i) => i + 1);
    } else {
      setSlideDirection('left');
      setFlipped(false);
      setIndex(items.length);
    }
  }, [index, items.length]);

  useFlashcardKeyboard({
    enabled: open && Boolean(studyActive),
    onFlip: toggleFlip,
    onPlayAudio: playCurrentAudio,
    onMarkLearning: flipped ? advance : undefined,
    onMarkMastered: flipped ? advance : undefined,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="shrink-0 space-y-3 border-b border-border px-4 py-4 md:px-6">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {POOL_LABELS[pool]} · {TYPE_LABELS[type]}
            </p>
            <h2 className="font-display text-lg font-bold">Flashcard</h2>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </Button>
        </div>

        {items.length > 0 && (
          <div className="mx-auto w-full max-w-2xl space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <Badge className="bg-quaternary text-quaternary-foreground">Ôn tập</Badge>
              <span className="tabular-nums text-foreground">
                {currentNumber} / {items.length}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-border bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          {loading && items.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Đang tải thẻ…</p>
          )}

          {!loading && items.length === 0 && (
            <EmptyState {...emptyStatePresets.flashcards} size="md" />
          )}

          {finished && items.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyState
                {...emptyStatePresets.flashcardsComplete}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" onClick={() => void load()}>
                      Học lại
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Đóng
                    </Button>
                  </div>
                }
              />
            </motion.div>
          )}

          {studyActive && current && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <GenericFlashcardCard
                card={{
                  id: current.id,
                  front: current.front,
                  back: current.back,
                  reading: current.reading,
                  badge: TYPE_LABELS[type],
                }}
                flipped={flipped}
                slideDirection={slideDirection}
                cardKey={`${current.id}-${index}`}
                speaking={speaking}
                onFlip={toggleFlip}
                onPlayAudio={playCurrentAudio}
              />
              <FlashcardControls
                flipped={flipped}
                onLearning={advance}
                onMastered={advance}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
