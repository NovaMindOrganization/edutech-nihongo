import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Từ vựng ({items.length})</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openPicker}>
            Gán có sẵn
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Tạo mới
          </Button>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-border/60 p-0">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Chưa có từ vựng trong tiết.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="min-w-[100px] font-jp text-lg font-medium">{item.word}</div>
              <div className="text-sm text-muted-foreground">{item.reading}</div>
              <div className="flex-1 text-sm">{item.meaning}</div>
              {item.partOfSpeech && <Badge variant="outline">{item.partOfSpeech}</Badge>}
              <div className="flex gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => handleUnlink(item.id)}>
                  Gỡ
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteGlobal(item.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Sửa từ vựng' : 'Tạo từ vựng'}>
        <div className="grid gap-3">
          <Input placeholder="Từ" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} />
          <Input placeholder="Cách đọc" value={form.reading} onChange={(e) => setForm({ ...form, reading: e.target.value })} />
          <Input placeholder="Nghĩa" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
          <Input placeholder="Loại từ" value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })} />
          <p className="text-xs text-muted-foreground">
            Tự gán khóa {jlptLevel} · tiết hiện tại
          </p>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen} title="Gán từ vựng có sẵn (cùng khóa / chưa gán tiết)">
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {pool.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không còn từ phù hợp.</p>
          ) : (
            pool.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                <span>
                  <span className="font-jp font-medium">{v.word}</span> — {v.meaning}
                  {v.lesson && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (tiết {v.lesson.orderIndex})
                    </span>
                  )}
                </span>
                <Button size="sm" onClick={() => handleAddFromPool(v.id)}>
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
