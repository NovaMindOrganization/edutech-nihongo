import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { PageGrid } from '@/components/usable/page-shell';
import { LoadingState } from '@/components/usable/states';
import { Button } from '@/components/ui/button';
import {
  getUserNotebookContent,
  removeUserNotebookItem,
  updateUserNotebookItemNote,
} from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { NotebookItemNoteEditor } from './NotebookItemNoteEditor';
import { NotebookReviewBar } from './NotebookReviewBar';
import {
  NotebookEmptyState,
  NotebookGrammarCard,
  NotebookKanjiCard,
  NotebookSearchToolbar,
  NotebookVocabCard,
} from './notebook-shared';
import type { NotebookType } from './notebook-types';

type PersonalNotebookPanelProps = {
  notebookId: string;
  type: NotebookType;
  onCountChange?: (count: number) => void;
};

export function PersonalNotebookPanel({
  notebookId,
  type,
  onCountChange,
}: PersonalNotebookPanelProps) {
  const [items, setItems] = useState<unknown[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pickRequestId, setPickRequestId] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserNotebookContent(notebookId, type, {
        level: levelFilter || undefined,
      });
      setItems(res.items);
      setLevels(res.levels ?? []);
      setSelectedIds([]);
      onCountChange?.(res.items.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được sổ tay');
    } finally {
      setLoading(false);
    }
  }, [notebookId, type, levelFilter, onCountChange]);

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

  async function saveNote(entryId: string, note: string | null) {
    await updateUserNotebookItemNote(notebookId, entryId, note);
    await load();
  }

  async function removeItem(itemId: string) {
    try {
      await removeUserNotebookItem(notebookId, { itemId, itemType: type });
      toast.message('Đã xóa khỏi sổ tay');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không xóa được');
    }
  }

  if (loading) {
    return <LoadingState label="Đang tải sổ tay…" variant="panel" />;
  }

  const unit =
    type === 'kanji' ? 'kanji' : type === 'vocabulary' ? 'từ' : 'mẫu';

  return (
    <div className="space-y-5">
      <NotebookSearchToolbar
        value={search}
        onChange={setSearch}
        placeholder={`Tìm trong sổ tay — ${type === 'kanji' ? 'kanji' : type === 'vocabulary' ? 'từ vựng' : 'ngữ pháp'}…`}
        total={items.length}
        filtered={filtered.length}
        pool="collected"
        hideSearch={items.length === 0}
        trailing={
          <NotebookReviewBar
            pool="collected"
            type={type}
            notebookId={notebookId}
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
        <NotebookEmptyState pool="collected" type={type} />
      ) : (
        <PageGrid cols="wide" className="gap-4">
          {filtered.map((raw) => {
            const item = raw as Record<string, unknown>;
            const id = String(item.id);
            const entryId = String(item.entryId);
            const note = item.note != null ? String(item.note) : null;
            const lessonId = item.lessonId != null ? String(item.lessonId) : undefined;
            const isLearned = Boolean(item.isLearned);
            const selected = selectedIds.includes(id);

            const removeBtn = (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-8 gap-1 text-xs font-bold text-destructive hover:text-destructive"
                onClick={() => void removeItem(id)}
              >
                <Trash2 className="size-3.5" />
                Xóa khỏi sổ
              </Button>
            );

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
                <div key={entryId} className="flex flex-col">
                  <NotebookKanjiCard
                    character={k.character}
                    meaning={k.meaning}
                    jlptLevel={k.jlptLevel}
                    hanViet={k.hanVietPronunciation}
                    readingsOn={k.readingsOn}
                    readingsKun={k.readingsKun}
                    isLearned={isLearned}
                    practiceHref={
                      lessonId ? paths.learn.lessonKanjiFocus(lessonId, id) : undefined
                    }
                    selectable
                    selected={selected}
                    onToggleSelect={() => toggleSelect(id)}
                  />
                  <NotebookItemNoteEditor
                    note={note}
                    onSave={(n) => saveNote(entryId, n)}
                  />
                  {removeBtn}
                </div>
              );
            }

            if (type === 'vocabulary') {
              return (
                <div key={entryId} className="flex flex-col">
                  <NotebookVocabCard
                    word={String(item.word)}
                    reading={item.reading != null ? String(item.reading) : null}
                    meaning={String(item.meaning)}
                    jlptLevel={item.jlptLevel != null ? String(item.jlptLevel) : null}
                    isLearned={isLearned}
                    practiceHref={
                      lessonId ? paths.learn.lessonVocabularyFocus(lessonId, id) : undefined
                    }
                    selectable
                    selected={selected}
                    onToggleSelect={() => toggleSelect(id)}
                  />
                  <NotebookItemNoteEditor
                    note={note}
                    onSave={(n) => saveNote(entryId, n)}
                  />
                  {removeBtn}
                </div>
              );
            }

            return (
              <div key={entryId} className="flex flex-col">
                <NotebookGrammarCard
                  pattern={String(item.pattern)}
                  meaningVi={String(item.meaningVi)}
                  title={item.title != null ? String(item.title) : null}
                  jlpt={item.jlpt != null ? String(item.jlpt) : null}
                  isLearned={isLearned}
                  practiceHref={
                    lessonId ? paths.learn.lessonGrammarFocus(lessonId, id) : undefined
                  }
                  selectable
                  selected={selected}
                  onToggleSelect={() => toggleSelect(id)}
                />
                <NotebookItemNoteEditor note={note} onSave={(n) => saveNote(entryId, n)} />
                {removeBtn}
              </div>
            );
          })}
        </PageGrid>
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex w-[min(100%,24rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
          <span className="text-sm font-bold text-foreground">
            Đã chọn {selectedIds.length} {unit}
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
