import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { EmptyState, emptyStatePresets } from '@/components/usable/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import {
  AdminStatPill,
  StaffListPageShell,
} from '../components/admin-page-shell';
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

  const load = useCallback(async () => {
    try {
      setCourses(await listCourses());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải khóa học');
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

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
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa khóa học và tất cả tiết học?')) return;
    try {
      await deleteCourse(id);
      toast.success('Đã xóa khóa học');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <>
      <StaffListPageShell
        title="Khóa học"
        description="Tạo lộ trình JLPT, quản lý visibility và đi nhanh vào gán nội dung tiết học."
        icon={GraduationCap}
        iconClassName="bg-quaternary"
        tone="quaternary"
        chips={['JLPT', 'Tiết học', 'Publish']}
        headerExtra={
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <AdminStatPill label="Hiển thị" value={`${filtered.length}/${courses.length}`} accent="brand" />
              <AdminStatPill label="Live" value={courses.filter((c) => c.isPublished).length} />
              <AdminStatPill
                label="Tiết"
                value={courses.reduce((sum, c) => sum + (c._count?.lessons ?? 0), 0)}
              />
            </div>
            <Button onClick={openCreate} className="w-full gap-2">
              <Plus className="size-4" />
              Thêm khóa học
            </Button>
          </div>
        }
        filters={
          <AdminListFilters onReset={hasFilters ? resetFilters : undefined} className="mt-0 border-0 bg-transparent p-0 shadow-none">
            <JlptLevelFilter value={jlptLevel} onChange={setJlptLevel} />
            <PublishedFilterSelect value={published} onChange={setPublished} />
            <AdminSearchFilter value={search} placeholder="Tên, mô tả…" onChange={setSearch} />
          </AdminListFilters>
        }
      >
      {filtered.length === 0 ? (
        <EmptyState
          {...emptyStatePresets.adminCourses}
          action={
            <Button type="button" onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              Thêm khóa học
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="h-full overflow-hidden bg-background transition-all hover:-translate-y-0.5 hover:shadow-premium-hover">
                <CardHeader className="border-b border-border bg-surface-paper">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-3">
                      <AppIcon icon={BookOpen} size="md" className="bg-quaternary" />
                      <div className="min-w-0">
                        <CardTitle className="line-clamp-2">{c.title}</CardTitle>
                        <p className="mt-1 text-xs font-semibold text-muted-foreground">
                          {c._count?.lessons ?? 0} tiết học
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Badge className="justify-center">{c.jlptLevel}</Badge>
                      <Badge variant={c.isPublished ? 'default' : 'outline'} className="justify-center gap-1">
                        {c.isPublished ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {c.isPublished ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {c.description ? (
                    <p className="line-clamp-3 text-sm font-medium leading-6 text-muted-foreground">
                      {c.description}
                    </p>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-border bg-surface-paper p-3 text-sm font-medium text-muted-foreground">
                      Chưa có mô tả. Thêm mô tả để học viên hiểu mục tiêu khóa học.
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={paths.admin.courseDetail(c.id)}
                      className={cn(buttonVariants({ size: 'sm' }), 'gap-1')}
                    >
                      Quản lý tiết
                      <ChevronRight className="size-4" />
                    </Link>
                    <div className="flex gap-1">
                      <Button size="icon-sm" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      </StaffListPageShell>

      <Dialog open={open} onOpenChange={setOpen} title={editing ? 'Sửa khóa học' : 'Thêm khóa học'}>
        <div className="grid gap-5">
          <section className="rounded-xl border border-border bg-surface-paper p-4">
            <div className="mb-3 flex items-center gap-2">
              <AppIcon icon={GraduationCap} size="sm" className="bg-quaternary" />
              <p className="font-display text-sm font-extrabold">Course identity</p>
            </div>
            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-bold">
                Tên khóa
                <Input
                  placeholder="VD: Khóa N5 cơ bản"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Cấp JLPT
                <select
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
                  value={form.jlptLevel}
                  onChange={(e) => setForm({ ...form, jlptLevel: e.target.value })}
                >
                  {JLPT_LEVELS.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Mô tả
                <textarea
                  className="min-h-[100px] rounded-lg border border-border bg-background p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Mục tiêu khóa học, đối tượng phù hợp, kết quả đầu ra…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center gap-2">
              <AppIcon icon={Settings2} size="sm" className="bg-tertiary" />
              <p className="font-display text-sm font-extrabold">Visibility settings</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-dashed border-border bg-surface-paper p-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              <span>
                <span className="block text-sm font-extrabold">Xuất bản khóa học</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
                  Khi bật, học viên có thể thấy khóa học sau khi nội dung đã sẵn sàng.
                </span>
              </span>
            </label>
          </section>

          <Button onClick={handleSave} className="w-full">
            Lưu khóa học
          </Button>
        </div>
      </Dialog>
    </>
  );
}
