import { BookOpen, LibraryBig, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  assignLessonVocabulary,
  createVocabulary,
  deleteVocabulary,
  listVocabulary,
  updateVocabulary,
  type VocabItem,
} from '../services/adminApi';

const emptyForm = {
  word: '',
  reading: '',
  meaning: '',
  meaningEn: '',
  partOfSpeech: '',
};

type Props = {
  lessonId: string;
  courseId: string;
  jlptLevel: string;
  items: VocabItem[];
  onUpdated: () => void;
};

export function LessonVocabularyPanel({ lessonId, courseId, jlptLevel, items, onUpdated }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<VocabItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pool, setPool] = useState<VocabItem[]>([]);

  const assignedIds = new Set(items.map((v) => v.id));

  async function openPicker() {
    try {
      const res = await listVocabulary({ jlptLevel, courseId, limit: 100, page: 1 });
      setPool(res.items.filter((v) => !assignedIds.has(v.id) && v.lessonId !== lessonId));
      setPickerOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải danh sách');
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(item: VocabItem) {
    setEditing(item);
    setForm({
      word: item.word,
      reading: item.reading ?? '',
      meaning: item.meaning,
      meaningEn: item.meaningEn ?? '',
      partOfSpeech: item.partOfSpeech ?? '',
    });
    setFormOpen(true);
  }

  async function assignIds(ids: string[]) {
    await assignLessonVocabulary(lessonId, ids);
    onUpdated();
  }

  async function handleAddFromPool(id: string) {
    try {
      await assignIds([...items.map((v) => v.id), id]);
      toast.success('Đã gán từ vựng');
      setPickerOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gán thất bại');
    }
  }

  async function handleUnlink(id: string) {
    if (!confirm('Gỡ từ khỏi tiết học?')) return;
    try {
      await assignIds(items.map((v) => v.id).filter((x) => x !== id));
      toast.success('Đã gỡ');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thất bại');
    }
  }

  async function handleSave() {
    const payload = {
      word: form.word,
      reading: form.reading || undefined,
      meaning: form.meaning,
      meaningEn: form.meaningEn || undefined,
      partOfSpeech: form.partOfSpeech || undefined,
      jlptLevel,
      courseId,
      lessonId,
    };
    try {
      if (editing) {
        await updateVocabulary(editing.id, payload);
        toast.success('Đã cập nhật');
      } else {
        const created = await createVocabulary(payload);
        await assignIds([...items.map((v) => v.id), created.id]);
        toast.success('Đã tạo và gán vào tiết');
      }
      setFormOpen(false);
      onUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDeleteGlobal(id: string) {
    if (!confirm('Xóa từ vựng khỏi hệ thống?')) return;
    try {
      await deleteVocabulary(id);
      toast.success('Đã xóa');
      onUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <Card className="overflow-hidden bg-background">
      <CardHeader className="border-b border-border bg-surface-paper">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AppIcon icon={BookOpen} size="md" className="bg-quaternary" />
            <div>
              <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                Vocabulary block
              </p>
              <CardTitle>Từ vựng ({items.length})</CardTitle>
            </div>
          </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openPicker}>
            Gán có sẵn
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Tạo mới
          </Button>
        </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {items.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-surface-paper px-5 py-8 text-center text-sm font-medium text-muted-foreground shadow-premium card-lift">
            Chưa có từ vựng trong tiết. Insert từ có sẵn hoặc tạo block mới.
          </p>
        ) : (
          <div className="grid gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium card-lift"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background font-mono text-xs font-black shadow-premium card-lift">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-jp text-2xl font-black">{item.word}</p>
                      {item.partOfSpeech && <Badge variant="outline">{item.partOfSpeech}</Badge>}
                      <Badge className="bg-quaternary text-quaternary-foreground">Assigned</Badge>
                    </div>
                    {item.reading && (
                      <p className="mt-1 font-jp text-sm font-bold text-primary">{item.reading}</p>
                    )}
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{item.meaning}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)} aria-label={`Sửa từ ${item.word}`}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleUnlink(item.id)}>
                      Gỡ
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteGlobal(item.id)} aria-label={`Xóa từ ${item.word}`}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Sửa từ vựng' : 'Tạo từ vựng'}>
        <div className="grid gap-4">
          <div className="rounded-xl border border-border bg-surface-paper p-4">
            <div className="mb-3 flex items-center gap-2">
              <AppIcon icon={BookOpen} size="sm" className="bg-quaternary" />
              <p className="font-display text-sm font-extrabold">Vocabulary properties</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Từ" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} />
              <Input placeholder="Cách đọc" value={form.reading} onChange={(e) => setForm({ ...form, reading: e.target.value })} />
              <Input placeholder="Nghĩa" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
              <Input placeholder="Loại từ" value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })} />
            </div>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              Auto assign: {jlptLevel} · tiết hiện tại
            </p>
          </div>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen} title="Gán từ vựng có sẵn (cùng khóa / chưa gán tiết)">
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-surface-paper p-3">
          <AppIcon icon={LibraryBig} size="sm" className="bg-tertiary" />
          <p className="text-sm font-bold text-muted-foreground">Library insert · chọn một block để gán vào lesson</p>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {pool.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không còn từ phù hợp.</p>
          ) : (
            pool.map((v) => (
              <div key={v.id} className="flex flex-col items-stretch gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-premium card-lift sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  <span className="font-jp font-medium">{v.word}</span> — {v.meaning}
                  {v.lesson && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (tiết {v.lesson.orderIndex})
                    </span>
                  )}
                </span>
                <Button size="sm" className="sm:shrink-0" onClick={() => handleAddFromPool(v.id)}>
                  Gán
                </Button>
              </div>
            ))
          )}
        </div>
      </Dialog>
    </Card>
  );
}
