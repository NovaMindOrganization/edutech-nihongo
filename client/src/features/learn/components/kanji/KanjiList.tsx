import type { KanjiItem } from '../../types/kanji.types';
import { KanjiCard } from './KanjiCard';

type KanjiListProps = {
  kanji: KanjiItem[];
  title?: string;
  learnedCount?: number;
  progressLoading?: boolean;
  isLearned: (kanjiId: string) => boolean;
  onSelect: (kanji: KanjiItem) => void;
};

export function KanjiList({
  kanji,
  title = 'Kanji bài học',
  learnedCount = 0,
  progressLoading = false,
  isLearned,
  onSelect,
}: KanjiListProps) {
  const total = kanji.length;
  const percent = total > 0 ? Math.round((learnedCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} chữ · Chạm vào thẻ để luyện vẽ nét
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-primary">
              {progressLoading ? '…' : `${learnedCount}/${total}`}
            </p>
            <p className="text-xs text-muted-foreground">Đã luyện xong</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: progressLoading ? '0%' : `${percent}%` }}
          />
        </div>
      </div>

      {total === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Chưa có kanji trong bài này.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
          {kanji.map((item) => (
            <KanjiCard
              key={item.id}
              kanji={item}
              learned={isLearned(item.id)}
              onClick={() => onSelect(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
