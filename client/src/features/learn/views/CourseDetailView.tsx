import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, GraduationCap, Lock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  isBonus?: boolean;
  lessonType?: string | null;
  objective?: string | null;
  estimatedMinutes?: number | null;
  progress?: { status: string };
};

export function CourseDetailView() {
  const { courseId = '' } = useParams();
  const user = useAuthStore((s) => s.user);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [jlptLevel, setJlptLevel] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLessons([]);
      setCourseTitle('');
      setCourseSubtitle('');
      setJlptLevel('');
      setEnrolled(false);

      try {
        let outlineLessons: LessonRow[] = [];

        try {
          const outline = await getPublicCourseOutline(courseId);
          if (cancelled) return;
          if (!outline) {
            toast.error('Không tìm thấy khóa học');
            return;
          }

          setCourseTitle(outline.title);
          setJlptLevel(outline.jlptLevel);
          setCourseSubtitle(outline.subtitle ?? '');
          outlineLessons = outline.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            orderIndex: l.orderIndex,
            isBonus: l.isBonus,
            lessonType: l.lessonType,
          }));
        } catch (e) {
          if (!cancelled) {
            toast.error(e instanceof Error ? e.message : 'Không tải được khóa học');
          }
          return;
        }

        try {
          const data = await getCourseLessons(courseId);
          if (cancelled) return;
          setLessons(data);
          setEnrolled(true);
        } catch (err) {
          if (cancelled) return;
          const notEnrolled =
            err instanceof ApiRequestError &&
            (err.code === 'NOT_ENROLLED' || err.status === 403);
          if (!notEnrolled && err instanceof Error) {
            toast.error(err.message);
          }
          setLessons(outlineLessons);
          setEnrolled(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function handleEnroll() {
    try {
      await enrollCourse(courseId);
      toast.success('Đã ghi danh — Bài đầu tiên đã mở khóa');
      const data = await getCourseLessons(courseId);
      setLessons(data);
      setEnrolled(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ghi danh thất bại — hãy đăng nhập');
    }
  }

  const statusIcon = (status: string) => {
    if (status === 'completed') return <AppIcon icon={CheckCircle2} size="md" className="bg-quaternary" />;
    if (status === 'active') return <AppIcon icon={Play} size="md" active />;
    return <AppIcon icon={Lock} size="md" className="bg-muted" />;
  };

  const mainLessons = lessons.filter((l) => !l.isBonus);
  const supportLessons = lessons.filter((l) => l.isBonus);
  const progressBase = mainLessons.length > 0 ? mainLessons : lessons;
  const completedCount = progressBase.filter((lesson) => lesson.progress?.status === 'completed').length;
  const activeCount = progressBase.filter((lesson) => lesson.progress?.status === 'active').length;
  const lockedCount = progressBase.filter((lesson) => lesson.progress?.status === 'locked').length;
  const progressPercent =
    progressBase.length > 0 ? Math.round((completedCount / progressBase.length) * 100) : 0;

  function renderLessonRow(lesson: LessonRow, i: number) {
    const status = lesson.progress?.status;
    const isFirst = i === 0;

    if (!enrolled) {
      return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4 shadow-premium card-lift sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-tertiary font-display text-sm font-extrabold shadow-premium card-lift">
            {lesson.orderIndex + 1}
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
      );
    }

    if (!lesson.isBonus && status === 'locked') {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-4 opacity-80">
          {statusIcon(status)}
          <span className="flex-1 text-sm font-bold leading-snug">{lesson.title}</span>
          <Badge variant="outline">Khóa</Badge>
        </div>
      );
    }

    return (
      <Link
        to={paths.learn.lessonOverview(lesson.id)}
        className={cn(
          'depth-interactive flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-4 shadow-premium card-lift',
          status === 'completed' && 'bg-quaternary/15',
        )}
      >
        {statusIcon(status ?? 'active')}
        <span className="flex-1 font-display font-bold leading-snug">{lesson.title}</span>
        <Badge
          className={status === 'completed' ? 'bg-quaternary text-quaternary-foreground' : undefined}
          variant={lesson.isBonus ? 'outline' : undefined}
        >
          {lesson.isBonus ? 'Phụ trợ' : status === 'completed' ? 'Xong' : 'Đang học'}
        </Badge>
      </Link>
    );
  }

  return (
    <PageShell
      className={cn(pageContentClass, 'max-w-6xl')}
      eyebrow="Khóa học"
      subtitle={courseSubtitle || jlptLevel || undefined}
      title={courseTitle || 'Chi tiết khóa học'}
      description={
        jlptLevel === 'JPD1'
          ? 'Khóa nhập môn FPT — 2 bài phụ trợ và 3 bài chính theo tình huống thực tế.'
          : 'Danh sách bài học theo thứ tự mở khóa — tập trung bài đang mở và ôn lại bài đã hoàn thành khi cần.'
      }
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
          {supportLessons.length > 0 ? (
            <div className="mb-6 space-y-3">
              <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                Bài phụ trợ
              </h3>
              <ul className="space-y-3">
                {supportLessons.map((lesson, i) => (
                  <motion.li
                    key={lesson.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {renderLessonRow(lesson, i)}
                  </motion.li>
                ))}
              </ul>
            </div>
          ) : null}

          <ul className="space-y-3">
            {loading ? (
              <li className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                Đang tải danh sách bài học…
              </li>
            ) : (mainLessons.length > 0 ? mainLessons : lessons).length === 0 ? (
              <li className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                Chưa có bài học trong khóa này.
              </li>
            ) : (
              (mainLessons.length > 0 ? mainLessons : lessons).map((lesson, i) => (
                <motion.li
                  key={lesson.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {renderLessonRow(lesson, i)}
                </motion.li>
              ))
            )}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
