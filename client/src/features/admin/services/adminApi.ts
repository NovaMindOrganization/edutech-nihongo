import { apiFetch } from '@/services/httpClient';

export type VocabItem = {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  meaningEn: string | null;
  jlptLevel: string;
  topic: string | null;
  partOfSpeech: string | null;
  courseId: string | null;
  lessonId: string | null;
  course?: { id: string; title: string; jlptLevel: string } | null;
  lesson?: { id: string; title: string; orderIndex: number } | null;
};

export type GrammarItem = {
  id: string;
  pattern: string;
  meaning: string;
  meaningEn: string | null;
  structure: string | null;
  grammarType: string | null;
  jlptLevel: string;
  sourceLesson: number | null;
};

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

export type ConversationItem = {
  id: string;
  title: string | null;
  dialogue: unknown;
  jlptLevel: string | null;
};

export function listVocabulary(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<VocabItem>>(`/admin/vocabulary?${q}`);
}

export function createVocabulary(body: Partial<VocabItem>) {
  return apiFetch<VocabItem>('/admin/vocabulary', { method: 'POST', body: JSON.stringify(body) });
}

export function updateVocabulary(id: string, body: Partial<VocabItem>) {
  return apiFetch<VocabItem>(`/admin/vocabulary/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export function deleteVocabulary(id: string) {
  return apiFetch<null>(`/admin/vocabulary/${id}`, { method: 'DELETE' });
}

export function listGrammar(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<GrammarItem>>(`/admin/grammar?${q}`);
}

export function createGrammar(body: Partial<GrammarItem>) {
  return apiFetch<GrammarItem>('/admin/grammar', { method: 'POST', body: JSON.stringify(body) });
}

export function updateGrammar(id: string, body: Partial<GrammarItem>) {
  return apiFetch<GrammarItem>(`/admin/grammar/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export function deleteGrammar(id: string) {
  return apiFetch<null>(`/admin/grammar/${id}`, { method: 'DELETE' });
}

export type CourseItem = {
  id: string;
  title: string;
  jlptLevel: string;
  description: string | null;
  isPublished: boolean;
  _count?: { lessons: number };
};

export type LessonSummary = {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  passThreshold: number;
  isBonus: boolean;
  speakingPrompt: string | null;
};

export type CourseDetail = CourseItem & {
  lessons: LessonSummary[];
};

export type KanjiItem = {
  id: string;
  character: string;
  meaning: string;
  jlptLevel: string;
  readingsOn: string[];
  readingsKun: string[];
  strokeCount: number | null;
  radical: string | null;
};

export type LessonDetail = LessonSummary & {
  course: { id: string; title: string; jlptLevel: string };
  vocabulary: VocabItem[];
  grammar: GrammarItem[];
  kanji: KanjiItem[];
  conversations: ConversationItem[];
};

export function assignLessonVocabulary(lessonId: string, ids: string[]) {
  return apiFetch(`/admin/lessons/${lessonId}/assign/vocabulary`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export function listCourses() {
  return apiFetch<CourseItem[]>('/admin/courses');
}

export function getCourse(id: string) {
  return apiFetch<CourseDetail>(`/admin/courses/${id}`);
}

export function createCourse(body: {
  title: string;
  jlptLevel: string;
  description?: string;
  isPublished?: boolean;
}) {
  return apiFetch<CourseItem>('/admin/courses', { method: 'POST', body: JSON.stringify(body) });
}

export function updateCourse(
  id: string,
  body: Partial<{ title: string; jlptLevel: string; description: string; isPublished: boolean }>,
) {
  return apiFetch<CourseItem>(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export function deleteCourse(id: string) {
  return apiFetch<null>(`/admin/courses/${id}`, { method: 'DELETE' });
}

export function getLesson(id: string) {
  return apiFetch<LessonDetail>(`/admin/lessons/${id}`);
}

export function createLesson(body: {
  courseId: string;
  title: string;
  orderIndex: number;
  passThreshold?: number;
  isBonus?: boolean;
  speakingPrompt?: string | null;
}) {
  return apiFetch<LessonSummary>('/admin/lessons', { method: 'POST', body: JSON.stringify(body) });
}

export function updateLesson(
  id: string,
  body: Partial<{
    title: string;
    orderIndex: number;
    passThreshold: number;
    isBonus: boolean;
    speakingPrompt: string | null;
  }>,
) {
  return apiFetch<LessonSummary>(`/admin/lessons/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export function deleteLesson(id: string) {
  return apiFetch<null>(`/admin/lessons/${id}`, { method: 'DELETE' });
}

export function assignLessonGrammar(lessonId: string, ids: string[]) {
  return apiFetch(`/admin/lessons/${lessonId}/assign/grammar`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export function assignLessonKanji(lessonId: string, ids: string[]) {
  return apiFetch(`/admin/lessons/${lessonId}/assign/kanji`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export function listKanji(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<KanjiItem>>(`/admin/kanji?${q}`);
}

export function createKanji(body: {
  character: string;
  meaning: string;
  jlptLevel: string;
  readingsOn?: string[];
  readingsKun?: string[];
  strokeCount?: number;
  radical?: string;
}) {
  return apiFetch<KanjiItem>('/admin/kanji', { method: 'POST', body: JSON.stringify(body) });
}

export function updateKanji(id: string, body: Partial<KanjiItem>) {
  return apiFetch<KanjiItem>(`/admin/kanji/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export function deleteKanji(id: string) {
  return apiFetch<null>(`/admin/kanji/${id}`, { method: 'DELETE' });
}

export function updateConversation(
  id: string,
  body: {
    title?: string;
    dialogue?: Array<{ speaker: string; text: string; reading?: string; translation?: string }>;
    jlptLevel?: string;
  },
) {
  return apiFetch<ConversationItem>(`/admin/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteConversation(id: string) {
  return apiFetch<null>(`/admin/conversations/${id}`, { method: 'DELETE' });
}

export function listConversations(params?: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  return apiFetch<Paginated<ConversationItem>>(`/admin/conversations?${q}`);
}

export function createConversation(body: {
  title?: string;
  dialogue: Array<{ speaker: string; text: string; reading?: string; translation?: string }>;
  jlptLevel?: string;
}) {
  return apiFetch<ConversationItem>('/admin/conversations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function assignLessonConversations(lessonId: string, ids: string[]) {
  return apiFetch(`/admin/lessons/${lessonId}/assign/conversations`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export type QuestionItem = {
  id: string;
  questionText: string;
  questionType: string;
  jlptLevel: string | null;
};

export function listQuestions(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<QuestionItem>>(`/admin/questions?${q}`);
}

export function createQuestion(body: {
  questionText: string;
  questionType: string;
  correctAnswer: string;
  jlptLevel?: string;
  options?: unknown;
}) {
  return apiFetch<QuestionItem>('/admin/questions', { method: 'POST', body: JSON.stringify(body) });
}

export function deleteQuestion(id: string) {
  return apiFetch<null>(`/admin/questions/${id}`, { method: 'DELETE' });
}

export function listPendingStudySets() {
  return apiFetch<
    Array<{
      id: string;
      title: string;
      description: string | null;
      owner: { email: string; displayName: string | null };
      _count: { cards: number };
    }>
  >('/admin/studysets/pending');
}

export function moderateStudySet(id: string, status: 'approved' | 'rejected') {
  return apiFetch(`/admin/studysets/${id}/moderate`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}
