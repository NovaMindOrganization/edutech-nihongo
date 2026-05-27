import { ArrowLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
    load();
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
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm('Xóa tiết học và toàn bộ nội dung gán?')) return;
    try {
      await deleteLesson(id);
      toast.success('Đã xóa tiết');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  async function togglePublish() {
    if (!course) return;
    try {
      await updateCourse(course.id, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Đã ẩn khóa' : 'Đã xuất bản');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  }

  if (!course) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div>
      <Link
        to={paths.admin.courses}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Khóa học
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">{course.title}</h1>
            <Badge>{course.jlptLevel}</Badge>
            {course.isPublished && <Badge variant="outline">Đã xuất bản</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.lessons.length} tiết học — quản lý nội dung từng tiết bên dưới
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={togglePublish}>
            {course.isPublished ? 'Ẩn khóa' : 'Xuất bản'}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm tiết
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="divide-y divide-border/60 p-0">
          {course.lessons.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Chưa có tiết học. Thêm tiết đầu tiên.</p>
          ) : (
            course.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-muted/30"
              >
                <Badge variant="outline">#{lesson.orderIndex}</Badge>
                <div className="min-w-[200px] flex-1">
                  <p className="font-medium">{lesson.title}</p>
                  {lesson.isBonus && (
                    <span className="text-xs text-muted-foreground">Tiết bonus</span>
                  )}
                  {lesson.speakingPrompt && (
                    <span className="ml-2 text-xs text-primary">· Có prompt AI</span>
                  )}
                </div>
                <div className="flex gap-1">
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
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen} title={editing ? 'Sửa tiết học' : 'Thêm tiết học'}>
        <div className="grid gap-3">
          <Input placeholder="Tên tiết" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input
            placeholder="Thứ tự"
            type="number"
            value={form.orderIndex}
            onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
          />
          <Input
            placeholder="Ngưỡng đạt (%)"
            type="number"
            value={form.passThreshold}
            onChange={(e) => setForm({ ...form, passThreshold: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isBonus}
              onChange={(e) => setForm({ ...form, isBonus: e.target.checked })}
            />
            Tiết bonus (không khóa sequential)
          </label>
          <Button onClick={handleSaveLesson}>Lưu</Button>
        </div>
      </Dialog>
    </div>
  );
}
