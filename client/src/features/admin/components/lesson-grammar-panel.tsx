import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  assignLessonGrammar,
  createGrammar,
  deleteGrammar,
  listGrammar,
  updateGrammar,
  type GrammarItem,
} from '../services/adminApi';

const emptyForm = {
  pattern: '',
  meaning: '',
  meaningEn: '',
  structure: '',
  grammarType: '',
};

type Props = {
  lessonId: string;
  jlptLevel: string;
  items: GrammarItem[];
  onUpdated: () => void;
};

export function LessonGrammarPanel({ lessonId, jlptLevel, items, onUpdated }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<GrammarItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pool, setPool] = useState<GrammarItem[]>([]);

  const assignedIds = new Set(items.map((g) => g.id));

  async function openPicker() {
    try {
      const res = await listGrammar({ jlptLevel, limit: 100, page: 1 });
      setPool(res.items.filter((g) => !assignedIds.has(g.id)));
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

  function openEdit(item: GrammarItem) {
    setEditing(item);
    setForm({
      pattern: item.pattern,
      meaning: item.meaning,
      meaningEn: item.meaningEn ?? '',
      structure: item.structure ?? '',
      grammarType: item.grammarType ?? '',
    });
    setFormOpen(true);
  }

  async function assignIds(ids: string[]) {
    await assignLessonGrammar(lessonId, ids);
    onUpdated();
  }

  async function handleAddFromPool(id: string) {
    try {
      await assignIds([...items.map((g) => g.id), id]);
      toast.success('Đã gán ngữ pháp vào tiết');
      setPickerOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gán thất bại');
    }
  }

  async function handleUnlink(id: string) {
    if (!confirm('Gỡ mục ngữ pháp khỏi tiết học?')) return;
    try {
      await assignIds(items.map((g) => g.id).filter((x) => x !== id));
      toast.success('Đã gỡ khỏi tiết');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thất bại');
    }
  }

  async function handleSave() {
    const payload = {
      pattern: form.pattern,
      meaning: form.meaning,
      meaningEn: form.meaningEn || undefined,
      structure: form.structure || undefined,
      grammarType: form.grammarType || undefined,
      jlptLevel,
    };
    try {
      if (editing) {
        await updateGrammar(editing.id, payload);
        toast.success('Đã cập nhật');
      } else {
        const created = await createGrammar(payload);
        await assignIds([...items.map((g) => g.id), created.id]);
        toast.success('Đã tạo và gán vào tiết');
      }
      setFormOpen(false);
      onUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDeleteGlobal(id: string) {
    if (!confirm('Xóa hẳn mẫu ngữ pháp khỏi hệ thống?')) return;
    try {
      await deleteGrammar(id);
      toast.success('Đã xóa');
      onUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Ngữ pháp ({items.length})</CardTitle>
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
          <p className="p-5 text-sm text-muted-foreground">Chưa có mẫu ngữ pháp trong tiết.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="min-w-[140px] font-jp font-medium">{item.pattern}</div>
              <div className="flex-1 text-sm">{item.meaning}</div>
              {item.grammarType && <Badge variant="outline">{item.grammarType}</Badge>}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Sửa ngữ pháp' : 'Tạo ngữ pháp'}>
        <div className="grid gap-3">
          <Input placeholder="Mẫu (pattern)" value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
          <Input placeholder="Nghĩa" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
          <Input placeholder="Cấu trúc" value={form.structure} onChange={(e) => setForm({ ...form, structure: e.target.value })} />
          <Input placeholder="Loại" value={form.grammarType} onChange={(e) => setForm({ ...form, grammarType: e.target.value })} />
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen} title="Gán ngữ pháp có sẵn" className="max-w-2xl">
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {pool.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không còn mục {jlptLevel} chưa gán.</p>
          ) : (
            pool.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                <span>
                  <span className="font-jp font-medium">{g.pattern}</span> — {g.meaning}
                </span>
                <Button size="sm" onClick={() => handleAddFromPool(g.id)}>
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
