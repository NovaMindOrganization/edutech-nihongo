import {
  ArrowLeft,
  BookOpenCheck,
  ChevronRight,
  Eye,
  EyeOff,
  ListChecks,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import {
  createLesson,
  deleteLesson,
  getCourse,
  updateCourse,
  updateLesson,
  type CourseDetail,
  type LessonSummary,
} from '../services/adminApi';

const emptyLesson = {
  title: '',
  orderIndex: '1',
  passThreshold: '70',
  isBonus: false,
};

export function CourseLessonsAdminView() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LessonSummary | null>(null);
  const [form, setForm] = useState(emptyLesson);

  const load = useCallback(async () => {
    try {
      setCourse(await getCourse(courseId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được khóa học');
      navigate(paths.admin.courses);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  function openCreate() {
    const nextOrder = (course?.lessons.length ?? 0) + 1;
    setEditing(null);
    setForm({ ...emptyLesson, orderIndex: String(nextOrder) });
    setOpen(true);
  }

  function openEdit(lesson: LessonSummary) {
    setEditing(lesson);
    setForm({
      title: lesson.title,
      orderIndex: String(lesson.orderIndex),
      passThreshold: String(lesson.passThreshold),
      isBonus: lesson.isBonus,
    });
    setOpen(true);
  }

  async function handleSaveLesson() {
    const payload = {
      title: form.title,
      orderIndex: Number(form.orderIndex),
      passThreshold: Number(form.passThreshold),
      isBonus: form.isBonus,
    };
    try {
      if (editing) {
        await updateLesson(editing.id, payload);
        toast.success('Đã cập nhật tiết');
      } else {
        await createLesson({ courseId, ...payload });
        toast.success('Đã thêm tiết học');
      }
      setOpen(false);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm('Xóa tiết học và toàn bộ nội dung gán?')) return;
    try {
      await deleteLesson(id);
      toast.success('Đã xóa tiết');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  async function togglePublish() {
    if (!course) return;
    try {
      await updateCourse(course.id, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Đã ẩn khóa' : 'Đã xuất bản');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  }

  if (!course) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        to={paths.admin.courses}
        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Khóa học
      </Link>

      <section className="rounded-xl border border-border bg-surface-paper p-5 shadow-premium card-lift">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AppIcon icon={BookOpenCheck} size="lg" active />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{course.jlptLevel}</Badge>
                <Badge variant={course.isPublished ? 'default' : 'outline'} className="gap-1">
                  {course.isPublished ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                  {course.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">{course.title}</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
                {course.lessons.length} tiết học — tạo lesson, chỉnh thứ tự, rồi mở từng lesson để gán nội dung.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg border border-border bg-background p-3 shadow-premium card-lift">
                <p className="font-mono text-lg font-black">{course.lessons.length}</p>
                <p className="font-bold text-muted-foreground">Lessons</p>
              </div>
              <div className="rounded-lg border border-border bg-tertiary/20 p-3 shadow-premium card-lift">
                <p className="font-mono text-lg font-black">
                  {course.lessons.filter((lesson) => lesson.isBonus).length}
                </p>
                <p className="font-bold text-muted-foreground">Bonus</p>
              </div>
            </div>
            <Button variant="outline" onClick={togglePublish} className="gap-2">
              {course.isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {course.isPublished ? 'Ẩn khóa' : 'Xuất bản'}
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              Thêm tiết
            </Button>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden bg-background">
        <CardContent className="p-0">
          <div className="border-b border-border bg-surface-paper p-4">
            <div className="flex items-center gap-3">
              <AppIcon icon={ListChecks} size="md" className="bg-quaternary" />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                  Lesson assignment workflow
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Dùng nút Nội dung để gán Vocabulary, Grammar, Kanji, Conversation và AI Speaking prompt.
                </p>
              </div>
            </div>
          </div>
          {course.lessons.length === 0 ? (
            <p className="p-8 text-center text-sm font-medium text-muted-foreground">
              Chưa có tiết học. Thêm tiết đầu tiên để bắt đầu tổ chức nội dung.
            </p>
          ) : (
            <div className="grid gap-3 p-4">
              {course.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium card-lift"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background font-display text-sm font-extrabold shadow-premium card-lift">
                    #{lesson.orderIndex}
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-extrabold">{lesson.title}</p>
                      {lesson.isBonus && <Badge className="bg-tertiary text-tertiary-foreground">Bonus</Badge>}
                      {lesson.speakingPrompt && <Badge variant="outline">AI prompt</Badge>}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Pass threshold {lesson.passThreshold}% · Sequential {lesson.isBonus ? 'optional' : 'required'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(lesson)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteLesson(lesson.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                    <Link
                      to={paths.admin.lessonDetail(courseId, lesson.id)}
                      className={cn(buttonVariants({ size: 'sm' }), 'gap-1')}
                    >
                      Nội dung
                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen} title={editing ? 'Sửa tiết học' : 'Thêm tiết học'}>
        <div className="grid gap-5">
          <section className="rounded-xl border border-border bg-surface-paper p-4">
            <div className="mb-3 flex items-center gap-2">
              <AppIcon icon={Sparkles} size="sm" className="bg-quaternary" />
              <p className="font-display text-sm font-extrabold">Lesson setup</p>
            </div>
            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-bold">
                Tên tiết
                <Input
                  placeholder="VD: Chào hỏi cơ bản"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold">
                  Thứ tự
                  <Input
                    placeholder="Thứ tự"
                    type="number"
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  Ngưỡng đạt MiniTest (%)
                  <Input
                    placeholder="70"
                    type="number"
                    value={form.passThreshold}
                    onChange={(e) => setForm({ ...form, passThreshold: e.target.value })}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center gap-2">
              <AppIcon icon={Settings2} size="sm" className="bg-tertiary" />
              <p className="font-display text-sm font-extrabold">Lesson rules</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-dashed border-border bg-surface-paper p-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={form.isBonus}
                onChange={(e) => setForm({ ...form, isBonus: e.target.checked })}
              />
              <span>
                <span className="block text-sm font-extrabold">Tiết bonus</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
                  Bonus lesson không khóa sequential, phù hợp cho luyện thêm hoặc nội dung mở rộng.
                </span>
              </span>
            </label>
          </section>

          <Button onClick={handleSaveLesson}>Lưu tiết học</Button>
        </div>
      </Dialog>
    </div>
  );
}
