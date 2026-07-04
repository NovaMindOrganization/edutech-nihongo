import { describe, expect, it } from "vitest";

import { buildLessonMiniTestMcqs, toClientMiniTestQuestion } from "./minitest-generator.js";
import { minHalfCount } from "./minitest-options.js";

describe("buildLessonMiniTestMcqs", () => {
  const lessonVocab = Array.from({ length: 6 }, (_, i) => ({
    id: `v${i}`,
    lessonId: "l1",
    word: `word${i}`,
    reading: `よみ${i}`,
    meaning: `nghĩa ${i}`,
  }));

  const lessonKanji = [
    { character: "食", meaning: "Ăn", hanVietPronunciation: "Thực" },
    { character: "飲", meaning: "Uống", hanVietPronunciation: "Ẩm" },
  ];

  it("caps kanji questions for JPD1", () => {
    const manyKanji = Array.from({ length: 14 }, (_, i) => ({
      character: String.fromCharCode(0x4e00 + i),
      meaning: `nghĩa ${i}`,
      hanVietPronunciation: `HV${i}`,
    }));
    const questions = buildLessonMiniTestMcqs({
      lessonVocab: [],
      courseVocab: [],
      lessonKanji: manyKanji,
      jlptLevel: "JPD1",
    });
    expect(questions).toHaveLength(8);
  });

  it("includes ~50% vocab and all kanji", () => {
    const questions = buildLessonMiniTestMcqs({
      lessonVocab,
      courseVocab: lessonVocab,
      lessonKanji,
    });
    const vocabCount = questions.filter((q) =>
      q.questionCategory.startsWith("mini_test_vocab"),
    ).length;
    const kanjiCount = questions.filter((q) => q.questionCategory === "mini_test_kanji").length;
    expect(vocabCount).toBe(minHalfCount(lessonVocab.length));
    expect(kanjiCount).toBe(lessonKanji.length);
  });

  it("client payload never includes correctAnswer", () => {
    const questions = buildLessonMiniTestMcqs({
      lessonVocab: lessonVocab.slice(0, 2),
      courseVocab: lessonVocab,
      lessonKanji: [],
    });
    for (const q of questions) {
      const client = toClientMiniTestQuestion(q);
      expect(client).not.toHaveProperty("correctAnswer");
    }
  });
});

