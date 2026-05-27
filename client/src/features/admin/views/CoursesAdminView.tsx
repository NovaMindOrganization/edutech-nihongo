import { motion } from 'framer-motion';
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import {
  AdminListFilters,
  AdminSearchFilter,
  JlptLevelFilter,
  PublishedFilterSelect,
} from '../components/admin-list-filters';
import { JLPT_ALL, JLPT_LEVELS, type PublishedFilter } from '../constants';
import {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
  type CourseItem,
} from '../services/adminApi';

const emptyForm = {
  title: '',
  jlptLevel: 'N5',
  description: '',
  isPublished: false,
};

export function CoursesAdminView() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [jlptLevel, setJlptLevel] = useState(JLPT_ALL);
  const [search, setSearch] = useState('');
  const [published, setPublished] = useState<PublishedFilter>('');

  async function load() {
    try {
      setCourses(await listCourses());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải khóa học');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (jlptLevel && c.jlptLevel !== jlptLevel) return false;
      if (published === 'published' && !c.isPublished) return false;
      if (published === 'draft' && c.isPublished) return false;
      if (q && !c.title.toLowerCase().includes(q) && !(c.description ?? '').toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [courses, jlptLevel, search, published]);

  function resetFilters() {
    setJlptLevel(JLPT_ALL);
    setSearch('');
    setPublished('');
  }

  const hasFilters = Boolean(jlptLevel || search.trim() || published);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(course: CourseItem) {
    setEditing(course);
    setForm({
      title: course.title,
      jlptLevel: course.jlptLevel,
      description: course.description ?? '',
      isPublished: course.isPublished,
    });
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      title: form.title,
      jlptLevel: form.jlptLevel,
      description: form.description || undefined,
      isPublished: form.isPublished,
    };
    try {
      if (editing) {
        await updateCourse(editing.id, payload);
        toast.success('Đã cập nhật khóa học');
      } else {
        await createCourse(payload);
        toast.success('Đã tạo khóa học');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa khóa học và tất cả tiết học?')) return;
    try {
      await deleteCourse(id);
      toast.success('Đã xóa khóa học');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Khóa học</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length}/{courses.length} khóa — mỗi khóa gồm nhiều tiết
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Thêm khóa học
        </Button>
      </div>

      <AdminListFilters onReset={hasFilters ? resetFilters : undefined}>
        <JlptLevelFilter value={jlptLevel} onChange={setJlptLevel} />
        <PublishedFilterSelect value={published} onChange={setPublished} />
        <AdminSearchFilter value={search} placeholder="Tên, mô tả…" onChange={setSearch} />
      </AdminListFilters>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Không có khóa học phù hợp.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{c.title}</CardTitle>
                    <div className="flex gap-1">
                      <Badge>{c.jlptLevel}</Badge>
                      {c.isPublished && <Badge variant="outline">Live</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{c._count?.lessons ?? 0} tiết học</p>
                  {c.description && <p className="mt-2 line-clamp-2 text-sm">{c.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={paths.admin.courseDetail(c.id)}
                      className={cn(buttonVariants({ size: 'sm' }), 'gap-1')}
                    >
                      Quản lý tiết
                      <ChevronRight className="size-4" />
                    </Link>
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen} title={editing ? 'Sửa khóa học' : 'Thêm khóa học'}>
        <div className="grid gap-3">
          <Input
            placeholder="Tên khóa (vd: Khóa N5 cơ bản)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="rounded-lg border bg-background px-3 py-2 text-sm"
            value={form.jlptLevel}
            onChange={(e) => setForm({ ...form, jlptLevel: e.target.value })}
          >
            {JLPT_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          <textarea
            className="min-h-[80px] rounded-lg border bg-background p-2 text-sm"
            placeholder="Mô tả (tuỳ chọn)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Xuất bản ngay
          </label>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>
    </div>
  );
}
