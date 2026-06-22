import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, GraduationCap, Lock, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { HubLinkCardTag } from '@/components/usable/hub-link-card';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import { useAuthStore } from '@/features/auth';
import { ApiRequestError } from '@/services/httpClient';
import {
  enrollCourse,
  getCourseLessons,
  getPublicCourseOutline,
} from '@/features/student/services/studentApi';

type LessonRow = {
  id: string;
  title: string;
  orderIndex: number;
  progress?: { status: string };
};

export function CourseDetailView() {
  const { courseId = '' } = useParams();
  const user = useAuthStore((s) => s.user);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [jlptLevel, setJlptLevel] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const load = useCallback(async () => {
    let outlineLessons: LessonRow[];

    try {
      const outline = await getPublicCourseOutline(courseId);
      setCourseTitle(outline.title);
      setJlptLevel(outline.jlptLevel);
      outlineLessons = outline.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        orderIndex: l.orderIndex,
      }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải khóa học');
      return;
    }

    try {
      const data = await getCourseLessons(courseId);
      setLessons(data);
      setEnrolled(true);
    } catch (err) {
      const notEnrolled =
        err instanceof ApiRequestError &&
        (err.code === 'NOT_ENROLLED' || err.status === 403);
      if (!notEnrolled && err instanceof Error) {
        toast.error(err.message);
      }
      setLessons(outlineLessons);
      setEnrolled(false);
    }
  }, [courseId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function handleEnroll() {
    try {
      await enrollCourse(courseId);
      toast.success('Đã ghi danh — Bài đầu tiên đã mở khóa');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ghi danh thất bại — hãy đăng nhập');
    }
  }

  const statusIcon = (status: string) => {
    if (status === 'completed') return <AppIcon icon={CheckCircle2} size="md" className="bg-quaternary" />;
    if (status === 'active') return <AppIcon icon={Play} size="md" active />;
    return <AppIcon icon={Lock} size="md" className="bg-muted" />;
  };

  const completedCount = lessons.filter((lesson) => lesson.progress?.status === 'completed').length;
  const activeCount = lessons.filter((lesson) => lesson.progress?.status === 'active').length;
  const lockedCount = lessons.filter((lesson) => lesson.progress?.status === 'locked').length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <PageShell
      className={cn(pageContentClass, 'max-w-6xl')}
      eyebrow="Khóa học"
      subtitle={jlptLevel || undefined}
      title={courseTitle || 'Chi tiết khóa học'}
      description="Danh sách bài học theo thứ tự mở khóa — tập trung bài đang mở và ôn lại bài đã hoàn thành khi cần."
      icon={GraduationCap}
      iconClassName="bg-quaternary"
      tone="quaternary"
      chips={
        jlptLevel
          ? [jlptLevel, `${lessons.length} bài`, enrolled ? 'Đã ghi danh' : 'Chưa ghi danh']
          : undefined
      }
      backLink={{ to: paths.learn.hub, label: 'Khóa học' }}
      footer="Bài bị khóa cho đến khi hoàn thành MiniTest bài trước — tiến độ được lưu trên server."
      headerExtra={
        enrolled ? (
          <div className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <div className="flex items-center gap-3">
              <AppIcon icon={GraduationCap} size="lg" className="bg-quaternary" />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                  Tiến độ khóa
                </p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{progressPercent}%</p>
              </div>
            </div>
            <div className="mt-4 h-4 overflow-hidden rounded-full border border-border bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-muted-foreground">
              <span>{completedCount} xong</span>
              <span>{activeCount} mở</span>
              <span>{lockedCount} khóa</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <HubLinkCardTag label="Chưa ghi danh" variant="available" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Ghi danh để mở bài đầu tiên và lưu tiến độ học.
            </p>
          </div>
        )
      }
    >
      <div className="space-y-5">
        {!enrolled && (
          <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            {user ? (
              <Button onClick={handleEnroll}>Bắt đầu học (ghi danh)</Button>
            ) : (
              <>
                <Link to={paths.login}>
                  <Button>Đăng nhập để học</Button>
                </Link>
                <Link to={paths.register}>
                  <Button variant="outline">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>
        )}

        <section className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <AppIcon icon={BookOpen} size="md" className="bg-tertiary" />
            <div>
              <h2 className="font-display text-xl font-extrabold">Danh sách bài học</h2>
              <p className="text-sm font-medium text-muted-foreground">
                Chọn bài để vào nội dung — trang này giúp bạn định hướng bước tiếp theo.
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {lessons.map((lesson, i) => {
              const status = lesson.progress?.status;
              const isFirst = i === 0;
              return (
                <motion.li
                  key={lesson.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {!enrolled ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4 shadow-premium card-lift sm:flex-row sm:items-center">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-tertiary font-display text-sm font-extrabold shadow-premium card-lift">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-display font-bold leading-snug">{lesson.title}</span>
                      {isFirst && (
                        <Link to={`/learn/lessons/${lesson.id}/preview`}>
                          <Button size="sm" variant="outline">
                            Xem trước
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : status === 'locked' ? (
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-4 opacity-80">
                      {statusIcon(status)}
                      <span className="flex-1 text-sm font-bold leading-snug">{lesson.title}</span>
                      <Badge variant="outline">Khóa</Badge>
                    </div>
                  ) : (
                    <Link
                      to={paths.learn.lessonGrammar(lesson.id)}
                      className={cn(
                        'depth-interactive flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-4 shadow-premium card-lift',
                        status === 'completed' && 'bg-quaternary/15',
                      )}
                    >
                      {statusIcon(status ?? 'active')}
                      <span className="flex-1 font-display font-bold leading-snug">{lesson.title}</span>
                      <Badge
                        className={
                          status === 'completed' ? 'bg-quaternary text-quaternary-foreground' : undefined
                        }
                      >
                        {status === 'completed' ? 'Xong' : 'Đang học'}
                      </Badge>
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
