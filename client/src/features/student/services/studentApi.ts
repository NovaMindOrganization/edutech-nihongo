import { apiFetch } from "@/services/httpClient";

export type PublicCourse = {
  id: string;
  title: string;
  slug?: string | null;
  subtitle?: string | null;
  level?: string | null;
  jlptLevel: string;
  description: string | null;
  sortOrder?: number;
  lessons: Array<{
    id: string;
    title: string;
    orderIndex: number;
    isBonus: boolean;
    lessonType?: string | null;
    objective?: string | null;
    estimatedMinutes?: number | null;
  }>;
};

export type ApiQuestion = {
  id: string;
  questionText: string;
  questionType: string;
  options?: Array<{ label: string; text: string }> | null;
  jlptLevel?: string | null;
  section?: string | null;
  questionCategory?: string | null;
  audioUrl?: string | null;
};

export type JlptExamListItem = {
  id: string;
  title: string;
  jlptLevel: string;
  durationMinutes: number;
  questionCount: number;
  maxAttempts: number;
  myAttemptCount: number;
  attemptsRemaining: number;
  hasActiveSession: boolean;
  canStart: boolean;
};

export type JlptScore = {
  total: number;
  bySection: Record<string, number>;
};

export type JlptAnswerDetail = {
  questionId: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  questionCategory: string | null;
};

export function listPublicCourses() {
  return apiFetch<PublicCourse[]>("/public/courses");
}

export function getPublicCourseOutline(courseId: string) {
  return apiFetch<{
    id: string;
    title: string;
    subtitle?: string | null;
    jlptLevel: string;
    description: string | null;
    lessons: Array<{
      id: string;
      title: string;
      orderIndex: number;
      isBonus?: boolean;
      lessonType?: string | null;
    }>;
  }>(`/public/courses/${courseId}/outline`);
}

export function getPublicLessonPreview(lessonId: string) {
  return apiFetch<{
    id: string;
    title: string;
    orderIndex: number;
    course: { id: string; title: string; jlptLevel: string };
    vocabulary: Array<{
      vocabulary: { word: string; reading: string | null; meaning: string };
    }>;
    grammar: Array<{
      grammar: { title: string; pattern: string; meaningVi: string };
    }>;
  }>(`/public/lessons/${lessonId}/preview`);
}

export function getLanding() {
  return apiFetch<{
    tagline: string;
    courses: PublicCourse[];
    features: string[];
  }>("/public/landing");
}

export function startPlacementTest() {
  return apiFetch<ApiQuestion[]>("/public/placement-test/start", {
    method: "POST",
  });
}

