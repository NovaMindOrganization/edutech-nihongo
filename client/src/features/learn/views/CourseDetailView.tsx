import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  async function load() {
    let outlineLessons: LessonRow[] = [];

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
  }

  useEffect(() => {
    load();
  }, [courseId]);

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
    if (status === 'completed') return <CheckCircle2 className="size-4 text-emerald-600" />;
    if (status === 'active') return <Play className="size-4 text-primary" />;
    return <Lock className="size-4 text-muted-foreground" />;
  };

  return (
    <div className="w-full">
      <Link to={paths.learn.hub} className="text-sm text-primary hover:underline">
        ← Lộ trình
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">
        {courseTitle || 'Chi tiết khóa học'}
      </h1>
      {jlptLevel && <Badge className="mt-2">{jlptLevel}</Badge>}

      {!enrolled && (
        <div className="mt-4 flex flex-wrap gap-2">
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

      <ul className="mt-8 space-y-2">
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
                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
                  <span className="flex-1 font-medium">{lesson.title}</span>
                  {isFirst && (
                    <Link to={`/learn/lessons/${lesson.id}/preview`}>
                      <Button size="sm" variant="outline">
                        Xem trước
                      </Button>
                    </Link>
                  )}
                </div>
              ) : status === 'locked' ? (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-3 opacity-70">
                  {statusIcon(status)}
                  <span className="flex-1 text-sm">{lesson.title}</span>
                  <Badge variant="outline">Khóa</Badge>
                </div>
              ) : (
                <Link
                  to={paths.learn.lessonGrammar(lesson.id)}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  {statusIcon(status ?? 'active')}
                  <span className="flex-1 font-medium">{lesson.title}</span>
                  <Badge>{status === 'completed' ? 'Xong' : 'Đang học'}</Badge>
                </Link>
              )}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
