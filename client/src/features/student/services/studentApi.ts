import { apiFetch } from "@/services/httpClient";

export type PublicCourse = {
  id: string;
  title: string;
  jlptLevel: string;
  description: string | null;
  lessons: Array<{
    id: string;
    title: string;
    orderIndex: number;
    isBonus: boolean;
  }>;
};

export type ApiQuestion = {
  id: string;
  questionText: string;
  questionType: string;
  options?: Array<{ label: string; text: string }> | null;
  jlptLevel?: string | null;
};

export function listPublicCourses() {
  return apiFetch<PublicCourse[]>("/public/courses");
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

export type LessonPayload = {
  lesson: {
    id: string;
    title: string;
    orderIndex: number;
    passThreshold: number;
    speakingPrompt?: string | null;
    course: { id: string; title: string; jlptLevel: string };
  };
  vocabulary: Array<{
    id: string;
    word: string;
    reading: string | null;
    meaning: string;
  }>;
  grammar: Array<{
    id: string;
    pattern: string;
    meaning: string;
    structure: string | null;
  }>;
  kanji: Array<{
    id: string;
    character: string;
    hanVietPronunciation: string | null;
    meaning: string;
    memoryTip: string | null;
    memoryImageUrl: string | null;
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

export function getHandbookKanji() {
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
  }>("/student/kanji/handbook");
}

export function getMiniTest(lessonId: string) {
  return apiFetch<ApiQuestion[]>(`/student/lessons/${lessonId}/minitest`);
}

export function submitMiniTest(
  lessonId: string,
  answers: Array<{ questionId: string; answer: string }>,
) {
  return apiFetch<{
    score: number;
    passed: boolean;
    passThreshold: number;
    unlockedNext: string | null;
  }>(`/student/lessons/${lessonId}/minitest/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
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
      lessonsLocked: number;
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

export function startJlptSim(level: string, mockExamId?: string) {
  return apiFetch<{
    sessionId: string;
    expiresAt: string;
    durationMinutes: number;
    questions: ApiQuestion[];
  }>("/student/jlpt-sim/start", {
    method: "POST",
    body: JSON.stringify({ level, mockExamId }),
  });
}

export function submitJlptSim(
  sessionId: string,
  answers: Array<{ questionId: string; answer: string }>,
  autoSubmit = false,
) {
  return apiFetch<{ score: Record<string, unknown> }>(
    `/student/jlpt-sim/${sessionId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ answers, autoSubmit }),
    },
  );
}

export function getJlptHistory() {
  return apiFetch("/student/jlpt-sim/history");
}

export type OcrMeta = {
  engine: string;
  gpu: boolean;
  lang: string;
  confidence_avg?: number | null;
  line_count?: number;
  processing_ms?: number;
};

export function postOcr(image: string) {
  return apiFetch<{
    extracted_text: string;
    matched_vocabulary: Array<{
      id: string;
      word: string;
      reading: string | null;
      meaning: string;
    }>;
    matched_grammar: Array<{ id: string; pattern: string; meaning: string }>;
    grammar_explanation: string | null;
    meta?: OcrMeta | null;
  }>("/student/ocr/analyze", {
    method: "POST",
    body: JSON.stringify({ image }),
  });
}

export function getOcrStatus() {
  return apiFetch<{
    default_engine: string;
    use_gpu: boolean;
    paddle: { installed: boolean; cuda_compiled?: boolean; error?: string };
  }>("/student/ocr/status");
}

export function searchDictionary(q: string) {
  return apiFetch<{ vocabulary: unknown[]; grammar: unknown[] }>(
    `/student/dictionary/search?q=${encodeURIComponent(q)}`,
  );
}

export type StudySetRow = {
  id: string;
  title: string;
  description?: string | null;
  isPublic?: boolean;
};

export function listPublicStudySets() {
  return apiFetch<StudySetRow[]>("/student/studysets/public");
}

export function listMyStudySets() {
  return apiFetch<StudySetRow[]>("/student/studysets/mine");
}

export function createStudySet(body: {
  title: string;
  description?: string;
  isPublic?: boolean;
  cards?: Array<{ front: string; back: string }>;
}) {
  return apiFetch("/student/studysets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function cloneStudySet(id: string) {
  return apiFetch(`/student/studysets/${id}/clone`, { method: "POST" });
}

export function webrtcMatch() {
  return apiFetch<{ matched: boolean; roomId: string | null; peerId?: string }>(
    "/student/webrtc/match",
    { method: "POST" },
  );
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
