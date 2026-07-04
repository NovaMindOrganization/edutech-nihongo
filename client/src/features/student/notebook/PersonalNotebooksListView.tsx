import { BookMarked, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { FadeUp } from '@/components/motion';
import { HubLinkCard } from '@/components/usable/hub-link-card';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { LoadingState } from '@/components/usable/states';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  createUserNotebook,
  deleteUserNotebook,
  listUserNotebooks,
  updateUserNotebook,
} from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { POOL_CARD_META } from './notebook-shared';
import { POOL_LABELS, POOL_TAGLINES } from './notebook-types';

type UserNotebookSummary = {
  id: string;
  title: string;
  description: string | null;
  isDefault: boolean;
  itemCount: number;
};

export function PersonalNotebooksListView() {
  const [notebooks, setNotebooks] = useState<UserNotebookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserNotebookSummary | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUserNotebooks();
      setNotebooks(res.notebooks as UserNotebookSummary[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được sổ tay');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function handleCreate() {
    const t = title.trim();
    if (!t) return;
    try {
      await createUserNotebook({ title: t, description: description.trim() || undefined });
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tạo được sổ tay');
    }
  }

  async function handleUpdate() {
    if (!editTarget) return;
    const t = title.trim();
    if (!t) return;
    try {
      await updateUserNotebook(editTarget.id, {
        title: t,
        description: description.trim() || null,
      });
      setEditTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không lưu được');
    }
  }

  async function handleDelete(nb: UserNotebookSummary) {
    if (!window.confirm(`Xóa sổ tay "${nb.title}"? Các mục bên trong cũng sẽ mất.`)) return;
    try {
      await deleteUserNotebook(nb.id);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không xóa được');
    }
  }

  const meta = POOL_CARD_META.collected;

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Sổ tay"
      title={POOL_LABELS.collected}
      description="Tạo nhiều sổ tay riêng — gom kanji, từ vựng, ngữ pháp và ghi chú cách học của bạn."
      icon={meta.icon}
      iconClassName={meta.accent}
      badgeClassName={meta.accent}
      tone="secondary"
      chips={['Kanji', 'Từ vựng', 'Ngữ pháp', 'Ghi chú']}
      footer={POOL_TAGLINES.collected}
      backLink={{ to: paths.student.notebook, label: 'Sổ tay' }}
      actions={
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Sổ tay mới
        </Button>
      }
    >
      <FadeUp className="space-y-5">
        {loading ? (
          <LoadingState label="Đang tải sổ tay…" variant="panel" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notebooks.map((nb) => (
              <div key={nb.id} className="relative">
                <HubLinkCard
                  to={paths.student.notebookPersonal(nb.id, 'kanji')}
                  icon={BookMarked}
                  accent={meta.accent}
                  title={nb.title}
                  description={
                    nb.description?.trim() ||
                    `${nb.itemCount} mục · Kanji · Từ vựng · Ngữ pháp`
                  }
                  cta="Mở sổ tay"
                />
                <div className="absolute right-3 top-3 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 bg-background/80 text-xs font-bold"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditTarget(nb);
                      setTitle(nb.title);
                      setDescription(nb.description ?? '');
                    }}
                  >
                    Sửa
                  </Button>
                  {!nb.isDefault && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 bg-background/80 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        void handleDelete(nb);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Thêm mục từ bài học bằng nút{' '}
          <span className="font-bold text-foreground">Thêm vào sổ tay</span> hoặc từ{' '}
          <Link to={paths.student.ocr} className="font-bold text-brand underline-offset-2 hover:underline">
            OCR
          </Link>
          .
        </p>
      </FadeUp>

      <Dialog open={createOpen} onOpenChange={setCreateOpen} title="Tạo sổ tay mới" className="max-w-md">
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên sổ tay" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả / mục tiêu học (vd. Ôn trước thi, từ khó nhớ…)"
            rows={3}
            className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void handleCreate()}>Tạo</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Sửa sổ tay"
        className="max-w-md"
      >
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên sổ tay" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả sổ tay"
            rows={3}
            className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Hủy
            </Button>
            <Button onClick={() => void handleUpdate()}>Lưu</Button>
          </div>
        </div>
      </Dialog>
    </PageShell>
  );
}
