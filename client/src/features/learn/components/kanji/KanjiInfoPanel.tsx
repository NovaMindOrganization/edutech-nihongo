import { Hash, PenTool, Shapes, Volume2 } from 'lucide-react';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';

import type { KanjiItem } from '../../types/kanji.types';

type KanjiInfoPanelProps = {
  kanji: KanjiItem;
};

const sectionClass = 'rounded-xl border border-border p-4 shadow-premium card-lift';

export function KanjiInfoPanel({ kanji }: KanjiInfoPanelProps) {
  const { playTts, speaking } = useSpeech();
  const examples = kanji.examples.slice(0, 2);

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="text-center xl:text-left">
        <Badge className="mb-4 bg-amber-200 text-amber-950">{kanji.jlptLevel}</Badge>
        <p className="font-jp text-7xl font-black leading-none text-foreground sm:text-9xl">
          {kanji.character}
        </p>
        {kanji.hanVietPronunciation && (
          <p className="mt-4 font-display text-xl font-extrabold text-muted-foreground">{kanji.hanVietPronunciation}</p>
        )}
        <p className="mt-2 text-lg font-medium text-foreground/80">{kanji.meaning}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={cn(sectionClass, 'bg-amber-100')}>
          <div className="flex items-center gap-2">
            <AppIcon icon={PenTool} size="sm" className="bg-amber-200" />
            <p className="font-display text-sm font-extrabold uppercase tracking-wide text-amber-900">
              Stroke
            </p>
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold tabular-nums text-foreground">
            {kanji.strokeCount ?? '—'}
          </p>
          <p className="text-xs font-bold text-amber-900/70">số nét</p>
        </div>
        <div className={cn(sectionClass, 'bg-amber-200/90')}>
          <div className="flex items-center gap-2">
            <AppIcon icon={Shapes} size="sm" className="bg-surface-paper" />
            <p className="font-display text-sm font-extrabold uppercase tracking-wide text-amber-900">
              Radical
            </p>
          </div>
          <p className="mt-3 font-jp text-2xl font-extrabold text-foreground">
            {kanji.radical ?? '—'}
          </p>
          <p className="text-xs font-bold text-amber-900/70">bộ thủ</p>
        </div>
      </div>

      <div className={cn(sectionClass, 'bg-red-100')}>
        <div className="mb-3 flex items-center gap-2">
          <AppIcon icon={Hash} size="sm" className="bg-surface-paper" />
          <p className="font-display text-sm font-extrabold uppercase tracking-wide text-red-900/80">
            Âm On (音読み)
          </p>
        </div>
        {kanji.readingsOn.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 xl:justify-start">
            {kanji.readingsOn.map((reading) => (
              <button
                key={`on-${reading}`}
                type="button"
                disabled={speaking}
                aria-label={`Phát âm ${reading}`}
                onClick={() => playTts(reading)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface-paper px-4 py-2 text-lg font-semibold text-red-700 shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-red-50 disabled:opacity-50"
              >
                <Volume2 className="size-4" />
                {reading}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-base text-red-900/50">—</p>
        )}
      </div>

      <div className={cn(sectionClass, 'bg-blue-100')}>
        <div className="mb-3 flex items-center gap-2">
          <AppIcon icon={Hash} size="sm" className="bg-surface-paper" />
          <p className="font-display text-sm font-extrabold uppercase tracking-wide text-blue-900/80">
            Âm Kun (訓読み)
          </p>
        </div>
        {kanji.readingsKun.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 xl:justify-start">
            {kanji.readingsKun.map((reading) => (
              <button
                key={`kun-${reading}`}
                type="button"
                disabled={speaking}
                aria-label={`Phát âm ${reading}`}
                onClick={() => playTts(reading)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface-paper px-4 py-2 text-lg font-semibold text-blue-700 shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-blue-50 disabled:opacity-50"
              >
                <Volume2 className="size-4" />
                {reading}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-base text-blue-900/50">—</p>
        )}
      </div>

      {examples.length > 0 && (
        <div className={cn(sectionClass, 'bg-emerald-100')}>
          <p className="mb-3 font-display text-sm font-extrabold uppercase tracking-wide text-emerald-900/80">
            Ví dụ
          </p>
          <ul className="space-y-3">
            {examples.map((ex, idx) => (
              <li
                key={`${kanji.id}-ex-${idx}`}
                className="rounded-lg border border-border bg-surface-paper px-4 py-3 shadow-premium card-lift"
              >
                <p className="font-jp text-xl font-bold text-foreground">{ex.word}</p>
                <p className="mt-1 font-jp text-lg text-muted-foreground">{ex.reading ?? '—'}</p>
                <p className="mt-1 text-base font-medium text-foreground/80">{ex.meaning}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
