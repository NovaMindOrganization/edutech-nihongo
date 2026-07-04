import { BookOpen, Brush, PenTool } from 'lucide-react';

import { AppIcon } from '@/components/usable/app-icon';
import { EmptyState, emptyStatePresets } from '@/components/usable/states';
import { Badge } from '@/components/ui/badge';

import { AddToNotebookButton } from '@/features/student/notebook/AddToNotebookButton';

import type { KanjiItem } from '../../types/kanji.types';
import { KanjiCard } from './KanjiCard';

type KanjiListProps = {
  kanji: KanjiItem[];
  lessonId?: string;
  title?: string;
  learnedCount?: number;
  progressLoading?: boolean;
  isLearned: (kanjiId: string) => boolean;
  onSelect: (kanji: KanjiItem) => void;
};

export function KanjiList({
  kanji,
  lessonId,
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
      <div className="relative overflow-hidden rounded-xl border border-border bg-amber-50 p-5 shadow-premium card-lift">
        <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border bg-amber-200/80" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <AppIcon icon={Brush} size="lg" className="bg-amber-200" />
            <div>
              <Badge className="bg-amber-200 text-amber-950">Kanji Practice</Badge>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground">{title}</h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {total} chữ · Thẻ lớn giúp xem nhanh nghĩa, âm đọc, bộ thủ và số nét.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-paper px-4 py-3 text-right shadow-premium card-lift">
            <p className="font-display text-3xl font-extrabold tabular-nums text-blue-700">
              {progressLoading ? '…' : `${learnedCount}/${total}`}
            </p>
            <p className="text-xs font-bold text-muted-foreground">Đã thuộc</p>
          </div>
        </div>
        <div className="relative mt-5 h-4 overflow-hidden rounded-full border border-border bg-surface-paper">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: progressLoading ? '0%' : `${percent}%` }}
          />
        </div>
        <div className="relative mt-4 grid gap-3 text-sm font-medium text-muted-foreground md:grid-cols-2">
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-paper/80 px-3 py-2">
            <AppIcon icon={BookOpen} size="sm" className="bg-red-100" />
            Đọc nghĩa và âm trước khi luyện viết.
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-paper/80 px-3 py-2">
            <AppIcon icon={PenTool} size="sm" className="bg-amber-200" />
            Chạm thẻ để mở stroke order.
          </div>
        </div>
      </div>

      {total === 0 ? (
        <EmptyState {...emptyStatePresets.kanji} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {kanji.map((item) => (
            <KanjiCard
              key={item.id}
              kanji={item}
              lessonId={lessonId}
              learned={isLearned(item.id)}
              onClick={() => onSelect(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
