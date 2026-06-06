import { useMemo, useState } from 'react';

import { useLessonData } from '../context/lesson-context';
import { KanjiList } from '../components/kanji/KanjiList';
import { KanjiPracticeView } from '../components/kanji/KanjiPracticeView';
import { useKanjiProgress } from '../hooks/use-kanji-progress';

export function LessonKanjiView() {
  const { kanji, lesson } = useLessonData();
  const [activeKanjiId, setActiveKanjiId] = useState<string | null>(null);

  const kanjiIds = useMemo(() => kanji.map((item) => item.id), [kanji]);
  const { isLearned, markLearned, learnedCount, loading: progressLoading } =
    useKanjiProgress(kanjiIds);

  const activeIndex = kanji.findIndex((item) => item.id === activeKanjiId);
  const activeKanji = activeIndex >= 0 ? kanji[activeIndex] : null;
  const nextKanji = activeIndex >= 0 && activeIndex < kanji.length - 1 ? kanji[activeIndex + 1] : null;

  if (activeKanji) {
    return (
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
    );
  }

  return (
    <KanjiList
      kanji={kanji}
      title={`Kanji — ${lesson.title}`}
      learnedCount={learnedCount}
      progressLoading={progressLoading}
      isLearned={isLearned}
      onSelect={(item) => setActiveKanjiId(item.id)}
    />
  );
}
