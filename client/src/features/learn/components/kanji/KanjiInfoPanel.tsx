import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/utils/cn';

import type { KanjiItem } from '../../types/kanji.types';

type KanjiInfoPanelProps = {
  kanji: KanjiItem;
};

const sectionClass = 'rounded-xl p-4';

export function KanjiInfoPanel({ kanji }: KanjiInfoPanelProps) {
  const { playTts, speaking } = useSpeech();
  const examples = kanji.examples.slice(0, 2);

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="text-center xl:text-left">
        <p className="font-jp text-8xl font-black leading-none text-gray-800 sm:text-9xl">
          {kanji.character}
        </p>
        {kanji.hanVietPronunciation && (
          <p className="mt-4 text-xl text-gray-500">{kanji.hanVietPronunciation}</p>
        )}
        <p className="mt-2 text-lg text-gray-700">{kanji.meaning}</p>
      </div>

      <div className={cn(sectionClass, 'bg-red-100')}>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-900/80">
          Âm On (音読み)
        </p>
        {kanji.readingsOn.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 xl:justify-start">
            {kanji.readingsOn.map((reading) => (
              <button
                key={`on-${reading}`}
                type="button"
                disabled={speaking}
                aria-label={`Phát âm ${reading}`}
                onClick={() => playTts(reading)}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-lg font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {reading}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-base text-red-900/50">—</p>
        )}
      </div>

      <div className={cn(sectionClass, 'bg-blue-100')}>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-900/80">
          Âm Kun (訓読み)
        </p>
        {kanji.readingsKun.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 xl:justify-start">
            {kanji.readingsKun.map((reading) => (
              <button
                key={`kun-${reading}`}
                type="button"
                disabled={speaking}
                aria-label={`Phát âm ${reading}`}
                onClick={() => playTts(reading)}
                className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-lg font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50"
              >
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
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-900/80">
            Ví dụ
          </p>
          <ul className="space-y-3">
            {examples.map((ex, idx) => (
              <li
                key={`${kanji.id}-ex-${idx}`}
                className="rounded-lg border border-emerald-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="font-jp text-xl font-bold text-gray-800">{ex.word}</p>
                <p className="font-jp mt-1 text-lg text-gray-500">{ex.reading ?? '—'}</p>
                <p className="mt-1 text-lg text-gray-700">{ex.meaning}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
