import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getLesson, type LessonPayload } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

import { LessonContext } from '../context/lesson-context';

const tabs = [
  { to: 'speaking', label: 'Nghe nói (AI)', path: (id: string) => paths.learn.lessonSpeaking(id) },
  { to: 'vocabulary', label: 'Từ vựng', path: (id: string) => paths.learn.lessonVocabulary(id) },
  { to: 'grammar', label: 'Ngữ pháp', path: (id: string) => paths.learn.lessonGrammar(id) },
  { to: 'dialogue', label: 'Hội thoại', path: (id: string) => paths.learn.lessonDialogue(id) },
  { to: 'kanji', label: 'Kanji', path: (id: string) => paths.learn.lessonKanji(id) },
] as const;

export function LessonShellView() {
  const { lessonId = '' } = useParams();
  const [data, setData] = useState<LessonPayload | null>(null);

  useEffect(() => {
    getLesson(lessonId)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không mở được bài học'));
  }, [lessonId]);

  if (!data) {
    return <p className="text-muted-foreground">Đang tải bài học...</p>;
  }

  const courseId = data.lesson.course.id;

  return (
    <LessonContext.Provider value={data}>
      <div className="mx-auto max-w-3xl">
        <Link
          to={courseId ? paths.learn.course(courseId) : paths.learn.hub}
          className="text-sm text-primary hover:underline"
        >
          ← {data.lesson.course.title}
        </Link>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p className="text-sm text-muted-foreground">Tiết {data.lesson.orderIndex}</p>
          <h1 className="font-display text-2xl font-bold">{data.lesson.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.path(lessonId)}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 text-sm transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
            <Link to={paths.learn.miniTest(lessonId)}>
              <Button size="sm" variant="outline">
                MiniTest
              </Button>
            </Link>
          </div>
        </motion.div>
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </LessonContext.Provider>
  );
}
