export const JPD1_COURSE_META = {
  slug: "jpd1",
  title: "JPD1 - Tiếng Nhật nhập môn",
  subtitle: "Dành cho sinh viên mới bắt đầu học tiếng Nhật",
  level: "Beginner",
  jlptLevel: "JPD1",
  description:
    "Khóa học giúp người học làm quen với tiếng Nhật cơ bản thông qua các tình huống giao tiếp gần gũi: giới thiệu bản thân, mua sắm, gọi món, hỏi giờ, nói lịch sinh hoạt.",
  sortOrder: 0,
} as const;

export type Jpd1VocabSeed = {
  word: string;
  reading?: string;
  meaning: string;
  memoryTip?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  partOfSpeech?: string;
};

export type Jpd1GrammarSeed = {
  title: string;
  pattern: string;
  meaningVi: string;
  usage?: string;
  notes?: string;
  examples: Array<{ segments: Array<{ text: string } | { kanji: string; reading: string }>; vi: string }>;
  quiz?: Array<{
    question: { segments: Array<{ text: string } | { kanji: string; reading: string }> };
    choices: string[];
    answer: number;
  }>;
};

export type Jpd1DialogueSeed = {
  title: string;
  situationVi: string;
  lines: Array<{
    speaker: string;
    segments: Array<{ text: string } | { kanji: string; reading: string }>;
    vi: string;
  }>;
};

export type Jpd1KanjiSeed = {
  character: string;
  hanViet: string;
  meaning: string;
  readingsOn: string[];
  readingsKun: string[];
  strokeCount?: number;
  memoryTip?: string;
  examples: Array<{ word: string; reading?: string; meaning: string }>;
};

export type Jpd1FinalTaskSeed = {
  title: string;
  instructionVi: string;
  promptJapanese: string;
  expectedPattern: string;
};

export type Jpd1LessonSeed = {
  orderIndex: number;
  slug: string;
  title: string;
  description: string;
  objective: string;
  lessonType: "main" | "support";
  isBonus: boolean;
  estimatedMinutes: number;
  vocabulary: Jpd1VocabSeed[];
  grammar: Jpd1GrammarSeed[];
  dialogues: Jpd1DialogueSeed[];
  kanji: Jpd1KanjiSeed[];
  finalTask?: Jpd1FinalTaskSeed;
  speakingPrompt?: string;
};
