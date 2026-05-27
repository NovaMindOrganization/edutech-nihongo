import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  assignLessonKanji,
  createKanji,
  deleteKanji,
  listKanji,
  updateKanji,
  type KanjiItem,
} from '../services/adminApi';

const emptyForm = { character: '', meaning: '', readingsOn: '', readingsKun: '' };

type Props = {
  lessonId: string;
  jlptLevel: string;
  items: KanjiItem[];
  onUpdated: () => void;
};

export function LessonKanjiPanel({ lessonId, jlptLevel, items, onUpdated }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<KanjiItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pool, setPool] = useState<KanjiItem[]>([]);

  const assignedIds = new Set(items.map((k) => k.id));

  async function openPicker() {
    try {
      const res = await listKanji({ jlptLevel, limit: 100, page: 1 });
      setPool(res.items.filter((k) => !assignedIds.has(k.id)));
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

  function openEdit(item: KanjiItem) {
    setEditing(item);
    setForm({
      character: item.character,
      meaning: item.meaning,
      readingsOn: item.readingsOn.join(', '),
      readingsKun: item.readingsKun.join(', '),
    });
    setFormOpen(true);
  }

  async function assignIds(ids: string[]) {
    await assignLessonKanji(lessonId, ids);
    onUpdated();
  }

  async function handleAddFromPool(id: string) {
    try {
      await assignIds([...items.map((k) => k.id), id]);
      toast.success('Đã gán kanji');
      setPickerOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gán thất bại');
    }
  }

  async function handleUnlink(id: string) {
    if (!confirm('Gỡ kanji khỏi tiết?')) return;
    try {
      await assignIds(items.map((k) => k.id).filter((x) => x !== id));
      toast.success('Đã gỡ');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thất bại');
    }
  }

  function parseReadings(raw: string) {
    return raw
      .split(/[,、\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSave() {
    const payload = {
      character: form.character,
      meaning: form.meaning,
      jlptLevel,
      readingsOn: parseReadings(form.readingsOn),
      readingsKun: parseReadings(form.readingsKun),
    };
    try {
      if (editing) {
        await updateKanji(editing.id, payload);
        toast.success('Đã cập nhật');
      } else {
        const created = await createKanji(payload);
        await assignIds([...items.map((k) => k.id), created.id]);
        toast.success('Đã tạo và gán');
      }
      setFormOpen(false);
      onUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDeleteGlobal(id: string) {
    if (!confirm('Xóa kanji khỏi hệ thống?')) return;
    try {
      await deleteKanji(id);
      toast.success('Đã xóa');
      onUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Kanji ({items.length})</CardTitle>
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
          <p className="p-5 text-sm text-muted-foreground">Chưa có kanji trong tiết.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="font-jp text-2xl font-medium">{item.character}</div>
              <div className="flex-1 text-sm">{item.meaning}</div>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Sửa kanji' : 'Tạo kanji'}>
        <div className="grid gap-3">
          <Input placeholder="Chữ kanji" value={form.character} onChange={(e) => setForm({ ...form, character: e.target.value })} />
          <Input placeholder="Nghĩa" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
          <Input placeholder="Âm On (cách nhau dấu phẩy)" value={form.readingsOn} onChange={(e) => setForm({ ...form, readingsOn: e.target.value })} />
          <Input placeholder="Âm Kun" value={form.readingsKun} onChange={(e) => setForm({ ...form, readingsKun: e.target.value })} />
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen} title="Gán kanji có sẵn">
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {pool.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="font-jp text-lg">{k.character}</span>
              <span className="flex-1 text-muted-foreground">{k.meaning}</span>
              <Button size="sm" onClick={() => handleAddFromPool(k.id)}>
                Gán
              </Button>
            </div>
          ))}
        </div>
      </Dialog>
    </Card>
  );
}
