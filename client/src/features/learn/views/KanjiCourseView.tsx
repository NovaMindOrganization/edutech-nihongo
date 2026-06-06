import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

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

  const kanji = (data?.kanji ?? []) as KanjiItem[];
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

  return (
    <div>
      <Link to={paths.learn.kanjiHub} className="text-sm text-primary hover:underline">
        ← Kanji
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">
        Kanji — {data?.course.title ?? '…'}
      </h1>
      <div className="mt-6">
        <KanjiList
          kanji={kanji}
          title={data?.course.title ?? 'Kanji khóa học'}
          learnedCount={learnedCount}
          progressLoading={progressLoading || !data}
          isLearned={isLearned}
          onSelect={(item) => setActiveKanjiId(item.id)}
        />
      </div>
    </div>
  );
}
