export type StudySetContentType =
  | 'vocabulary'
  | 'grammar'
  | 'kanji'
  | 'listening'
  | 'speaking';

export type StudySetModerationStatus = 'pending' | 'approved' | 'rejected';

export type StudySetTypeCounts = Record<StudySetContentType, number>;

export type StudySetOwner = {
  id: string;
  displayName: string | null;
  email: string;
};

export type StudySetVocabContent = {
  word: string;
  reading?: string;
  meaning: string;
  meaningEn?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  audioUrl?: string;
};

export type StudySetGrammarContent = {
  title: string;
  pattern: string;
  meaningVi: string;
  usage?: string;
  notes?: string;
  examples: Array<{ jp: string; vi: string; reading?: string }>;
};

export type StudySetKanjiContent = {
  character: string;
  meaning: string;
  readingsOn: string[];
  readingsKun: string[];
  hanViet?: string;
  strokeCount?: number;
  memoryTip?: string;
  examples: Array<{ word: string; reading?: string; meaning: string }>;
};

export type StudySetListeningContent = {
  title: string;
  audioUrl: string;
  transcript?: string;
  questions?: Array<{ question: string; options: string[]; answer: number }>;
};

export type StudySetSpeakingContent = {
  title: string;
  prompt: string;
  sampleDialogue?: Array<{ speaker: string; text: string; translation?: string }>;
  audioUrl?: string;
};

export type StudySetItemContent =
  | StudySetVocabContent
  | StudySetGrammarContent
  | StudySetKanjiContent
  | StudySetListeningContent
  | StudySetSpeakingContent;

export type StudySetItemRow = {
  id: string;
  studySetId: string;
  contentType: StudySetContentType;
  content: StudySetItemContent;
  orderIndex: number;
};

export type StudySetListRow = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  tags: string[];
  isPublic: boolean;
  moderationStatus: StudySetModerationStatus;
  moderationNote?: string | null;
  viewCount: number;
  cloneCount: number;
  createdAt: string;
  owner?: StudySetOwner;
  itemCount: number;
  typeCounts: StudySetTypeCounts;
};

export type StudySetQuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string;
};

export const QUIZ_QUESTION_COUNT_MIN = 3;
export const QUIZ_QUESTION_COUNT_MAX = 30;

export function suggestQuizQuestionCount(itemCount: number): number {
  return Math.min(
    QUIZ_QUESTION_COUNT_MAX,
    Math.max(QUIZ_QUESTION_COUNT_MIN, Math.ceil(itemCount * 2)),
  );
}

export type StudySetQuizPayload = {
  questions: StudySetQuizQuestion[];
  generatedAt?: string;
  questionCount?: number;
};

export type StudySetDetail = StudySetListRow & {
  items: StudySetItemRow[];
  quiz: StudySetQuizPayload | null;
  quizQuestionCount: number | null;
  quizGeneratedAt: string | null;
  canEdit?: boolean;
};

export type StudySetPublicList = {
  items: StudySetListRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StudySetItemInput = {
  contentType: StudySetContentType;
  content: StudySetItemContent;
};

export const STUDY_SET_CONTENT_LABELS: Record<StudySetContentType, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  kanji: 'Kanji',
  listening: 'Luyện nghe',
  speaking: 'Giao tiếp',
};

export const STUDY_SET_CONTENT_COLORS: Record<StudySetContentType, string> = {
  vocabulary: 'bg-emerald-100 text-emerald-800',
  grammar: 'bg-violet-100 text-violet-800',
  kanji: 'bg-amber-100 text-amber-800',
  listening: 'bg-sky-100 text-sky-800',
  speaking: 'bg-rose-100 text-rose-800',
};
