import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageGrid } from '@/components/usable/page-shell';
import { LoadingState } from '@/components/usable/states';
import { getNotebookCollected, upsertMastery } from '@/features/student/services/studentApi';
import { NotebookReviewBar } from './NotebookReviewBar';
import {
  NotebookEmptyState,
  NotebookKanjiCard,
  NotebookSearchToolbar,
  NotebookVocabCard,
} from './notebook-shared';
import type { NotebookType } from './notebook-types';

function reviewItemId(item: Record<string, unknown>, type: NotebookType): string {
  if (type === 'kanji') return String(item.itemId);
  return String(item.id);
}

type CollectedPanelProps = {
  type: NotebookType;
  onCountChange?: (count: number) => void;
};

export function NotebookCollectedPanel({ type, onCountChange }: CollectedPanelProps) {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotebookCollected(type);
      setItems(res.items);
      setSelectedIds([]);
      onCountChange?.(res.items.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được sưu tập');
    } finally {
      setLoading(false);
    }
  }, [type, onCountChange]);

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (type === 'grammar') {
    return <NotebookEmptyState pool="collected" type="grammar" />;
  }

  if (loading) {
    return <LoadingState label="Đang tải sưu tập…" variant="panel" />;
  }

  return (
    <div className="space-y-5">
      <NotebookSearchToolbar
        value={search}
        onChange={setSearch}
        placeholder="Tìm trong sưu tập…"
        total={items.length}
        filtered={filtered.length}
        pool="collected"
        hideSearch={items.length === 0}
        trailing={
          <NotebookReviewBar pool="collected" type={type} selectedItemIds={selectedIds} />
        }
      />

      {selectedIds.length > 0 && (
        <p className="rounded-xl border border-brand/30 bg-brand-soft/30 px-4 py-2 text-sm font-semibold text-brand">
          Đã chọn {selectedIds.length} mục — dùng &quot;Ôn tập bằng flashcard&quot; → Tự chọn mục
        </p>
      )}

      {filtered.length === 0 ? (
        <NotebookEmptyState pool="collected" type={type} />
      ) : (
        <PageGrid cols="wide" className="gap-4">
          {filtered.map((raw) => {
            const item = raw as Record<string, unknown>;
            const id = reviewItemId(item, type);
            const selected = selectedIds.includes(id);

            if (type === 'kanji' && item.kanji) {
              const k = item.kanji as {
                character: string;
                meaning: string;
                jlptLevel: string;
                hanVietPronunciation?: string | null;
                readingsOn?: string[];
                readingsKun?: string[];
              };
              return (
                <NotebookKanjiCard
                  key={id}
                  character={k.character}
                  meaning={k.meaning}
                  jlptLevel={k.jlptLevel}
                  hanViet={k.hanVietPronunciation}
                  readingsOn={k.readingsOn}
                  readingsKun={k.readingsKun}
                  selectable
                  selected={selected}
                  onToggleSelect={() => toggleSelect(id)}
                  favorite={Boolean(item.isFavorite)}
                  note={item.note != null ? String(item.note) : null}
                  onToggleFavorite={() =>
                    upsertMastery({
                      itemId: String(item.itemId),
                      itemType: 'kanji',
                      isFavorite: !item.isFavorite,
                    }).then(load)
                  }
                />
              );
            }

            const mastery = item.mastery as
              | { isFavorite?: boolean; note?: string | null }
              | undefined;
            return (
              <NotebookVocabCard
                key={id}
                word={String(item.word)}
                reading={item.reading != null ? String(item.reading) : null}
                meaning={String(item.meaning)}
                jlptLevel={item.jlptLevel != null ? String(item.jlptLevel) : null}
                selectable
                selected={selected}
                onToggleSelect={() => toggleSelect(id)}
                favorite={mastery?.isFavorite}
                onToggleFavorite={() =>
                  upsertMastery({
                    itemId: id,
                    itemType: 'vocabulary',
                    isFavorite: !mastery?.isFavorite,
                  }).then(load)
                }
              />
            );
          })}
        </PageGrid>
      )}
    </div>
  );
}
