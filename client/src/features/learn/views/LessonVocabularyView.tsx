import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { VocabularyList } from '../components/vocabulary/VocabularyList';
import { useLessonData } from '../context/lesson-context';

export function LessonVocabularyView() {
  const { lessonId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lesson } = useLessonData();
  const focusId = searchParams.get('focus');

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`vocab-${focusId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-brand', 'ring-offset-2');
      const t = window.setTimeout(() => {
        el.classList.remove('ring-2', 'ring-brand', 'ring-offset-2');
        const next = new URLSearchParams(searchParams);
        next.delete('focus');
        setSearchParams(next, { replace: true });
      }, 2400);
      return () => window.clearTimeout(t);
    }
  }, [focusId, searchParams, setSearchParams]);

  return (
    <VocabularyList lessonId={lessonId} fallbackTitle={lesson.title} focusId={focusId} />
  );
}
