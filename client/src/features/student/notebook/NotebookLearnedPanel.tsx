import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import { toast } from 'sonner';

import { PageGrid } from '@/components/usable/page-shell';
import { LoadingState } from '@/components/usable/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNotebookLearned } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
import { NotebookReviewBar } from './NotebookReviewBar';
import {
  NotebookEmptyState,
  NotebookGrammarCard,
  NotebookKanjiCard,
  NotebookSearchToolbar,
  NotebookVocabCard,
} from './notebook-shared';
import type { NotebookType } from './notebook-types';

type LessonMeta = {
  lessonId: string;
  lessonTitle: string;
  lessonOrderIndex: number;
  courseTitle: string;
};

type KanjiLearnedItem = LessonMeta & {
  id: string;
  isLearned: boolean;
  kanji: {
    character: string;
    meaning: string;
    jlptLevel: string;
    hanVietPronunciation?: string | null;
    readingsOn?: string[];
    readingsKun?: string[];
  };
};

type VocabLearnedItem = LessonMeta & {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  jlptLevel: string;
  isLearned: boolean;
};

type GrammarLearnedItem = LessonMeta & {
  id: string;
  pattern: string;
  meaningVi: string;
  title: string | null;
  jlpt: string | null;
  isLearned: boolean;
};

type LearnedItem = KanjiLearnedItem | VocabLearnedItem | GrammarLearnedItem;

type LessonGroup<T> = LessonMeta & { items: T[] };

type LearnedPanelProps = {
  type: NotebookType;
  onCountChange?: (count: number) => void;
};

const UNIT_LABEL: Record<NotebookType, string> = {
  kanji: 'kanji',
  vocabulary: 'từ',
  grammar: 'mẫu',
};

function groupByLesson<T extends LessonMeta>(items: T[]): LessonGroup<T>[] {
  const map = new Map<string, LessonGroup<T>>();

  for (const item of items) {
    const existing = map.get(item.lessonId);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(item.lessonId, {
        lessonId: item.lessonId,
        lessonTitle: item.lessonTitle,
        courseTitle: item.courseTitle,
        lessonOrderIndex: item.lessonOrderIndex,
        items: [item],
      });
    }
  }

  return [...map.values()].sort((a, b) => a.lessonOrderIndex - b.lessonOrderIndex);
}

function uniqueIdCount<T extends { id: string }>(items: T[]) {
  return new Set(items.map((i) => i.id)).size;
}

