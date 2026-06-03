import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

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

  if (!faces.length) return null;

  const card = faces[index];
  const progress = ((index + 1) / faces.length) * 100;

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => Math.min(faces.length - 1, Math.max(0, i + delta)));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">
          Flashcard {index + 1}/{faces.length}
        </p>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="size-5" />
        </Button>
      </div>
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <button
          type="button"
          className={cn(
            'relative min-h-[220px] w-full max-w-md cursor-pointer rounded-2xl border-2 border-primary/30 bg-card p-8 shadow-lg transition',
            flipped && 'bg-primary/5',
          )}
          onClick={() => setFlipped((f) => !f)}
        >
          <span className="absolute left-4 top-4 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
            {card.label}
          </span>
          <p className="mt-6 text-center font-jp text-2xl font-bold">
            {flipped ? card.back : card.front}
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {flipped ? 'Mặt sau' : 'Chạm để lật'}
          </p>
        </button>
      </div>
      <div className="flex justify-center gap-4 border-t p-4">
        <Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => go(-1)}>
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={index >= faces.length - 1}
          onClick={() => go(1)}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
