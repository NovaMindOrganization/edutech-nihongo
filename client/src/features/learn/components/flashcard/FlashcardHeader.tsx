import { Loader2, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
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
  return (
    <header className="space-y-4 rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Link
          to={paths.learn.lessonVocabulary(lessonId)}
          className="text-sm font-bold text-primary hover:underline"
        >
          ← Từ vựng
        </Link>
        <div className="min-w-0 text-center">
          <Badge className="bg-quaternary text-quaternary-foreground">Flashcards</Badge>
          <p className="mt-1 font-display text-sm font-extrabold tabular-nums text-foreground">
            {progressLabel}
          </p>
        </div>
        <div className="size-11" aria-hidden />
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex items-center gap-2 sm:min-w-[200px] sm:justify-end">
            <label htmlFor="flashcard-vocab-filter" className="shrink-0 text-xs font-bold text-muted-foreground">
              Hiển thị
            </label>
            <div className="relative min-w-0 flex-1 sm:max-w-[180px]">
              {loading ? (
                <Loader2 className="pointer-events-none absolute right-9 top-1/2 z-10 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
              <Select
                id="flashcard-vocab-filter"
                value={source}
                disabled={loading}
                onChange={(event) => onSourceChange(event.target.value as VocabSourceFilter)}
                className="h-9 w-full py-1.5 text-sm font-semibold"
                aria-label="Lọc từ vựng"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
