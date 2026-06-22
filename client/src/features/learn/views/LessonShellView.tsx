import { BookOpen, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { getLesson, type LessonPayload } from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import { LessonContext } from '../context/lesson-context';

const tabs = [
  { to: 'speaking', label: 'Nghe nói (AI)', path: (id: string) => paths.learn.lessonSpeaking(id) },
  { to: 'vocabulary', label: 'Từ vựng', path: (id: string) => paths.learn.lessonVocabulary(id) },
  { to: 'grammar', label: 'Ngữ pháp', path: (id: string) => paths.learn.lessonGrammar(id) },
  { to: 'dialogue', label: 'Hội thoại', path: (id: string) => paths.learn.lessonDialogue(id) },
  { to: 'kanji', label: 'Kanji', path: (id: string) => paths.learn.lessonKanji(id) },
] as const;

function LessonModuleTabs({ lessonId }: { lessonId: string }) {
  const tabClass = (isActive: boolean) =>
    cn(
      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors',
      isActive ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground',
    );

  return (
    <nav
      className="flex flex-wrap rounded-lg border border-border bg-surface-paper p-1 shadow-premium card-lift"
      aria-label="Nội dung bài học"
    >
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.path(lessonId)} className={({ isActive }) => tabClass(isActive)}>
          {tab.label}
        </NavLink>
      ))}
      <NavLink to={paths.learn.miniTest(lessonId)} className={({ isActive }) => tabClass(isActive)}>
        MiniTest
      </NavLink>
    </nav>
  );
}

export function LessonShellView() {
  const { lessonId = '' } = useParams();
  const [data, setData] = useState<LessonPayload | null>(null);

  useEffect(() => {
    getLesson(lessonId)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không mở được bài học'));
  }, [lessonId]);

  if (!data) {
    return <p className="text-sm font-medium text-muted-foreground">Đang tải bài học…</p>;
  }

  const courseId = data.lesson.course.id;
  const progressLabel =
    data.progress.status === 'completed'
      ? 'Đã hoàn thành'
      : data.progress.status === 'active'
        ? 'Đang học'
        : 'Đã khóa';

  return (
    <LessonContext.Provider value={data}>
      <PageShell
        className={pageContentClass}
        eyebrow="Bài học"
        subtitle={`Tiết ${data.lesson.orderIndex} · ${data.lesson.course.jlptLevel}`}
        title={data.lesson.title}
        description="Đọc ví dụ trước, sau đó dùng audio, quiz hoặc công cụ luyện tập hỗ trợ."
        icon={BookOpen}
        iconClassName="bg-tertiary"
        tone="secondary"
        chips={['Ngữ pháp', 'Từ vựng', 'Kanji', 'MiniTest']}
        backLink={{
          to: courseId ? paths.learn.course(courseId) : paths.learn.hub,
          label: data.lesson.course.title,
        }}
        footer={`MiniTest: ${data.progress.miniTestScore ?? 'chưa làm'} / ${data.lesson.passThreshold} điểm để mở bài tiếp theo.`}
        headerExtra={
          <div className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <div className="flex items-center gap-3">
              <AppIcon
                icon={data.progress.status === 'completed' ? CheckCircle2 : BookOpen}
                size="lg"
                className={data.progress.status === 'completed' ? 'bg-quaternary' : 'bg-brand-soft'}
                active={data.progress.status !== 'completed'}
              />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                  Tiến độ bài
                </p>
                <p className="font-bold">{progressLabel}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <AppIcon icon={ClipboardCheck} size="sm" className="bg-tertiary" />
              MiniTest: {data.progress.miniTestScore ?? 'chưa làm'} / {data.lesson.passThreshold}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <LessonModuleTabs lessonId={lessonId} />
          </section>
          <div className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </PageShell>
    </LessonContext.Provider>
  );
}
