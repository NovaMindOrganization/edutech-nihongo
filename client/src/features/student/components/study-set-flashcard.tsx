import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Frown, Meh, Sparkles, Trophy, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  STUDY_SET_CONTENT_LABELS,
  type StudySetGrammarContent,
  type StudySetItemRow,
  type StudySetKanjiContent,
  type StudySetListeningContent,
  type StudySetSpeakingContent,
  type StudySetVocabContent,
} from '../types/study-set.types';

type CardFace = { front: string; back: string; label: string };

const confidenceOptions = [
  { id: 'again', label: 'Cần ôn lại', icon: Frown, className: 'bg-secondary/20' },
  { id: 'unsure', label: 'Chưa chắc', icon: Meh, className: 'bg-brand-soft' },
  { id: 'confident', label: 'Tự tin', icon: Trophy, className: 'bg-quaternary/25' },
] as const;

type Confidence = (typeof confidenceOptions)[number]['id'];

function toFaces(items: StudySetItemRow[]): CardFace[] {
  return items.map((item) => {
    const label = STUDY_SET_CONTENT_LABELS[item.contentType];
    switch (item.contentType) {
      case 'vocabulary': {
        const c = item.content as StudySetVocabContent;
        return { label, front: c.word, back: c.meaning };
      }
      case 'grammar': {
        const c = item.content as StudySetGrammarContent;
        return { label, front: c.pattern, back: c.meaningVi };
      }
      case 'kanji': {
        const c = item.content as StudySetKanjiContent;
        return { label, front: c.character, back: c.meaning };
      }
      case 'listening': {
        const c = item.content as StudySetListeningContent;
        return { label, front: c.title, back: c.transcript ?? 'Nghe audio trong tab Luyện nghe' };
      }
      case 'speaking': {
        const c = item.content as StudySetSpeakingContent;
        return { label, front: c.title, back: c.prompt };
      }
      default:
        return { label, front: '?', back: '?' };
    }
  });
}

export function StudySetFlashcard({
  items,
  onClose,
}: {
  items: StudySetItemRow[];
  onClose: () => void;
}) {
  const faces = useMemo(() => toFaces(items), [items]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [confidenceByIndex, setConfidenceByIndex] = useState<Record<number, Confidence>>({});

  if (!faces.length) return null;

  const card = faces[index];
  const progress = ((index + 1) / faces.length) * 100;
  const selectedConfidence = confidenceByIndex[index];
  const confidenceLabel =
    confidenceOptions.find((option) => option.id === selectedConfidence)?.label ?? 'Chưa đánh giá';

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => Math.min(faces.length - 1, Math.max(0, i + delta)));
  }

  function rateConfidence(value: Confidence) {
    setConfidenceByIndex((ratings) => ({ ...ratings, [index]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border bg-surface-paper px-4 py-3 shadow-premium card-lift">
        <div>
          <p className="font-display text-sm font-extrabold">
            Flashcard {index + 1}/{faces.length}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{confidenceLabel}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Đóng flashcard">
          <X className="size-5" />
        </Button>
      </div>
      <div className="border-b border-border bg-muted p-1">
        <div className="h-3 overflow-hidden rounded-full border border-border bg-background">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="flex min-h-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.button
            key={`${card.front}-${index}`}
            type="button"
            initial={{ opacity: 0, y: 16, rotate: -0.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -12, rotate: 0.5 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative min-h-[300px] w-full max-w-2xl cursor-pointer rounded-display border border-border bg-surface-paper p-4 shadow-premium-hover transition-all sm:min-h-[360px] sm:p-8',
              'hover:-translate-y-1 hover:shadow-premium-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
              flipped && 'bg-surface-paper',
            )}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Mặt sau, chạm để quay lại mặt trước' : 'Mặt trước, chạm để xem đáp án'}
          >
            <Badge className="absolute left-5 top-5 bg-brand-soft text-brand">
              {card.label}
            </Badge>
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/75 px-4 py-8 sm:min-h-[260px] sm:px-5">
              <p className="max-w-full break-words text-center font-jp text-3xl font-black leading-relaxed [overflow-wrap:anywhere] sm:text-4xl md:text-5xl">
                {flipped ? card.back : card.front}
              </p>
              <p className="mt-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {flipped ? 'Mặt sau · nhấn để quay lại' : 'Chạm để lật'}
              </p>
            </div>
          </motion.button>
        </AnimatePresence>

        {flipped && (
          <div className="mt-5 w-full max-w-2xl rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
            <div className="mb-3 flex items-center justify-center gap-2">
              <AppIcon icon={Sparkles} size="sm" className="bg-tertiary" />
              <p className="font-display text-sm font-extrabold">Bạn tự tin mức nào?</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {confidenceOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => rateConfidence(option.id)}
                  className={cn(
                    'min-h-11 rounded-lg border border-border px-3 py-3 font-display text-sm font-extrabold shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium card-lift',
                    selectedConfidence === option.id
                      ? 'bg-brand text-white'
                      : option.className,
                  )}
                >
                  <option.icon className="mx-auto mb-1 size-5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-border bg-surface-paper p-4 shadow-premium card-lift">
        <Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => go(-1)} aria-label="Thẻ trước">
          <ChevronLeft className="size-5" />
        </Button>
        <p className="min-w-32 text-center text-xs font-semibold text-muted-foreground">
          {Object.keys(confidenceByIndex).length} thẻ đã đánh giá
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={index >= faces.length - 1}
          onClick={() => go(1)}
          aria-label="Thẻ sau"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
