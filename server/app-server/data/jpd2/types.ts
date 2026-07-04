export const JPD2_COURSE_META = {
  slug: "jpd2",
  title: "JPD2 - Tiếng Nhật sơ cấp",
  subtitle: "Tiếp nối JPD1 — Bài 4 đến Bài 7",
  level: "Beginner",
  jlptLevel: "JPD2",
  description:
    "Khóa sơ cấp — Bài 4 (6 tiết) · Bài 5 (3 tiết) · Bài 6 (6 tiết, gồm kanji) · Bài 7 (8 tiết, kanji trước thể Te).",
  sortOrder: 1,
} as const;

export type Jpd2VocabSeed = {
  word: string;
  reading?: string;
  meaning: string;
  memoryTip?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  partOfSpeech?: string;
};

export type Jpd2GrammarDrillSeed = {
  labelVi: string;
  modelJa: string;
  segments?: Array<{ text: string } | { kanji: string; reading: string }>;
  vi?: string;
  hintVi?: string;
};

export type Jpd2GrammarSeed = {
  title: string;
  pattern: string;
  meaningVi: string;
  usage?: string;
  notes?: string;
  challengeLabel?: string;
  examples: Array<{ segments: Array<{ text: string } | { kanji: string; reading: string }>; vi: string }>;
  drills?: Jpd2GrammarDrillSeed[];
  quiz?: Array<{
    question: { segments: Array<{ text: string } | { kanji: string; reading: string }> };
    choices: string[];
    answer: number;
  }>;
};

export type Jpd2DialogueSeed = {
  title: string;
  situationVi: string;
  lines: Array<{
    speaker: string;
    segments: Array<{ text: string } | { kanji: string; reading: string }>;
    vi: string;
  }>;
};

export type Jpd2KanjiSeed = {
  character: string;
  hanViet: string;
  meaning: string;
  readingsOn: string[];
  readingsKun: string[];
  strokeCount?: number;
  memoryTip?: string;
  examples: Array<{ word: string; reading?: string; meaning: string }>;
};

export type Jpd2FinalTaskSeed = {
  title: string;
  instructionVi: string;
  promptJapanese: string;
  expectedPattern: string;
};

export type Jpd2SpeakingStepSeed = {
  id: number;
  taskVi: string;
  guideVi: string;
  modelJa: string;
  aiReply: string;
  acceptPattern: string;
  praiseVi?: string;
  hintVi?: string;
};

export type Jpd2LessonSeed = {
  orderIndex: number;
  slug: string;
  title: string;
  description: string;
  objective: string;
  lessonType: "main" | "support";
  isBonus: boolean;
  estimatedMinutes: number;
  passThreshold?: number;
  vocabulary: Jpd2VocabSeed[];
  grammar: Jpd2GrammarSeed[];
  dialogues: Jpd2DialogueSeed[];
  kanji: Jpd2KanjiSeed[];
  finalTask?: Jpd2FinalTaskSeed;
  speakingPrompt?: string;
  speakingSteps?: Jpd2SpeakingStepSeed[];
};
