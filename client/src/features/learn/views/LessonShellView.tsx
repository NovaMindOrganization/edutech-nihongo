import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { getLesson, type LessonPayload } from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import { LessonContext } from '../context/lesson-context';
import { formatJpd1ShellSubtitle } from '../utils/jpd1-lesson-groups';
import { formatJpd2ShellSubtitle } from '../utils/jpd2-lesson-groups';

function LessonModuleTabs({
  lessonId,
  data,
}: {
  lessonId: string;
  data: LessonPayload;
}) {
  const tabClass = (isActive: boolean) =>
    cn(
      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors',
      isActive ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground',
    );

  const tabs = useMemo(() => {
    const items = [
      { to: paths.learn.lessonOverview(lessonId), label: 'Tổng quan' },
      { to: paths.learn.lessonVocabulary(lessonId), label: 'Từ vựng', show: data.vocabulary.length > 0 },
      { to: paths.learn.lessonGrammar(lessonId), label: 'Ngữ pháp', show: data.grammar.length > 0 },
      { to: paths.learn.lessonDialogue(lessonId), label: 'Hội thoại', show: data.conversations.length > 0 },
      { to: paths.learn.lessonKanji(lessonId), label: 'Kanji', show: data.kanji.length > 0 },
    ];
    return items.filter((item) => item.show !== false);
  }, [data, lessonId]);

  return (
    <nav
      className="flex flex-wrap rounded-lg border border-border bg-surface-paper p-1 shadow-premium card-lift"
      aria-label="Nội dung bài học"
    >
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => tabClass(isActive)}>
          {tab.label}
        </NavLink>
      ))}
      {!data.lesson.isBonus ? (
        <NavLink to={paths.learn.miniTest(lessonId)} className={({ isActive }) => tabClass(isActive)}>
          MiniTest
        </NavLink>
      ) : null}
      <NavLink to={paths.learn.lessonSpeaking(lessonId)} className={({ isActive }) => tabClass(isActive)}>
        Luyện nói
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

  const jlptLevel = data.lesson.course.jlptLevel;

  return (
    <LessonContext.Provider value={data}>
      <PageShell
        className={pageContentClass}
        eyebrow={
          jlptLevel === 'JPD1'
            ? formatJpd1ShellSubtitle(data.lesson)
            : jlptLevel === 'JPD2'
              ? formatJpd2ShellSubtitle(data.lesson)
              : data.lesson.isBonus
                ? 'Bài phụ trợ'
                : 'Bài học'
        }
        subtitle={jlptLevel === 'JPD1' || jlptLevel === 'JPD2' ? undefined : jlptLevel}
        title={data.lesson.title}
        icon={BookOpen}
        iconClassName="bg-tertiary"
        tone="secondary"
        backLink={{
          to: courseId ? paths.learn.course(courseId) : paths.learn.hub,
          label: data.lesson.course.title,
        }}
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
          </div>
        }
      >
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <LessonModuleTabs lessonId={lessonId} data={data} />
          </section>
          <div className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </PageShell>
    </LessonContext.Provider>
  );
}
