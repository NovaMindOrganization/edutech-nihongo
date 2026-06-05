import { apiFetch } from '@/services/httpClient';

export type VocabSourceFilter = 'all' | 'starred' | 'unmastered' | 'mastered';
export type VocabProgressStatus = 'learning' | 'mastered';

export type LessonVocabularyItem = {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  audioUrl: string | null;
  jlptLevel: string;
  progress: {
    isStarred: boolean;
    status: VocabProgressStatus | null;
    updatedAt: string;
  } | null;
};

export type LessonVocabularyResponse = {
  lesson: {
    id: string;
    title: string;
    orderIndex: number;
    courseId: string;
  };
  items: LessonVocabularyItem[];
  total: number;
};

export function getLessonVocabulary(
  lessonId: string,
  source: VocabSourceFilter = 'all',
) {
  const params = new URLSearchParams({ source });
  return apiFetch<LessonVocabularyResponse>(
    `/vocabulary/lesson/${lessonId}?${params.toString()}`,
  );
}

export function patchVocabularyProgress(body: {
  vocabularyId: string;
  isStarred?: boolean;
  status?: VocabProgressStatus;
}) {
  return apiFetch<{
    vocabularyId: string;
    isStarred: boolean;
    status: VocabProgressStatus | null;
    updatedAt: string;
    created: boolean;
  }>('/vocabulary/progress', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
