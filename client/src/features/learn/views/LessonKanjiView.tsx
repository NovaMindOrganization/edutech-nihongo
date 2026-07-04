import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useLessonData } from '../context/lesson-context';
import { KanjiList } from '../components/kanji/KanjiList';
import { KanjiPracticeView } from '../components/kanji/KanjiPracticeView';
import { useKanjiProgress } from '../hooks/use-kanji-progress';

export function LessonKanjiView() {
  const { kanji, lesson } = useLessonData();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const [activeKanjiId, setActiveKanjiId] = useState<string | null>(null);

  const kanjiIds = useMemo(() => kanji.map((item) => item.id), [kanji]);
  const { isLearned, learnedCount, loading: progressLoading } = useKanjiProgress(kanjiIds);

  useEffect(() => {
    if (!focusId || kanji.length === 0) return;
    const match = kanji.find((item) => item.id === focusId);
    if (match) setActiveKanjiId(match.id);
  }, [focusId, kanji]);

  const activeIndex = kanji.findIndex((item) => item.id === activeKanjiId);
  const activeKanji = activeIndex >= 0 ? kanji[activeIndex] : null;
  const nextKanji = activeIndex >= 0 && activeIndex < kanji.length - 1 ? kanji[activeIndex + 1] : null;

  function handleBack() {
    setActiveKanjiId(null);
    if (focusId) {
      const next = new URLSearchParams(searchParams);
      next.delete('focus');
      setSearchParams(next, { replace: true });
    }
  }

  if (activeKanji) {
    return (
      <KanjiPracticeView
        kanji={activeKanji}
        lessonId={lesson.id}
        learned={isLearned(activeKanji.id)}
        currentIndex={activeIndex + 1}
        totalCount={kanji.length}
        nextKanji={nextKanji}
        onBack={handleBack}
        onNext={nextKanji ? () => setActiveKanjiId(nextKanji.id) : undefined}
      />
    );
  }

  return (
    <KanjiList
      kanji={kanji}
      lessonId={lesson.id}
      title={`Kanji — ${lesson.title}`}
      learnedCount={learnedCount}
      progressLoading={progressLoading}
      isLearned={isLearned}
      onSelect={(item) => setActiveKanjiId(item.id)}
    />
  );
}
