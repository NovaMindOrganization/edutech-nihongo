import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  AdminListFilters,
  AdminSearchFilter,
  JlptLevelFilter,
  SourceLessonFilter,
} from '../components/admin-list-filters';
import { CourseLessonSelector } from '../components/course-lesson-selector';
import { JLPT_ALL } from '../constants';
import {
  createGrammar,
  deleteGrammar,
  listGrammar,
  updateGrammar,
  type GrammarItem,
} from '../services/adminApi';

type ExampleItem = { jp: string; vi: string; reading?: string | null; en?: string | null };
type QuizItem = { question: string; choices: string[]; answer: number };

const emptyForm = {
  title: '',
  jlpt: 'N5',
  type: '',
  pattern: '',
  meaningVi: '',
  usage: '',
  notes: '',
  lessonId: '',
  order: '',
  examplesItems: [] as ExampleItem[],
  quizItems: [] as QuizItem[],
};

export function GrammarAdminView() {
  const [items, setItems] = useState<GrammarItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GrammarItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [jlptLevel, setJlptLevel] = useState(JLPT_ALL);
  const [search, setSearch] = useState('');
  const [lessonId, setLessonId] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await listGrammar({
        page,
        limit: 30,
        ...(jlptLevel ? { jlpt: jlptLevel } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(lessonId.trim() ? { lessonId: lessonId.trim() } : {}),
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    }
  }, [page, jlptLevel, search, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  function resetFilters() {
    setJlptLevel(JLPT_ALL);
    setSearch('');
    setLessonId('');
    setPage(1);
  }

  const hasFilters = Boolean(jlptLevel || search.trim() || lessonId.trim());

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: GrammarItem) {
    setEditing(item);
    const examples = item.examples ?? [];
    const quiz = item.quiz ?? [];
    setForm({
      title: item.title,
      jlpt: item.jlpt,
      type: item.type ?? '',
      pattern: item.pattern,
      meaningVi: item.meaningVi,
      usage: item.usage ?? '',
      notes: item.notes ?? '',
      lessonId: item.lessonId ?? '',
      order: item.order?.toString() ?? '',
      examplesItems: examples,
      quizItems: quiz,
    });
    setOpen(true);
  }

  async function handleSave() {
    const examples = form.examplesItems;
    const quiz = form.quizItems;
    const payload = {
      title: form.title,
      jlpt: form.jlpt,
      type: form.type || undefined,
      pattern: form.pattern,
      meaningVi: form.meaningVi,
      usage: form.usage || undefined,
      notes: form.notes || undefined,
      lessonId: form.lessonId || undefined,
      order: form.order ? Number(form.order) : undefined,
      examples: examples.length > 0 ? examples : undefined,
      quiz: quiz.length > 0 ? quiz : undefined,
    };
    try {
      if (editing) {
        await updateGrammar(editing.id, payload);
        toast.success('Đã cập nhật ngữ pháp');
      } else {
        await createGrammar(payload);
        toast.success('Đã thêm ngữ pháp');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa mẫu ngữ pháp này?')) return;
    try {
      await deleteGrammar(id);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Ngữ pháp</h1>
          <p className="text-sm text-muted-foreground">{total} mẫu</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Thêm mẫu
        </Button>
      </div>

      <AdminListFilters onReset={hasFilters ? resetFilters : undefined}>
        <JlptLevelFilter
          value={jlptLevel}
          onChange={(v) => {
            setJlptLevel(v);
            setPage(1);
          }}
        />
        <AdminSearchFilter
          value={search}
          placeholder="Mẫu, nghĩa, cấu trúc…"
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <SourceLessonFilter
          value={lessonId}
          onChange={(v) => {
            setLessonId(v);
            setPage(1);
          }}
        />
      </AdminListFilters>

      <Card className="mt-6">
        <CardContent className="divide-y divide-border/60 p-0">
          {items.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Không có kết quả.</p>
          ) : (
            items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex flex-wrap items-start gap-3 px-5 py-4 hover:bg-muted/40"
              >
                <div className="min-w-[160px]">
                  <p className="font-medium text-primary">{item.title}</p>
                  <p className="font-jp text-sm text-muted-foreground">{item.pattern}</p>
                </div>
                <div className="flex-1 text-sm">{item.meaningVi}</div>
                <Badge variant="outline">{item.jlpt}</Badge>
                {item.type && <Badge variant="outline">{item.type}</Badge>}
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </Button>
        <span className="flex items-center text-sm">
          Trang {page} / {Math.max(1, Math.ceil(total / 30))}
        </span>
        <Button variant="outline" disabled={page * 30 >= total} onClick={() => setPage((p) => p + 1)}>
          Sau
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen} title={editing ? 'Sửa ngữ pháp' : 'Thêm ngữ pháp'}>
        <div className="grid gap-3">
          <Input placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="JLPT (N5)" value={form.jlpt} onChange={(e) => setForm({ ...form, jlpt: e.target.value })} />
          <Input placeholder="Loại" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Input placeholder="Mẫu (pattern)" value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
          <Input placeholder="Nghĩa (VI)" value={form.meaningVi} onChange={(e) => setForm({ ...form, meaningVi: e.target.value })} />
          <CourseLessonSelector
            className="rounded-lg border bg-background px-3 py-2 text-sm"
            value={form.lessonId}
            onChange={(lessonIdValue) => setForm({ ...form, lessonId: lessonIdValue })}
          />
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
          <Input placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>
    </div>
  );
}
