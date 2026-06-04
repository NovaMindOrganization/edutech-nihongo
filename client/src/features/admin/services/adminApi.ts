import type {
  StudySetDetail,
  StudySetListRow,
  StudySetModerationStatus,
} from "@/features/student/types/study-set.types";
import {
  ApiRequestError,
  apiAssetUrl,
  apiFetch,
  getAccessToken,
} from "@/services/httpClient";

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
  lessonId: string | null;
  order: number | null;
  title: string;
  jlpt: string;
  type: string | null;
  pattern: string;
  meaningVi: string;
  usage: string | null;
  notes: string | null;
  examples: Array<{
    jp: string;
    vi: string;
    reading?: string | null;
    en?: string | null;
  }> | null;
  quiz: Array<{ question: string; choices: string[]; answer: number }> | null;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

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
  return apiFetch<VocabItem>("/admin/vocabulary", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateVocabulary(id: string, body: Partial<VocabItem>) {
  return apiFetch<VocabItem>(`/admin/vocabulary/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteVocabulary(id: string) {
  return apiFetch<null>(`/admin/vocabulary/${id}`, { method: "DELETE" });
}

export function listGrammar(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<GrammarItem>>(`/admin/grammar?${q}`);
}

export function createGrammar(body: Partial<GrammarItem>) {
  return apiFetch<GrammarItem>("/admin/grammar", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateGrammar(id: string, body: Partial<GrammarItem>) {
  return apiFetch<GrammarItem>(`/admin/grammar/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteGrammar(id: string) {
  return apiFetch<null>(`/admin/grammar/${id}`, { method: "DELETE" });
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
  hanVietPronunciation: string | null;
  meaning: string;
  memoryTip: string | null;
  memoryImageUrl: string | null;
  jlptLevel: string;
  readingsOn: string[];
  readingsKun: string[];
  strokeCount: number | null;
  radical: string | null;
  examples: KanjiExampleItem[];
};

export type KanjiExampleItem = {
  id: string;
  orderIndex: number;
  word: string;
  reading: string | null;
  meaning: string;
};

export type KanjiUpsertBody = {
  character: string;
  hanVietPronunciation?: string;
  meaning: string;
  memoryTip?: string;
  memoryImageUrl?: string;
  jlptLevel: string;
  readingsOn?: string[];
  readingsKun?: string[];
  strokeCount?: number;
  radical?: string;
  examples?: Array<{
    word: string;
    reading?: string;
    meaning: string;
  }>;
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
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function listCourses() {
  return apiFetch<CourseItem[]>("/admin/courses");
}

export function listCoursesWithLessons() {
  return apiFetch<CourseDetail[]>("/admin/courses-with-lessons");
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
  return apiFetch<CourseItem>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateCourse(
  id: string,
  body: Partial<{
    title: string;
    jlptLevel: string;
    description: string;
    isPublished: boolean;
  }>,
) {
  return apiFetch<CourseItem>(`/admin/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteCourse(id: string) {
  return apiFetch<null>(`/admin/courses/${id}`, { method: "DELETE" });
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
  return apiFetch<LessonSummary>("/admin/lessons", {
    method: "POST",
    body: JSON.stringify(body),
  });
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
  return apiFetch<LessonSummary>(`/admin/lessons/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteLesson(id: string) {
  return apiFetch<null>(`/admin/lessons/${id}`, { method: "DELETE" });
}

export function assignLessonGrammar(lessonId: string, ids: string[]) {
  return apiFetch(`/admin/lessons/${lessonId}/assign/grammar`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function assignLessonKanji(lessonId: string, ids: string[]) {
  return apiFetch(`/admin/lessons/${lessonId}/assign/kanji`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function listKanji(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<KanjiItem>>(`/admin/kanji?${q}`);
}

export function createKanji(body: KanjiUpsertBody) {
  return apiFetch<KanjiItem>("/admin/kanji", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateKanji(id: string, body: Partial<KanjiUpsertBody>) {
  return apiFetch<KanjiItem>(`/admin/kanji/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function uploadKanjiMemoryImage(id: string, file: File) {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    apiAssetUrl(`/api/admin/kanji/${encodeURIComponent(id)}/memory-image`),
    {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    },
  );
  const json = (await res.json()) as {
    success: boolean;
    data?: {
      kanji: KanjiItem;
      bucket: string;
      objectKey: string;
      storagePath: string;
      assetUrl: string;
    };
    error?: { code: string; message: string };
  };

  if (!res.ok || !json.data) {
    throw new ApiRequestError(
      json.error?.message ?? `HTTP ${res.status}`,
      res.status,
      json.error?.code,
    );
  }

  return json.data;
}

export function deleteKanji(id: string) {
  return apiFetch<null>(`/admin/kanji/${id}`, { method: "DELETE" });
}

export type RadicalItem = {
  id: string;
  radicalIndex: number;
  character: string;
  sinoVietnamese: string;
  meaning: string;
  strokeCount: number;
};

export type RadicalUpsertBody = {
  radicalIndex?: number;
  character: string;
  sinoVietnamese: string;
  meaning: string;
  strokeCount: number;
};

export function listRadicals(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<RadicalItem>>(`/admin/radicals?${q}`);
}

export function createRadical(body: RadicalUpsertBody) {
  return apiFetch<RadicalItem>("/admin/radicals", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateRadical(id: string, body: Partial<RadicalUpsertBody>) {
  return apiFetch<RadicalItem>(`/admin/radicals/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteRadical(id: string) {
  return apiFetch<null>(`/admin/radicals/${id}`, { method: "DELETE" });
}

export function updateConversation(
  id: string,
  body: {
    title?: string;
    dialogue?: Array<{
      speaker: string;
      text: string;
      reading?: string;
      translation?: string;
    }>;
    jlptLevel?: string;
  },
) {
  return apiFetch<ConversationItem>(`/admin/conversations/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteConversation(id: string) {
  return apiFetch<null>(`/admin/conversations/${id}`, { method: "DELETE" });
}

export function listConversations(params?: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  return apiFetch<Paginated<ConversationItem>>(`/admin/conversations?${q}`);
}

export function createConversation(body: {
  title?: string;
  dialogue: Array<{
    speaker: string;
    text: string;
    reading?: string;
    translation?: string;
  }>;
  jlptLevel?: string;
}) {
  return apiFetch<ConversationItem>("/admin/conversations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function assignLessonConversations(lessonId: string, ids: string[]) {
  return apiFetch(`/admin/lessons/${lessonId}/assign/conversations`, {
    method: "POST",
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
  questionCategory?: string;
  explanation?: string;
  options?: unknown;
}) {
  return apiFetch<QuestionItem>("/admin/questions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteQuestion(id: string) {
  return apiFetch<null>(`/admin/questions/${id}`, { method: "DELETE" });
}

export type MockExamListItem = {
  id: string;
  title: string;
  jlptLevel: string;
  durationMinutes: number;
  maxAttempts: number;
  createdAt: string;
  questionCount: number;
  totalSessions: number;
};

export type MockExamDetail = {
  id: string;
  title: string;
  jlptLevel: string;
  durationMinutes: number;
  maxAttempts: number;
  createdAt: string;
  totalSessions: number;
  questions: Array<{
    order: number;
    section: string | null;
    question: {
      id: string;
      questionText: string;
      questionType: string;
      options: Array<{ label: string; text: string }> | null;
      correctAnswer: string;
      explanation: string | null;
      jlptLevel: string | null;
      questionCategory: string | null;
      difficulty: number;
      audioUrl: string | null;
    };
  }>;
};

export type ImportQuestionBody = {
  questionText: string;
  questionType?: string;
  options: Array<{ label: string; text: string }>;
  correctAnswer: string;
  explanation?: string;
  questionCategory?: string;
  section?: string;
  difficulty?: number;
};

export function listMockExams(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Paginated<MockExamListItem>>(`/admin/mock-exams?${q}`);
}

export function getMockExam(id: string) {
  return apiFetch<MockExamDetail>(`/admin/mock-exams/${id}`);
}

export function createMockExam(body: {
  title: string;
  jlptLevel: string;
  durationMinutes: number;
  maxAttempts?: number;
}) {
  return apiFetch<MockExamListItem>("/admin/mock-exams", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateMockExam(
  id: string,
  body: Partial<{
    title: string;
    jlptLevel: string;
    durationMinutes: number;
    maxAttempts: number;
  }>,
) {
  return apiFetch<MockExamListItem>(`/admin/mock-exams/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteMockExam(id: string) {
  return apiFetch<null>(`/admin/mock-exams/${id}`, { method: "DELETE" });
}

export function importMockExamQuestions(
  examId: string,
  questions: ImportQuestionBody[],
) {
  return apiFetch<{ imported: number; questionIds: string[] }>(
    `/admin/mock-exams/${examId}/import`,
    {
      method: "POST",
      body: JSON.stringify({ questions }),
    },
  );
}

export function removeMockExamQuestion(examId: string, questionId: string) {
  return apiFetch<null>(`/admin/mock-exams/${examId}/questions/${questionId}`, {
    method: "DELETE",
  });
}

export type StudySetAdminDetail = StudySetDetail;

export function listAdminStudySets(params?: {
  status?: StudySetModerationStatus | "all";
  search?: string;
}) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.search) q.set("search", params.search);
  const qs = q.toString();
  return apiFetch<StudySetListRow[]>(
    `/admin/studysets/pending${qs ? `?${qs}` : ""}`,
  );
}

/** @deprecated use listAdminStudySets */
export function listPendingStudySets() {
  return listAdminStudySets({ status: "pending" });
}

export function getStudySetAdmin(id: string) {
  return apiFetch<StudySetAdminDetail>(`/admin/studysets/${id}`);
}

export function moderateStudySet(
  id: string,
  status: "approved" | "rejected",
  options?: { moderationNote?: string; quizQuestionCount?: number },
) {
  return apiFetch(`/admin/studysets/${id}/moderate`, {
    method: "POST",
    body: JSON.stringify({
      status,
      moderationNote: options?.moderationNote,
      quizQuestionCount: options?.quizQuestionCount,
    }),
  });
}

export type PricingPlanCourseRef = {
  id: string;
  title: string;
  jlptLevel: string;
  isPublished: boolean;
};

export type PricingPlanItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number | null;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  courses: PricingPlanCourseRef[];
};

export function listPricingPlans() {
  return apiFetch<PricingPlanItem[]>("/admin/pricing-plans");
}

export function getPricingPlan(id: string) {
  return apiFetch<PricingPlanItem>(`/admin/pricing-plans/${id}`);
}

export function createPricingPlan(body: {
  name: string;
  description?: string | null;
  price: number;
  durationDays?: number | null;
  features: string[];
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  courseIds: string[];
}) {
  return apiFetch<PricingPlanItem>("/admin/pricing-plans", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePricingPlan(
  id: string,
  body: Partial<{
    name: string;
    description: string | null;
    price: number;
    durationDays: number | null;
    features: string[];
    isActive: boolean;
    isPopular: boolean;
    sortOrder: number;
    courseIds: string[];
  }>,
) {
  return apiFetch<PricingPlanItem>(`/admin/pricing-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deletePricingPlan(id: string) {
  return apiFetch<null>(`/admin/pricing-plans/${id}`, { method: "DELETE" });
}