export function NotebookLearnedPanel({ type, onCountChange }: LearnedPanelProps) {
  const [items, setItems] = useState<unknown[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pickRequestId, setPickRequestId] = useState(0);
  const [collapsedLessons, setCollapsedLessons] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotebookLearned(type, {
        level: levelFilter || undefined,
      });
      setItems(res.items);
      setLevels(res.levels ?? []);
      setSelectedIds([]);
      onCountChange?.(res.items.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được nội dung');
    } finally {
      setLoading(false);
    }
  }, [type, levelFilter, onCountChange]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [items, search]);

  const lessonGroups = useMemo(() => {
    if (type === 'kanji') return groupByLesson(filtered as KanjiLearnedItem[]);
    if (type === 'vocabulary') return groupByLesson(filtered as VocabLearnedItem[]);
    return groupByLesson(filtered as GrammarLearnedItem[]);
  }, [filtered, type]);

  const displayCount = useMemo(() => uniqueIdCount(filtered as Array<{ id: string }>), [filtered]);

  function toggleSelect(itemId: string) {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  }

  function toggleLessonCollapse(lessonId: string) {
    setCollapsedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  }

  function renderGroupItem(
    group: LessonGroup<KanjiLearnedItem | VocabLearnedItem | GrammarLearnedItem>,
    item: KanjiLearnedItem | VocabLearnedItem | GrammarLearnedItem,
  ) {
    const key = `${group.lessonId}-${item.id}`;
    const selected = selectedIds.includes(item.id);

    if (type === 'kanji') {
      const k = item as KanjiLearnedItem;
      return (
        <NotebookKanjiCard
          key={key}
          character={k.kanji.character}
          meaning={k.kanji.meaning}
          jlptLevel={k.kanji.jlptLevel}
          hanViet={k.kanji.hanVietPronunciation}
          readingsOn={k.kanji.readingsOn}
          readingsKun={k.kanji.readingsKun}
          isLearned={k.isLearned}
          practiceHref={paths.learn.lessonKanjiFocus(k.lessonId, k.id)}
          selectable
          selected={selected}
          onToggleSelect={() => toggleSelect(k.id)}
        />
      );
    }

    if (type === 'vocabulary') {
      const v = item as VocabLearnedItem;
      return (
        <NotebookVocabCard
          key={key}
          word={v.word}
          reading={v.reading}
          meaning={v.meaning}
          jlptLevel={v.jlptLevel}
          isLearned={v.isLearned}
          practiceHref={paths.learn.lessonVocabularyFocus(v.lessonId, v.id)}
          selectable
          selected={selected}
          onToggleSelect={() => toggleSelect(v.id)}
        />
      );
    }

    const g = item as GrammarLearnedItem;
    return (
      <NotebookGrammarCard
        key={key}
        pattern={g.pattern}
        meaningVi={g.meaningVi}
        title={g.title}
        jlpt={g.jlpt}
        isLearned={g.isLearned}
        practiceHref={paths.learn.lessonGrammarFocus(g.lessonId, g.id)}
        selectable
        selected={selected}
        onToggleSelect={() => toggleSelect(g.id)}
      />
    );
  }

  if (loading) {
    return <LoadingState label="Đang tải nội dung đã học…" variant="panel" />;
  }

  return (
    <div className="space-y-5">
      <NotebookSearchToolbar
        value={search}
        onChange={setSearch}
        placeholder={
          type === 'kanji'
            ? 'Tìm kanji, nghĩa, cách đọc…'
            : type === 'vocabulary'
              ? 'Tìm từ vựng…'
              : 'Tìm ngữ pháp…'
        }
        total={displayCount}
        filtered={displayCount}
        pool="learned"
        hideSearch={items.length === 0}
        trailing={
          <NotebookReviewBar
            pool="learned"
            type={type}
            selectedItemIds={selectedIds}
            pickRequestId={pickRequestId}
            onSessionClose={() => void load()}
          />
        }
      />

      {levels.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Level
          </span>
          <Button
            type="button"
            size="sm"
            variant={levelFilter === '' ? 'default' : 'outline'}
            className="h-8 rounded-lg text-xs font-bold"
            onClick={() => setLevelFilter('')}
          >
            Tất cả
          </Button>
          {levels.map((level) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={levelFilter === level ? 'default' : 'outline'}
              className="h-8 rounded-lg text-xs font-bold"
              onClick={() => setLevelFilter(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <NotebookEmptyState pool="learned" type={type} />
      ) : (
        <div className="space-y-6">
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm font-medium text-muted-foreground">
            Chạm vào thẻ {UNIT_LABEL[type]} để chọn — thanh{' '}
            <span className="font-bold text-foreground">Ôn flashcard</span> sẽ xuất hiện khi bạn đã
            chọn ít nhất một mục.
          </p>

          {lessonGroups.map((group) => {
            const learnedInGroup = group.items.filter(
              (i) => (i as LearnedItem & { isLearned?: boolean }).isLearned,
            ).length;
            const collapsed = collapsedLessons.has(group.lessonId);
            const unit = UNIT_LABEL[type];

            return (
              <section
                key={group.lessonId}
                className="overflow-hidden rounded-2xl border border-border bg-background shadow-premium"
              >
                <button
                  type="button"
                  onClick={() => toggleLessonCollapse(group.lessonId)}
                  className="flex w-full items-center justify-between gap-3 border-b border-border bg-surface-paper px-4 py-3 text-left transition-colors hover:bg-muted/30 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-extrabold text-foreground">
                      {group.lessonTitle}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                      {group.courseTitle} · {group.items.length} {unit} · {learnedInGroup} đã thuộc
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="tabular-nums">
                      {learnedInGroup}/{group.items.length}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        'size-5 text-muted-foreground transition-transform',
                        collapsed && '-rotate-90',
                      )}
                    />
                  </div>
                </button>

                {!collapsed && (
                  <div className="p-4 sm:p-5">
                    <PageGrid cols="wide" className="gap-4">
                      {group.items.map((item) => renderGroupItem(group, item))}
                    </PageGrid>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex w-[min(100%,24rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
          <span className="text-sm font-bold text-foreground">
            Đã chọn {selectedIds.length} {UNIT_LABEL[type]}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9"
              onClick={() => setSelectedIds([])}
            >
              Bỏ chọn
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setPickRequestId((n) => n + 1)}
            >
              <Layers className="size-4" />
              Ôn flashcard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
