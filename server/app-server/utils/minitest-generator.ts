import { randomUUID } from "node:crypto";

import {
  buildMcqOptions,
  isLongJapanesePhrase,
  minHalfCount,
  shuffle,
  type McqOption,
} from "./minitest-options.js";

export const MINITEST_VOCAB_CATEGORY = "mini_test_vocab";
export const MINITEST_VOCAB_PHRASE_CATEGORY = "mini_test_vocab_phrase";
export const MINITEST_KANJI_CATEGORY = "mini_test_kanji";

export type MiniTestVocabRow = {
  id: string;
  lessonId: string | null;
  word: string;
  reading: string | null;
  meaning: string;
};

export type MiniTestKanjiRow = {
  character: string;
  meaning: string;
  hanVietPronunciation: string | null;
};

type QuestionDraft = {
  questionText: string;
  correctAnswer: string;
  distractorPool: string[];
  targetLength?: number;
  questionCategory: string;
};

export type GeneratedMiniTestQuestion = {
  id: string;
  questionText: string;
  questionType: "multiple_choice";
  options: McqOption[];
  correctAnswer: string;
  questionCategory: string;
};

/** Cách hiển thị từ vựng — ưu tiên reading (học viên học cách đọc trước). */
export function vocabMiniTestPrompt(
  row: Pick<MiniTestVocabRow, "word" | "reading">,
): string {
  return (row.reading?.trim() || row.word.trim()).trim();
}

export function buildVocabQuestionDrafts(
  lessonVocab: MiniTestVocabRow[],
  courseVocab: MiniTestVocabRow[],
): QuestionDraft[] {
  const count = minHalfCount(lessonVocab.length);
  if (count === 0) return [];

  const picked = shuffle(lessonVocab).slice(0, count);
  const lessonMeanings = lessonVocab.map((v) => v.meaning.trim()).filter(Boolean);
  const courseMeanings = courseVocab.map((v) => v.meaning.trim()).filter(Boolean);
  const lessonPrompts = lessonVocab
    .map((v) => vocabMiniTestPrompt(v))
    .filter(Boolean);
  const coursePrompts = courseVocab
    .map((v) => vocabMiniTestPrompt(v))
    .filter(Boolean);

  return picked.map((v) => {
    const prompt = vocabMiniTestPrompt(v);
    const meaning = v.meaning.trim();

    if (isLongJapanesePhrase(prompt)) {
      const sameLessonPrompts = lessonVocab
        .filter((item) => item.id !== v.id)
        .map((item) => vocabMiniTestPrompt(item))
        .filter(Boolean);
      return {
        questionText: `Từ nào dưới đây có nghĩa là "${meaning}"?`,
        correctAnswer: prompt,
        distractorPool: [...sameLessonPrompts, ...coursePrompts],
        targetLength: prompt.length,
        questionCategory: MINITEST_VOCAB_PHRASE_CATEGORY,
      };
    }

    const sameLessonMeanings = lessonVocab
      .filter((item) => item.id !== v.id)
      .map((item) => item.meaning.trim());

    return {
      questionText: `「${prompt}」の意味は？`,
      correctAnswer: meaning,
      distractorPool: [...sameLessonMeanings, ...lessonMeanings, ...courseMeanings],
      targetLength: meaning.length,
      questionCategory: MINITEST_VOCAB_CATEGORY,
    };
  });
}

export function buildKanjiQuestionDrafts(lessonKanji: MiniTestKanjiRow[]): QuestionDraft[] {
  if (lessonKanji.length === 0) return [];

  return lessonKanji.map((kanji) => {
    const meaning = kanji.meaning.trim();
    const others = lessonKanji.filter((k) => k.character !== kanji.character);

    const distractorPool = [
      ...others.map((k) => k.meaning.trim()),
      ...others
        .map((k) => k.hanVietPronunciation?.trim())
        .filter((v): v is string => Boolean(v)),
    ];

    return {
      questionText: `「${kanji.character}」の意味は？`,
      correctAnswer: meaning,
      distractorPool,
      targetLength: meaning.length,
      questionCategory: MINITEST_KANJI_CATEGORY,
    };
  });
}

export function buildLessonMiniTestMcqs(params: {
  lessonVocab: MiniTestVocabRow[];
  courseVocab: MiniTestVocabRow[];
  lessonKanji: MiniTestKanjiRow[];
  optionCount?: number;
}): GeneratedMiniTestQuestion[] {
  const optionCount = params.optionCount ?? 4;
  const drafts = [
    ...buildVocabQuestionDrafts(params.lessonVocab, params.courseVocab),
    ...buildKanjiQuestionDrafts(params.lessonKanji),
  ];

  const questions = drafts.map((draft) => {
    const { options, correctAnswer } = buildMcqOptions({
      correctAnswer: draft.correctAnswer,
      distractorPool: draft.distractorPool,
      optionCount,
      targetLength: draft.targetLength,
    });

    return {
      id: randomUUID(),
      questionText: draft.questionText,
      questionType: "multiple_choice" as const,
      options,
      correctAnswer,
      questionCategory: draft.questionCategory,
    };
  });

  return shuffle(questions);
}

export function toClientMiniTestQuestion(
  q: GeneratedMiniTestQuestion,
): Omit<GeneratedMiniTestQuestion, "correctAnswer"> {
  const { correctAnswer: _omit, ...client } = q;
  return client;
}
