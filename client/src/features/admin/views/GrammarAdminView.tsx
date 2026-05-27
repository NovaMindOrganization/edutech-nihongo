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
import { JLPT_ALL } from '../constants';
import {
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
  jlptLevel: 'N5',
  sourceLesson: '',
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
  const [sourceLesson, setSourceLesson] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await listGrammar({
        page,
        limit: 30,
        ...(jlptLevel ? { jlptLevel } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(sourceLesson ? { lesson: Number(sourceLesson) } : {}),
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    }
  }, [page, jlptLevel, search, sourceLesson]);

  useEffect(() => {
    load();
  }, [load]);

  function resetFilters() {
    setJlptLevel(JLPT_ALL);
    setSearch('');
    setSourceLesson('');
    setPage(1);
  }

  const hasFilters = Boolean(jlptLevel || search.trim() || sourceLesson);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: GrammarItem) {
    setEditing(item);
    setForm({
      pattern: item.pattern,
      meaning: item.meaning,
      meaningEn: item.meaningEn ?? '',
      structure: item.structure ?? '',
      grammarType: item.grammarType ?? '',
      jlptLevel: item.jlptLevel,
      sourceLesson: item.sourceLesson?.toString() ?? '',
    });
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      pattern: form.pattern,
      meaning: form.meaning,
      meaningEn: form.meaningEn || undefined,
      structure: form.structure || undefined,
      grammarType: form.grammarType || undefined,
      jlptLevel: form.jlptLevel,
      sourceLesson: form.sourceLesson ? Number(form.sourceLesson) : undefined,
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
          value={sourceLesson}
          onChange={(v) => {
            setSourceLesson(v);
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
                <div className="min-w-[140px] font-jp font-medium text-primary">{item.pattern}</div>
                <div className="flex-1 text-sm">{item.meaning}</div>
                <Badge variant="outline">{item.jlptLevel}</Badge>
                {item.sourceLesson != null && <Badge variant="outline">Bài {item.sourceLesson}</Badge>}
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
          <Input placeholder="Mẫu (～は～です)" value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
          <Input placeholder="Nghĩa VI" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
          <Input placeholder="Cấu trúc" value={form.structure} onChange={(e) => setForm({ ...form, structure: e.target.value })} />
          <Input placeholder="Loại" value={form.grammarType} onChange={(e) => setForm({ ...form, grammarType: e.target.value })} />
          <Input placeholder="Bài" value={form.sourceLesson} onChange={(e) => setForm({ ...form, sourceLesson: e.target.value })} />
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>
    </div>
  );
}
