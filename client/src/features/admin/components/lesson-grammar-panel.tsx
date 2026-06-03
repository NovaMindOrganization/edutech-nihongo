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

type ExampleItem = { jp: string; vi: string; reading?: string; en?: string };
type QuizItem = { question: string; choices: string[]; answer: number };

const emptyForm = {
  title: '',
  type: '',
  pattern: '',
  meaningVi: '',
  usage: '',
  notes: '',
  examplesItems: [] as ExampleItem[],
  quizItems: [] as QuizItem[],
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
      const res = await listGrammar({ jlpt: jlptLevel, limit: 100, page: 1 });
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
    const examples = item.examples ?? [];
    const quiz = item.quiz ?? [];
    setForm({
      title: item.title,
      type: item.type ?? '',
      pattern: item.pattern,
      meaningVi: item.meaningVi,
      usage: item.usage ?? '',
      notes: item.notes ?? '',
      examplesItems: examples,
      quizItems: quiz,
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
    const examples = form.examplesItems;
    const quiz = form.quizItems;
    const payload = {
      title: form.title,
      jlpt: jlptLevel,
      type: form.type || undefined,
      pattern: form.pattern,
      meaningVi: form.meaningVi,
      usage: form.usage || undefined,
      notes: form.notes || undefined,
      examples: examples.length > 0 ? examples : undefined,
      quiz: quiz.length > 0 ? quiz : undefined,
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
              <div className="min-w-[160px]">
                <p className="font-medium">{item.title}</p>
                <p className="font-jp text-sm text-muted-foreground">{item.pattern}</p>
              </div>
              <div className="flex-1 text-sm">{item.meaningVi}</div>
              {item.type && <Badge variant="outline">{item.type}</Badge>}
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
          <Input placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Loại" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Input placeholder="Mẫu (pattern)" value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
          <Input placeholder="Nghĩa (VI)" value={form.meaningVi} onChange={(e) => setForm({ ...form, meaningVi: e.target.value })} />
          <Input placeholder="Usage" value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })} />
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="rounded-md border border-border/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Examples</p>
            </div>
            <div className="space-y-2">
              {form.examplesItems.map((ex, idx) => (
                <div key={idx} className="grid gap-2 md:grid-cols-2">
                  <Input
                    placeholder="JP"
                    value={ex.jp}
                    onChange={(e) => {
                      const next = [...form.examplesItems];
                      next[idx] = { ...ex, jp: e.target.value };
                      setForm({ ...form, examplesItems: next });
                    }}
                  />
                  <Input
                    placeholder="VI"
                    value={ex.vi}
                    onChange={(e) => {
                      const next = [...form.examplesItems];
                      next[idx] = { ...ex, vi: e.target.value };
                      setForm({ ...form, examplesItems: next });
                    }}
                  />
                  <Input
                    placeholder="Reading (optional)"
                    value={ex.reading ?? ''}
                    onChange={(e) => {
                      const next = [...form.examplesItems];
                      next[idx] = { ...ex, reading: e.target.value || undefined };
                      setForm({ ...form, examplesItems: next });
                    }}
                  />
                  <Input
                    placeholder="EN (optional)"
                    value={ex.en ?? ''}
                    onChange={(e) => {
                      const next = [...form.examplesItems];
                      next[idx] = { ...ex, en: e.target.value || undefined };
                      setForm({ ...form, examplesItems: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        examplesItems: form.examplesItems.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    Xóa ví dụ
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    examplesItems: [...form.examplesItems, { jp: '', vi: '' }],
                  })
                }
              >
                Thêm ví dụ
              </Button>
            </div>
          </div>
          <div className="rounded-md border border-border/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Quiz</p>
            </div>
            <div className="space-y-2">
              {form.quizItems.map((q, idx) => (
                <div key={idx} className="grid gap-2">
                  <Input
                    placeholder="Câu hỏi"
                    value={q.question}
                    onChange={(e) => {
                      const next = [...form.quizItems];
                      next[idx] = { ...q, question: e.target.value };
                      setForm({ ...form, quizItems: next });
                    }}
                  />
                  <Input
                    placeholder="Choices (phân tách bằng dấu phẩy)"
                    value={q.choices.join(', ')}
                    onChange={(e) => {
                      const next = [...form.quizItems];
                      next[idx] = {
                        ...q,
                        choices: e.target.value
                          .split(',')
                          .map((c) => c.trim())
                          .filter(Boolean),
                      };
                      setForm({ ...form, quizItems: next });
                    }}
                  />
                  <Input
                    placeholder="Đáp án (index)"
                    value={Number.isFinite(q.answer) ? String(q.answer) : ''}
                    onChange={(e) => {
                      const next = [...form.quizItems];
                      const value = Number(e.target.value);
                      next[idx] = { ...q, answer: Number.isNaN(value) ? 0 : value };
                      setForm({ ...form, quizItems: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        quizItems: form.quizItems.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    Xóa quiz
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    quizItems: [...form.quizItems, { question: '', choices: [], answer: 0 }],
                  })
                }
              >
                Thêm quiz
              </Button>
            </div>
          </div>
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
                  <span className="font-medium">{g.title}</span> — {g.pattern}
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
