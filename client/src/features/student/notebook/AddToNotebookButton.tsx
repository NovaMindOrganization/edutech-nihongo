import { BookMarked, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  addUserNotebookItem,
  createUserNotebook,
  getItemNotebookMembership,
  listUserNotebooks,
} from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';
import type { NotebookType } from './notebook-types';

type UserNotebookSummary = {
  id: string;
  title: string;
  description: string | null;
  isDefault: boolean;
  itemCount: number;
};

type AddToNotebookButtonProps = {
  itemId: string;
  itemType: NotebookType;
  lessonId?: string;
  itemLabel: string;
  compact?: boolean;
  className?: string;
};

export function AddToNotebookButton({
  itemId,
  itemType,
  lessonId,
  itemLabel,
  compact = false,
  className,
}: AddToNotebookButtonProps) {
  const [open, setOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<UserNotebookSummary[]>([]);
  const [membership, setMembership] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nbRes, memRes] = await Promise.all([
        listUserNotebooks(),
        getItemNotebookMembership(itemId, itemType),
      ]);
      setNotebooks(nbRes.notebooks as UserNotebookSummary[]);
      setMembership(memRes.notebookIds);
      const defaultNb =
        (nbRes.notebooks as UserNotebookSummary[]).find((n) => n.isDefault) ??
        (nbRes.notebooks as UserNotebookSummary[])[0];
      setSelectedId((prev) => prev || defaultNb?.id || '');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được sổ tay');
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      void load();
    });
  }, [open, load]);

  async function handleAdd() {
    if (!selectedId) return;
    try {
      const res = await addUserNotebookItem(selectedId, {
        itemId,
        itemType,
        lessonId,
        note: note.trim() || undefined,
      });
      toast.success(res.created ? 'Đã thêm vào sổ tay' : 'Đã cập nhật trong sổ tay');
      setOpen(false);
      setNote('');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thêm được vào sổ tay');
    }
  }

  async function handleCreateNotebook() {
    const title = newTitle.trim();
    if (!title) {
      toast.message('Nhập tên sổ tay');
      return;
    }
    try {
      const res = await createUserNotebook({
        title,
        description: newDescription.trim() || undefined,
      });
      const created = res.notebook as { id: string };
      setSelectedId(created.id);
      setCreating(false);
      setNewTitle('');
      setNewDescription('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tạo được sổ tay');
    }
  }

  const inCount = membership.length;

  return (
    <>
      <Button
        type="button"
        variant={compact ? 'outline' : 'secondary'}
        size={compact ? 'sm' : 'default'}
        className={cn('gap-1.5', className)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <BookMarked className="size-4" />
        {compact ? (inCount > 0 ? `Sổ tay (${inCount})` : 'Sổ tay') : 'Thêm vào sổ tay'}
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Thêm vào sổ tay cá nhân"
        className="max-w-lg"
      >
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          <span className="font-bold text-foreground">{itemLabel}</span> — chọn sổ và ghi chú mẹo
          nhớ (tuỳ chọn).
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Chọn sổ tay
              </p>
              <ul className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {notebooks.map((nb) => {
                  const checked = selectedId === nb.id;
                  const already = membership.includes(nb.id);
                  return (
                    <li key={nb.id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                          checked
                            ? 'border-brand bg-brand-soft/30'
                            : 'border-border hover:border-brand/40',
                        )}
                      >
                        <input
                          type="radio"
                          name="notebook"
                          className="mt-1 accent-brand"
                          checked={checked}
                          onChange={() => setSelectedId(nb.id)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-foreground">
                            {nb.title}
                            {nb.isDefault && (
                              <span className="ml-2 text-xs font-medium text-muted-foreground">
                                (mặc định)
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {nb.itemCount} mục
                            {already && ' · đã có mục này'}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {!creating ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setCreating(true)}
              >
                <Plus className="size-4" />
                Tạo sổ tay mới
              </Button>
            ) : (
              <div className="space-y-2 rounded-xl border border-dashed border-border p-3">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Tên sổ tay (vd. Kanji khó nhớ)"
                />
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả ngắn về sổ tay (tuỳ chọn)"
                  rows={2}
                  className="flex min-h-[60px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>
                    Hủy
                  </Button>
                  <Button type="button" size="sm" onClick={() => void handleCreateNotebook()}>
                    Tạo
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ghi chú cá nhân
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Nhớ bằng hình ảnh…, dễ nhầm với…"
                rows={3}
                className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Đóng
              </Button>
              <Button type="button" disabled={!selectedId} onClick={() => void handleAdd()}>
                Thêm vào sổ
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
