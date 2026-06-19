import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  assignLessonConversations,
  createConversation,
  deleteConversation,
  listConversations,
  updateConversation,
  type ConversationItem,
} from '../services/adminApi';

const defaultDialogue =
  '[{"speaker":"A","text":"こんにちは。","translation":"Xin chào."},{"speaker":"B","text":"こんにちは。","translation":"Xin chào."}]';

type Props = {
  lessonId: string;
  jlptLevel: string;
  items: ConversationItem[];
  onUpdated: () => void;
};

export function LessonConversationsPanel({ lessonId, jlptLevel, items, onUpdated }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<ConversationItem | null>(null);
  const [title, setTitle] = useState('');
  const [lines, setLines] = useState(defaultDialogue);
  const [pool, setPool] = useState<ConversationItem[]>([]);

  const assignedIds = new Set(items.map((c) => c.id));

  async function openPicker() {
    try {
      const res = await listConversations({ jlptLevel, limit: '100' });
      setPool(res.items.filter((c) => !assignedIds.has(c.id)));
      setPickerOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải danh sách');
    }
  }

  function openCreate() {
    setEditing(null);
    setTitle('Hội thoại mới');
    setLines(defaultDialogue);
    setFormOpen(true);
  }

  function openEdit(item: ConversationItem) {
    setEditing(item);
    setTitle(item.title ?? '');
    setLines(JSON.stringify(item.dialogue, null, 2));
    setFormOpen(true);
  }

  async function assignIds(ids: string[]) {
    await assignLessonConversations(lessonId, ids);
    onUpdated();
  }

  async function handleAddFromPool(id: string) {
    try {
      await assignIds([...items.map((c) => c.id), id]);
      toast.success('Đã gán hội thoại');
      setPickerOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gán thất bại');
    }
  }

  async function handleUnlink(id: string) {
    if (!confirm('Gỡ hội thoại khỏi tiết?')) return;
    try {
      await assignIds(items.map((c) => c.id).filter((x) => x !== id));
      toast.success('Đã gỡ');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thất bại');
    }
  }

  async function handleSave() {
    try {
      const dialogue = JSON.parse(lines) as Array<{ speaker: string; text: string }>;
      if (editing) {
        await updateConversation(editing.id, { title, dialogue, jlptLevel });
        toast.success('Đã cập nhật');
      } else {
        const created = await createConversation({ title, dialogue, jlptLevel });
        await assignIds([...items.map((c) => c.id), created.id]);
        toast.success('Đã tạo và gán');
      }
      setFormOpen(false);
      onUpdated();
    } catch {
      toast.error('JSON dialogue không hợp lệ');
    }
  }

  async function handleDeleteGlobal(id: string) {
    if (!confirm('Xóa hội thoại khỏi hệ thống?')) return;
    try {
      await deleteConversation(id);
      toast.success('Đã xóa');
      onUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Hội thoại mẫu ({items.length})</CardTitle>
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
          <p className="p-5 text-sm text-muted-foreground">Chưa có hội thoại trong tiết.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div>
                <p className="font-medium">{item.title ?? item.id}</p>
                <p className="text-xs text-muted-foreground">
                  {Array.isArray(item.dialogue) ? `${(item.dialogue as unknown[]).length} câu` : '—'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)} aria-label={`Sửa hội thoại ${item.title ?? item.id}`}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleUnlink(item.id)}>
                  Gỡ
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteGlobal(item.id)} aria-label={`Xóa hội thoại ${item.title ?? item.id}`}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Sửa hội thoại' : 'Tạo hội thoại'} className="max-w-2xl">
        <div className="grid gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />
          <textarea
            className="min-h-[200px] w-full rounded-md border bg-background p-2 font-mono text-xs"
            value={lines}
            onChange={(e) => setLines(e.target.value)}
          />
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen} title="Gán hội thoại có sẵn">
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {pool.map((c) => (
            <div key={c.id} className="flex flex-col items-stretch gap-2 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{c.title ?? c.id}</span>
              <Button size="sm" className="sm:shrink-0" onClick={() => handleAddFromPool(c.id)}>
                Gán
              </Button>
            </div>
          ))}
        </div>
      </Dialog>
    </Card>
  );
}
