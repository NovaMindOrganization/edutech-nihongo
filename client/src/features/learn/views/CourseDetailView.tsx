import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';

import { enrollCourse, getCourseLessons } from '../services/learnApi';

type LessonRow = {
  id: string;
  title: string;
  orderIndex: number;
  progress: { status: string };
};

export function CourseDetailView() {
  const { courseId = '' } = useParams();
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [enrolled, setEnrolled] = useState(false);

  async function load() {
    try {
      const data = await getCourseLessons(courseId);
      setLessons(data);
      setEnrolled(true);
    } catch {
      setEnrolled(false);
    }
  }

  useEffect(() => {
    load();
  }, [courseId]);

  async function handleEnroll() {
    try {
      await enrollCourse(courseId);
      toast.success('Đã ghi danh — Bài 1 đã mở khóa');
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
    <div className="mx-auto max-w-2xl">
      <Link to={paths.learn.hub} className="text-sm text-primary hover:underline">
        ← Lộ trình
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">Chi tiết khóa học</h1>

      {!enrolled && (
        <Button className="mt-4" onClick={handleEnroll}>
          Bắt đầu học (ghi danh)
        </Button>
      )}

      <ul className="mt-8 space-y-2">
        {lessons.map((lesson, i) => (
          <motion.li
            key={lesson.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            {lesson.progress.status === 'locked' ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-3 opacity-70">
                {statusIcon(lesson.progress.status)}
                <span className="flex-1 text-sm">{lesson.title}</span>
                <Badge variant="outline">Khóa</Badge>
              </div>
            ) : (
              <Link
                to={paths.learn.lessonGrammar(lesson.id)}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {statusIcon(lesson.progress.status)}
                <span className="flex-1 font-medium">{lesson.title}</span>
                <Badge>{lesson.progress.status === 'completed' ? 'Xong' : 'Đang học'}</Badge>
              </Link>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
