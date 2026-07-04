import { BookOpen, Brain, Layers, ListChecks, Shuffle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { getNotebookLessons } from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';
import { TYPE_LABELS } from './notebook-types';
import type { NotebookPool, NotebookReviewMode, NotebookType } from './notebook-types';
import { NotebookReviewSession } from './NotebookReviewSession';

type LessonOption = {
  id: string;
  title: string;
  orderIndex: number;
  course: { title: string; jlptLevel: string };
};

type NotebookReviewBarProps = {
  pool: NotebookPool;
  type: NotebookType;
  notebookId?: string;
  selectedItemIds?: string[];
  pickRequestId?: number;
  onSessionClose?: () => void;
};

export function NotebookReviewBar({
  pool,
  type,
  notebookId,
  selectedItemIds = [],
  pickRequestId = 0,
  onSessionClose,
}: NotebookReviewBarProps) {
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [lessonPickerOpen, setLessonPickerOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionMode, setSessionMode] = useState<NotebookReviewMode>('random');
  const [sessionLessonIds, setSessionLessonIds] = useState<string[]>([]);
  const [sessionItemIds, setSessionItemIds] = useState<string[] | undefined>();
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const pickCount = selectedItemIds.length;
  const canPickLearned = pool === 'learned' && pickCount > 0;
  const canPickCollected =
    pool === 'collected' && pickCount > 0 && (!!notebookId || type !== 'grammar');
  const canPick = canPickLearned || canPickCollected;
  const canLesson = pool === 'learned';
  const canMasteryModes = pool === 'learned';

  const masteryLabel =
    type === 'vocabulary' ? 'từ vựng' : type === 'grammar' ? 'ngữ pháp' : 'kanji';
  const pickUnit =
    type === 'kanji' ? 'kanji' : type === 'vocabulary' ? 'từ' : 'mẫu';

  async function openLessonPicker() {
    setModeDialogOpen(false);
    setLoadingLessons(true);
    setLessonPickerOpen(true);
    try {
      const res = await getNotebookLessons(type);
      setLessons(res.lessons as LessonOption[]);
    } finally {
      setLoadingLessons(false);
    }
  }

  function begin(mode: NotebookReviewMode, lessonIds?: string[], itemIds?: string[]) {
    setSessionMode(mode);
    setSessionLessonIds(lessonIds ?? []);
    setSessionItemIds(itemIds);
    setModeDialogOpen(false);
    setLessonPickerOpen(false);
    setSessionOpen(true);
  }

  useEffect(() => {
    if (!pickRequestId || pickCount === 0) return;
    begin('pick', undefined, selectedItemIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ kích hoạt khi bấm「Ôn flashcard」từ thanh chọn
  }, [pickRequestId]);

  return (
    <>
      <Button className="shrink-0 gap-2" onClick={() => setModeDialogOpen(true)}>
        <Layers className="size-4" />
        Ôn tập bằng flashcard
      </Button>

      <Dialog
        open={modeDialogOpen}
        onOpenChange={setModeDialogOpen}
        title={`Ôn ${TYPE_LABELS[type]} — chọn cách luyện`}
        className="max-w-md"
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => begin('random')}
            className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface-paper p-4 text-left transition-colors hover:border-brand/40 hover:bg-brand-soft/20"
          >
            <Shuffle className="mt-0.5 size-5 shrink-0 text-brand" />
            <span>
              <span className="block font-display text-sm font-bold">Ôn random</span>
              <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                15 thẻ ngẫu nhiên trong tab này
              </span>
            </span>
          </button>

          {canMasteryModes && (
            <>
              <button
                type="button"
                onClick={() => begin('unlearned')}
                className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface-paper p-4 text-left transition-colors hover:border-brand/40 hover:bg-brand-soft/20"
              >
                <Brain className="mt-0.5 size-5 shrink-0 text-brand" />
                <span>
                  <span className="block font-display text-sm font-bold">Chưa thuộc</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                    Chỉ {masteryLabel} bạn chưa đánh dấu thuộc
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => begin('learned')}
                className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface-paper p-4 text-left transition-colors hover:border-brand/40 hover:bg-brand-soft/20"
              >
                <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
                <span>
                  <span className="block font-display text-sm font-bold">Đã thuộc</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                    Ôn lại {masteryLabel} đã thuộc
                  </span>
                </span>
              </button>
            </>
          )}

          {canLesson && (
            <button
              type="button"
              onClick={() => void openLessonPicker()}
              className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface-paper p-4 text-left transition-colors hover:border-brand/40 hover:bg-brand-soft/20"
            >
              <BookOpen className="mt-0.5 size-5 shrink-0 text-brand" />
              <span>
                <span className="block font-display text-sm font-bold">Chọn bài học</span>
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                  Chỉ ôn nội dung từ các bài đã chọn
                </span>
              </span>
            </button>
          )}

          {(pool === 'collected' && type !== 'grammar') || pool === 'learned' ? (
            <button
              type="button"
              disabled={!canPick}
              onClick={() => begin('pick', undefined, selectedItemIds)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border border-border bg-surface-paper p-4 text-left transition-colors',
                canPick
                  ? 'hover:border-brand/40 hover:bg-brand-soft/20'
                  : 'cursor-not-allowed opacity-50',
              )}
            >
              <ListChecks className="mt-0.5 size-5 shrink-0 text-brand" />
              <span>
                <span className="block font-display text-sm font-bold">Tự chọn mục</span>
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                  {canPick
                    ? `Ôn ${pickCount} ${pickUnit} đã chọn trong danh sách`
                    : `Chọn ít nhất một ${pickUnit} trong danh sách trước`}
                </span>
              </span>
            </button>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={lessonPickerOpen}
        onOpenChange={setLessonPickerOpen}
        title={`Chọn bài học — ${TYPE_LABELS[type]}`}
        className="max-w-lg"
      >
        {loadingLessons ? (
          <p className="text-sm text-muted-foreground">Đang tải danh sách bài…</p>
        ) : lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bài nào có nội dung loại này.</p>
        ) : (
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            {lessons.map((lesson) => {
              const checked = selectedLessonIds.includes(lesson.id);
              return (
                <li key={lesson.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all',
                      checked
                        ? 'border-brand bg-brand-soft/40 shadow-sm'
                        : 'border-border bg-surface-paper hover:border-brand/40 hover:bg-muted/30',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded border-border accent-brand"
                      checked={checked}
                      onChange={() =>
                        setSelectedLessonIds((prev) =>
                          checked
                            ? prev.filter((id) => id !== lesson.id)
                            : [...prev, lesson.id],
                        )
                      }
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-foreground">{lesson.title}</span>
                      <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                        {lesson.course.title} · {lesson.course.jlptLevel} · Bài {lesson.orderIndex}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => setLessonPickerOpen(false)}>
            Hủy
          </Button>
          <Button
            disabled={selectedLessonIds.length === 0}
            onClick={() => begin('lesson', selectedLessonIds)}
          >
            Bắt đầu ({selectedLessonIds.length} bài)
          </Button>
        </div>
      </Dialog>

      <NotebookReviewSession
        open={sessionOpen}
        onClose={() => {
          setSessionOpen(false);
          onSessionClose?.();
        }}
        pool={pool}
        type={type}
        notebookId={notebookId}
        mode={sessionMode}
        lessonIds={sessionMode === 'lesson' ? sessionLessonIds : undefined}
        itemIds={sessionMode === 'pick' ? sessionItemIds : undefined}
      />
    </>
  );
}
