import { useParams } from 'react-router-dom';

import { VocabularyList } from '../components/vocabulary/VocabularyList';
import { useLessonData } from '../context/lesson-context';

export function LessonVocabularyView() {
  const { lessonId = '' } = useParams();
  const { lesson } = useLessonData();

  return (
    <VocabularyList lessonId={lessonId} fallbackTitle={lesson.title} />
  );
}