export function submitPlacementTest(
  answers: Array<{ questionId: string; answer: string }>,
) {
  return apiFetch<{
    recommendedLevel: string;
    scoresByLevel: Record<string, unknown>;
    roadmap: {
      courseId: string;
      courseTitle: string;
      jlptLevel: string;
      startLessonId: string | null;
      startLessonTitle: string | null;
      startLessonOrderIndex: number | null;
    } | null;
    enrolled: boolean;
    requiresLogin: boolean;
  }>("/public/placement-test/submit", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function enrollCourse(courseId: string) {
  return apiFetch<{ enrolled: boolean; lessonsInitialized: number }>(
    `/student/courses/${courseId}/enroll`,
    { method: "POST" },
  );
}

export function getCourseLessons(courseId: string) {
  return apiFetch<
    Array<{
      id: string;
      title: string;
      orderIndex: number;
      progress: { status: string; miniTestScore?: number | null };
    }>
  >(`/student/courses/${courseId}/lessons`);
}

export type DialogueLine = {
  speaker: string;
  text: string;
  reading?: string;
  translation?: string;
};

export type JapaneseSegment =
  | {
      text: string;
    }
  | {
      kanji: string;
      reading: string;
    };

export type LessonPayload = {
  lesson: {
    id: string;
    title: string;
    slug?: string | null;
    description?: string | null;
    objective?: string | null;
    lessonType?: string | null;
    estimatedMinutes?: number | null;
    orderIndex: number;
    passThreshold: number;
    isBonus?: boolean;
    speakingPrompt?: string | null;
    course: { id: string; title: string; jlptLevel: string };
  };
  vocabulary: Array<{
    id: string;
    word: string;
    reading: string | null;
    meaning: string;
    memoryTip?: string | null;
  }>;
  grammar: Array<{
    id: string;
    title: string;
    jlpt: string;
    type: string | null;
    pattern: string;
    meaningVi: string;
    usage: string | null;
    notes: string | null;

    examples: Array<{
      segments: JapaneseSegment[];
      vi: string;
    }> | null;

    quiz: Array<{
      question: {
        segments: JapaneseSegment[];
      };
      choices: string[];
      answer: number;
    }> | null;
  }>;
  kanji: Array<{
    id: string;
    character: string;
    hanVietPronunciation: string | null;
    meaning: string;
    memoryTip: string | null;
    memoryImageUrl: string | null;
    memoryImageUpdatedAt: string | null;
    slug: string;
    readingsOn: string[];
    readingsKun: string[];
    strokeCount: number | null;
    jlptLevel: string;
    radical: string | null;
    examples: Array<{ word: string; reading: string | null; meaning: string }>;
  }>;
  conversations: Array<{
    id: string;
    title: string | null;
    dialogue: DialogueLine[];
  }>;
  progress: { status: string; miniTestScore?: number | null };
};

export function getLesson(id: string) {
  return apiFetch<LessonPayload>(`/student/lessons/${id}`);
}

export function postLessonSpeaking(
  lessonId: string,
  body: {
    text: string;
    sessionId?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  },
) {
  return apiFetch<{
    AI_Reply: string;
    Correction: string | null;
    sessionId: string;
    transcript: string;
  }>(`/student/lessons/${lessonId}/speaking/message`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getCourseKanji(courseId: string) {
  return apiFetch<{
    course: { jlptLevel: string; title: string };
    kanji: Array<{
      id: string;
      character: string;
      hanVietPronunciation: string | null;
      meaning: string;
      memoryTip: string | null;
      memoryImageUrl: string | null;
      memoryImageUpdatedAt: string | null;
      slug: string;
      readingsOn: string[];
      readingsKun: string[];
      strokeCount: number | null;
      jlptLevel: string;
      radical: string | null;
      examples: Array<{
        word: string;
        reading: string | null;
        meaning: string;
      }>;
    }>;
  }>(`/student/courses/${courseId}/kanji`);
}

export function getKanjiLearnedStatus(kanjiIds: string[]) {
  const ids = [...new Set(kanjiIds.filter(Boolean))];
  if (ids.length === 0) return Promise.resolve({ learnedIds: [] as string[] });
  const q = new URLSearchParams({ ids: ids.join(",") });
  return apiFetch<{ learnedIds: string[] }>(`/student/kanji/learned-status?${q}`);
}

export function getHandbookKanji(level?: string) {
  const q = level ? `?level=${encodeURIComponent(level)}` : "";
  return apiFetch<{
    items: Array<{
      id: string;
      itemId: string;
      isLearned: boolean;
      isFavorite: boolean;
      note: string | null;
      kanji: {
        id: string;
        character: string;
        hanVietPronunciation: string | null;
        meaning: string;
        memoryTip: string | null;
        memoryImageUrl: string | null;
        memoryImageUpdatedAt: string | null;
        slug: string;
        readingsOn: string[];
        readingsKun: string[];
        strokeCount: number | null;
        jlptLevel: string;
        radical: string | null;
        examples: Array<{
          word: string;
          reading: string | null;
          meaning: string;
        }>;
      };
    }>;
  }>(`/student/kanji/handbook${q}`);
}

export type MiniTestStartPayload = {
  sessionId: string;
  questions: ApiQuestion[];
};

export function getMiniTest(lessonId: string) {
  return apiFetch<MiniTestStartPayload>(`/student/lessons/${lessonId}/minitest`);
}

export function submitMiniTest(
  lessonId: string,
  sessionId: string,
  answers: Array<{ questionId: string; answer: string }>,
) {
  return apiFetch<{
    score: number;
    passed: boolean;
    passThreshold: number;
    correct: number;
    total: number;
    unlockedNext: string | null;
  }>(`/student/lessons/${lessonId}/minitest/submit`, {
    method: "POST",
    body: JSON.stringify({ sessionId, answers }),
  });
}

export function getDashboard() {
  return apiFetch<{
    enrollments: Array<{
      course: { id: string; title: string; jlptLevel: string };
    }>;
    stats: {
      lessonsCompleted: number;
      lessonsActive: string | null;
      activeLessonId?: string | null;
      activeCourseId?: string | null;
      lessonsActiveCount?: number;
      lessonsLocked: number;
      lessonsTotal?: number;
      lessonsInProgress: number;
      currentStreak: number;
      longestStreak: number;
    };
    progressChart: {
      byStatus: Array<{ label: string; value: number }>;
      byCourse: Array<{
        courseId: string;
        title: string;
        jlptLevel: string;
        completed: number;
        total: number;
        percent: number;
      }>;
      weeklyActivity: Array<{ week: string; count: number }>;
    };
    recentErrors: unknown[];
  }>("/student/dashboard");
}

export function getNotebookVocabulary(params: {
  level?: string;
  topic?: string;
  learned?: boolean;
}) {
  const q = new URLSearchParams();
  if (params.level) q.set("level", params.level);
  if (params.topic) q.set("topic", params.topic);
  if (params.learned != null) q.set("learned", String(params.learned));
  return apiFetch<{ items: Array<Record<string, unknown>> }>(
    `/student/notebook/vocabulary?${q}`,
  );
}

export function upsertMastery(body: {
  itemId: string;
  itemType: "vocabulary" | "kanji";
  isLearned?: boolean;
  isFavorite?: boolean;
  note?: string;
}) {
  return apiFetch("/student/mastery", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function generateReview(
  mode: "random" | "weakness" | "flashcard",
  count = 20,
  type: "kanji" | "vocabulary" | "grammar" | "mixed" = "mixed",
) {
  return apiFetch<{
    mode: string;
    type: string;
    questions: ApiQuestion[];
    items: Array<{
      id: string;
      itemType: string;
      front: string;
      back: string;
      reading?: string;
    }>;
  }>("/student/review/generate", {
    method: "POST",
    body: JSON.stringify({ mode, count, type }),
  });
}

export function getNotebookLearned(
  type: "kanji" | "vocabulary" | "grammar",
  params: { lessonId?: string; level?: string } = {},
) {
  const q = new URLSearchParams();
  if (params.lessonId) q.set("lessonId", params.lessonId);
  if (params.level) q.set("level", params.level);
  const qs = q.toString();
  return apiFetch<{ items: Array<Record<string, unknown>> }>(
    `/student/notebook/learned/${type}${qs ? `?${qs}` : ""}`,
  );
}

export function getNotebookCollected(
  type: "kanji" | "vocabulary" | "grammar",
  params: { level?: string } = {},
) {
  const q = new URLSearchParams();
  if (params.level) q.set("level", params.level);
  const qs = q.toString();
  return apiFetch<{ items: Array<Record<string, unknown>> }>(
    `/student/notebook/collected/${type}${qs ? `?${qs}` : ""}`,
  );
}

export function getNotebookLessons(type: "kanji" | "vocabulary" | "grammar") {
  return apiFetch<{
    lessons: Array<{
      id: string;
      title: string;
      orderIndex: number;
      course: { id: string; title: string; jlptLevel: string };
    }>;
  }>(`/student/notebook/lessons?type=${type}`);
}

export function generateNotebookReview(body: {
  pool: "learned" | "collected";
  type: "kanji" | "vocabulary" | "grammar";
  mode: "random" | "lesson" | "pick";
  count?: number;
  lessonIds?: string[];
  itemIds?: string[];
}) {
  return apiFetch<{
    mode: string;
    type: string;
    pool: string;
    items: Array<{
      id: string;
      itemType: string;
      front: string;
      back: string;
      reading?: string;
    }>;
  }>("/student/review/generate", {
    method: "POST",
    body: JSON.stringify({
      pool: body.pool,
      type: body.type,
      mode: body.mode,
      count: body.count ?? 15,
      lessonIds: body.lessonIds,
      itemIds: body.itemIds,
    }),
  });
}

export function submitReview(
  results: Array<{ questionId: string; correct: boolean; answer?: string }>,
) {
  return apiFetch("/student/review/submit", {
    method: "POST",
    body: JSON.stringify({ results }),
  });
}

export function postAiSpeakingStart() {
  return apiFetch<{
    AI_Reply: string;
    Correction: string | null;
    sessionId: string;
  }>("/student/ai-speaking/start", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function postAiSpeaking(body: {
  text: string;
  sessionId?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}) {
  return apiFetch<{
    AI_Reply: string;
    Correction: string | null;
    sessionId: string;
    transcript: string;
  }>("/student/ai-speaking/message", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listJlptExams(level?: string) {
  const q = level ? `?level=${encodeURIComponent(level)}` : "";
  return apiFetch<JlptExamListItem[]>(`/student/jlpt-sim/exams${q}`);
}

export type JlptSessionPayload = {
  sessionId: string;
  expiresAt: string;
  startedAt: string;
  durationMinutes: number;
  remainingMs: number;
  mockExamId: string;
  examTitle: string;
  jlptLevel: string;
  questionCount: number;
  questions: ApiQuestion[];
  resumed: boolean;
  maxAttempts: number;
  myAttemptCount: number;
  attemptsRemaining: number;
};

export function getActiveJlptSession(mockExamId: string) {
  return apiFetch<JlptSessionPayload | null>(
    `/student/jlpt-sim/active?mockExamId=${encodeURIComponent(mockExamId)}`,
  );
}

export function getJlptSession(sessionId: string) {
  return apiFetch<JlptSessionPayload>(`/student/jlpt-sim/${sessionId}`);
}

export function startJlptSim(level: string, mockExamId?: string) {
  return apiFetch<JlptSessionPayload>("/student/jlpt-sim/start", {
    method: "POST",
    body: JSON.stringify({ level, mockExamId }),
  });
}

export function submitJlptSim(
  sessionId: string,
  answers: Array<{ questionId: string; answer: string }>,
  autoSubmit = false,
) {
  return apiFetch<{
    score: JlptScore;
    submittedAt: string;
    details: JlptAnswerDetail[];
  }>(`/student/jlpt-sim/${sessionId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers, autoSubmit }),
  });
}

export type JlptHistoryItem = {
  id: string;
  level: string | null;
  score: JlptScore | null;
  submittedAt: string | null;
  isAutoSubmitted: boolean;
};

export function getJlptHistory() {
  return apiFetch<JlptHistoryItem[]>("/student/jlpt-sim/history");
}

export type MistakeRow = {
  id: string;
  source: string;
  questionText: string | null;
  userAnswer: string | null;
  correctAnswer: string | null;
  createdAt: string;
  lesson: { id: string; title: string; orderIndex: number } | null;
};

export function getMistakes() {
  return apiFetch<MistakeRow[]>("/student/mistakes");
}

export type OcrMeta = {
  engine: string;
  gpu: boolean;
  lang: string;
  confidence_avg?: number | null;
  line_count?: number;
  processing_ms?: number;
};

export type OcrVocabSuggestion = {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  jlptLevel: string;
};

export type OcrKanjiSuggestion = {
  id: string;
  character: string;
  meaning: string;
  jlptLevel: string;
  readingsOn: string[];
  readingsKun: string[];
};

export function postOcr(image: string) {
  return apiFetch<{
    extracted_text: string;
    suggested_vocabulary: OcrVocabSuggestion[];
    suggested_kanji: OcrKanjiSuggestion[];
    grammar_explanation: string | null;
    meta?: OcrMeta | null;
  }>("/student/ocr/analyze", {
    method: "POST",
    body: JSON.stringify({ image }),
  });
}

export function postOcrNotebookAdd(
  items: Array<{ itemId: string; itemType: "vocabulary" | "kanji" }>,
) {
  return apiFetch<{ added: number }>("/student/ocr/notebook/add", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export function getOcrStatus() {
  return apiFetch<{
    default_engine: string;
    use_gpu: boolean;
    paddle: {
      installed: boolean;
      version?: string;
      ocr_version?: string;
      model_tier?: string;
      cuda_compiled?: boolean;
      error?: string;
    };
  }>("/student/ocr/status");
}

export type OcrQuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string | null;
};

export function postOcrQuiz(image: string, questionCount: number) {
  return apiFetch<{
    extracted_text: string;
    questions: OcrQuizQuestion[];
    error?: string | null;
    meta?: OcrMeta | null;
  }>("/student/ocr/quiz/generate", {
    method: "POST",
    body: JSON.stringify({ image, questionCount }),
  });
}

export type OcrGradingError = {
  location: string;
  student_answer: string;
  correct_answer: string;
  explanation: string;
};

export function postOcrGrade(image: string, context?: string) {
  return apiFetch<{
    extracted_text: string;
    errors: OcrGradingError[];
    overall_feedback: string;
    score_estimate: string | null;
    error?: string | null;
    meta?: OcrMeta | null;
  }>("/student/ocr/grade", {
    method: "POST",
    body: JSON.stringify({ image, context: context?.trim() || undefined }),
  });
}

export function searchDictionary(q: string) {
  return apiFetch<{ vocabulary: unknown[]; grammar: unknown[] }>(
    `/student/dictionary/search?q=${encodeURIComponent(q)}`,
  );
}

export type { StudySetListRow as StudySetRow } from '../types/study-set.types';
export {
  addStudySetItems,
  cloneStudySet,
  createStudySet,
  deleteStudySet,
  getStudySet,
  listMyStudySets,
  listPublicStudySets,
  studySetAssetUrl,
  updateStudySet,
  uploadStudySetFile,
} from './studySetApi';

export type WebRtcMatchResult = {
  matched: boolean;
  roomId: string | null;
  peerId?: string;
  isInitiator?: boolean;
};

export function webrtcMatch() {
  return apiFetch<WebRtcMatchResult>("/student/webrtc/match", { method: "POST" });
}

export function webrtcLeave() {
  return apiFetch<{ left: boolean }>("/student/webrtc/leave", { method: "POST" });
}

export function postCommunityTranslate(text: string, targetLang = "vi") {
  return apiFetch<{ translation: string; error?: string | null }>("/student/community/translate", {
    method: "POST",
    body: JSON.stringify({ text, targetLang }),
  });
}

export function webrtcReport(body: {
  roomId?: string;
  reportedUserId?: string;
  reason: string;
}) {
  return apiFetch("/student/webrtc/report", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function webrtcEvaluate(body: {
  roomId?: string;
  transcripts: Array<{ speaker: string; text: string }>;
}) {
  return apiFetch<{ summary: string; feedback_per_speaker: unknown[] }>(
    "/student/webrtc/evaluate",
    { method: "POST", body: JSON.stringify(body) },
  );
}
