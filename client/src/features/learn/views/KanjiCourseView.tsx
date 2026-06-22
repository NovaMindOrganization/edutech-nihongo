import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, Brush, GraduationCap, PenTool } from 'lucide-react';

import { AppIcon } from '@/components/usable/app-icon';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { getCourseKanji } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

import { KanjiList } from '../components/kanji/KanjiList';
import { KanjiPracticeView } from '../components/kanji/KanjiPracticeView';
import { useKanjiProgress } from '../hooks/use-kanji-progress';
import type { KanjiItem } from '../types/kanji.types';

export function KanjiCourseView() {
  const { courseId = '' } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getCourseKanji>> | null>(null);
  const [activeKanjiId, setActiveKanjiId] = useState<string | null>(null);

  useEffect(() => {
    getCourseKanji(courseId)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, [courseId]);

  const kanji = useMemo(() => (data?.kanji ?? []) as KanjiItem[], [data?.kanji]);
  const kanjiIds = useMemo(() => kanji.map((item) => item.id), [kanji]);
  const { isLearned, markLearned, learnedCount, loading: progressLoading } =
    useKanjiProgress(kanjiIds);

  const activeIndex = kanji.findIndex((item) => item.id === activeKanjiId);
  const activeKanji = activeIndex >= 0 ? kanji[activeIndex] : null;
  const nextKanji = activeIndex >= 0 && activeIndex < kanji.length - 1 ? kanji[activeIndex + 1] : null;

  if (activeKanji) {
    return (
      <div>
        <KanjiPracticeView
          kanji={activeKanji}
          learned={isLearned(activeKanji.id)}
          currentIndex={activeIndex + 1}
          totalCount={kanji.length}
          nextKanji={nextKanji}
          onBack={() => setActiveKanjiId(null)}
          onNext={nextKanji ? () => setActiveKanjiId(nextKanji.id) : undefined}
          onPracticeComplete={() => markLearned(activeKanji.id)}
        />
      </div>
    );
  }

  const jlptLevel = data?.course.jlptLevel ?? 'JLPT';
  const courseTitle = data?.course.title ?? '…';

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Kanji"
      subtitle={jlptLevel}
      title={`Kanji — ${courseTitle}`}
      description="Học theo vòng lặp: nhận diện chữ, đọc âm On/Kun, hiểu nghĩa và bộ thủ, rồi luyện stroke order."
      icon={GraduationCap}
      iconClassName="bg-tertiary"
      tone="quaternary"
      chips={['Nghĩa', 'On · Kun', 'Bộ thủ', 'Nét viết']}
      backLink={{ to: paths.learn.kanjiHub, label: 'Kanji' }}
      footer={`${learnedCount}/${kanji.length} kanji đã luyện — chọn một chữ để bắt đầu.`}
      headerExtra={
        <div className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
          <div className="flex items-center gap-3">
            <AppIcon icon={Brush} size="lg" className="bg-tertiary" />
            <div>
              <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                Quy trình học
              </p>
              <p className="font-bold">Nghĩa → Âm đọc → Nét viết</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-muted-foreground">
            <span className="rounded-xl border border-dashed border-border bg-background px-2 py-2">
              <BookOpen className="mx-auto mb-1 size-4" />
              nghĩa
            </span>
            <span className="rounded-xl border border-dashed border-border bg-tertiary/20 px-2 py-2">
              音
            </span>
            <span className="rounded-xl border border-dashed border-border bg-brand-soft/40 px-2 py-2">
              <PenTool className="mx-auto mb-1 size-4" />
              nét
            </span>
          </div>
        </div>
      }
    >
      <div className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
        <KanjiList
          kanji={kanji}
          title={data?.course.title ?? 'Kanji khóa học'}
          learnedCount={learnedCount}
          progressLoading={progressLoading || !data}
          isLearned={isLearned}
          onSelect={(item) => setActiveKanjiId(item.id)}
        />
      </div>
    </PageShell>
  );
}
