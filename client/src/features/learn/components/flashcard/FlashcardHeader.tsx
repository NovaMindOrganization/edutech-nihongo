import { Check, Filter, Loader2, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import type { VocabSourceFilter } from '../../services/vocabularyApi';

const FILTER_OPTIONS: { id: VocabSourceFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'mastered', label: 'Đã thuộc' },
  { id: 'unmastered', label: 'Chưa thuộc' },
  { id: 'starred', label: 'Đã lưu (★)' },
];

type FlashcardHeaderProps = {
  lessonId: string;
  progressLabel: string;
  progressPercent: number;
  source: VocabSourceFilter;
  autoPlay: boolean;
  loading?: boolean;
  onSourceChange: (source: VocabSourceFilter) => void;
  onAutoPlayChange: (enabled: boolean) => void;
};

export function FlashcardHeader({
  lessonId,
  progressLabel,
  progressPercent,
  source,
  autoPlay,
  loading,
  onSourceChange,
  onAutoPlayChange,
}: FlashcardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  return (
    <header className="space-y-4 rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
      <div className="flex items-center gap-3">
        <Link
          to={paths.learn.lessonVocabulary(lessonId)}
          className="shrink-0 text-sm font-bold text-primary hover:underline"
        >
          ← Từ vựng
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <Badge className="bg-quaternary text-quaternary-foreground">Flashcards</Badge>
          <p className="mt-1 font-display text-sm font-extrabold tabular-nums text-foreground">{progressLabel}</p>
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              'flex size-11 items-center justify-center rounded-lg border border-border',
              'bg-background text-foreground shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-brand-soft',
              menuOpen && 'bg-brand text-white',
            )}
            aria-label="Bộ lọc từ vựng"
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Filter className="size-5" />
            )}
          </button>

          {menuOpen && (
            <div
              role="listbox"
              aria-label="Lọc từ vựng"
              className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-surface-paper py-2 shadow-premium-hover"
            >
              <p className="px-3 py-2 font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Hiển thị</p>
              {FILTER_OPTIONS.map((opt) => {
                const active = source === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onSourceChange(opt.id);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2.5 text-sm font-bold transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'hover:bg-tertiary/20',
                    )}
                  >
                    {opt.label}
                    {active && <Check className="size-4" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 overflow-hidden rounded-full border border-border bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tiến độ ${progressLabel}`}
          />
        </div>

        <div className="flex items-center justify-between gap-2 px-0.5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Volume2 className="size-3.5" />
              Auto-play Audio
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoPlay}
              aria-label="Tự động phát âm khi lật thẻ"
              onClick={() => onAutoPlayChange(!autoPlay)}
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full border border-border transition-colors',
                autoPlay ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 size-4 rounded-full border border-border bg-surface-paper shadow-premium card-lift transition-transform',
                  autoPlay && 'translate-x-5',
                )}
              />
            </button>
          </label>
          {/* <p className="text-xs text-muted-foreground">
            Bộ lọc: {activeLabel}
            <span className="mx-1.5 text-border">·</span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">A</kbd> nghe
          </p> */}
        </div>
      </div>
    </header>
  );
}
