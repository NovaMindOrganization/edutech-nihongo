import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageGrid } from '@/components/usable/page-shell';
import { LoadingState } from '@/components/usable/states';
import { getNotebookLearned } from '@/features/student/services/studentApi';
import { NotebookReviewBar } from './NotebookReviewBar';
import {
  NotebookEmptyState,
  NotebookGrammarCard,
  NotebookKanjiCard,
  NotebookSearchToolbar,
  NotebookVocabCard,
} from './notebook-shared';
import type { NotebookType } from './notebook-types';

type LearnedPanelProps = {
  type: NotebookType;
  onCountChange?: (count: number) => void;
};

export function NotebookLearnedPanel({ type, onCountChange }: LearnedPanelProps) {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotebookLearned(type);
      setItems(res.items);
      onCountChange?.(res.items.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được nội dung');
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

  if (loading) {
    return <LoadingState label="Đang tải nội dung đã học…" variant="panel" />;
  }

  return (
    <div className="space-y-5">
      <NotebookSearchToolbar
        value={search}
        onChange={setSearch}
        placeholder="Tìm kanji, nghĩa, cách đọc…"
        total={items.length}
        filtered={filtered.length}
        pool="learned"
        hideSearch={items.length === 0}
        trailing={<NotebookReviewBar pool="learned" type={type} />}
      />

      {filtered.length === 0 ? (
        <NotebookEmptyState pool="learned" type={type} />
      ) : (
        <PageGrid cols="wide" className="gap-4">
          {filtered.map((raw) => {
            const item = raw as Record<string, unknown>;
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
                  key={String(item.id)}
                  character={k.character}
                  meaning={k.meaning}
                  jlptLevel={k.jlptLevel}
                  hanViet={k.hanVietPronunciation}
                  readingsOn={k.readingsOn}
                  readingsKun={k.readingsKun}
                />
              );
            }
            if (type === 'vocabulary' && item.word) {
              return (
                <NotebookVocabCard
                  key={String(item.id)}
                  word={String(item.word)}
                  reading={item.reading != null ? String(item.reading) : null}
                  meaning={String(item.meaning)}
                  jlptLevel={item.jlptLevel != null ? String(item.jlptLevel) : null}
                />
              );
            }
            if (type === 'grammar' && item.pattern) {
              return (
                <NotebookGrammarCard
                  key={String(item.id)}
                  pattern={String(item.pattern)}
                  meaningVi={String(item.meaningVi)}
                  title={item.title != null ? String(item.title) : null}
                  jlpt={item.jlpt != null ? String(item.jlpt) : null}
                />
              );
            }
            return null;
          })}
        </PageGrid>
      )}
    </div>
  );
}
