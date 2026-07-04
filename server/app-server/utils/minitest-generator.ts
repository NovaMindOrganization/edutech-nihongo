import { randomUUID } from "node:crypto";

import { JPD1_KANJI_MINITEST_MAX } from "./jpd1-progression.js";
import { JPD2_KANJI_MINITEST_MAX } from "./jpd2-progression.js";
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
export const MINITEST_GRAMMAR_CATEGORY = "mini_test_grammar";

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

export type MiniTestGrammarQuizRow = {
  questionText: string;
  correctAnswer: string;
  distractorPool: string[];
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

export function buildKanjiQuestionDrafts(
  lessonKanji: MiniTestKanjiRow[],
  options?: { jlptLevel?: string | null },
): QuestionDraft[] {
  if (lessonKanji.length === 0) return [];

  let picked = lessonKanji;
  const kanjiCap =
    options?.jlptLevel === "JPD2"
      ? JPD2_KANJI_MINITEST_MAX
      : options?.jlptLevel?.startsWith("JPD")
        ? JPD1_KANJI_MINITEST_MAX
        : null;
  if (kanjiCap != null && lessonKanji.length > kanjiCap) {
    picked = shuffle(lessonKanji).slice(0, kanjiCap);
  }

  return picked.map((kanji) => {
    const meaning = kanji.meaning.trim();
    const others = picked.filter((k) => k.character !== kanji.character);

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

function segmentsToPlainText(
  segments: Array<{ text?: string; kanji?: string; reading?: string }>,
): string {
  return segments
    .map((s) => s.text ?? s.kanji ?? "")
    .join("")
    .trim();
}

export function buildGrammarQuestionDrafts(
  grammarQuizzes: MiniTestGrammarQuizRow[],
): QuestionDraft[] {
  if (grammarQuizzes.length === 0) return [];

  return grammarQuizzes.map((item) => ({
    questionText: item.questionText,
    correctAnswer: item.correctAnswer,
    distractorPool: item.distractorPool,
    targetLength: item.correctAnswer.length,
    questionCategory: MINITEST_GRAMMAR_CATEGORY,
  }));
}

export function extractGrammarQuizzesFromLesson(
  grammarRows: Array<{ quiz: unknown }>,
  maxQuestions = 4,
): MiniTestGrammarQuizRow[] {
  const items: MiniTestGrammarQuizRow[] = [];

  for (const row of grammarRows) {
    if (!row.quiz || !Array.isArray(row.quiz)) continue;
    for (const raw of row.quiz) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
      const q = raw as {
        question?: { segments?: Array<{ text?: string; kanji?: string }> };
        choices?: string[];
        answer?: number;
      };
      const choices = q.choices?.filter((c) => typeof c === "string" && c.trim()) ?? [];
      const answerIdx = typeof q.answer === "number" ? q.answer : -1;
      if (choices.length < 2 || answerIdx < 0 || answerIdx >= choices.length) continue;

      const questionText = q.question?.segments
        ? segmentsToPlainText(q.question.segments) || "Chọn đáp án đúng:"
        : "Chọn đáp án đúng:";
      const correctAnswer = choices[answerIdx].trim();
      const distractorPool = choices.filter((_, i) => i !== answerIdx);

      items.push({ questionText, correctAnswer, distractorPool });
      if (items.length >= maxQuestions) return items;
    }
  }

  return items;
}

export function buildLessonMiniTestMcqs(params: {
  lessonVocab: MiniTestVocabRow[];
  courseVocab: MiniTestVocabRow[];
  lessonKanji: MiniTestKanjiRow[];
  grammarQuizzes?: MiniTestGrammarQuizRow[];
  optionCount?: number;
  jlptLevel?: string | null;
}): GeneratedMiniTestQuestion[] {
  const optionCount = params.optionCount ?? 4;
  const includeGrammar = params.jlptLevel?.startsWith("JPD") ?? false;
  const drafts = [
    ...buildVocabQuestionDrafts(params.lessonVocab, params.courseVocab),
    ...buildKanjiQuestionDrafts(params.lessonKanji, { jlptLevel: params.jlptLevel }),
    ...(includeGrammar
      ? buildGrammarQuestionDrafts(params.grammarQuizzes ?? [])
      : []),
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
