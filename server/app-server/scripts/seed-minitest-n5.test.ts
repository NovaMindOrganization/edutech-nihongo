import { describe, expect, it } from "vitest";

import {
  buildKanjiQuestionDrafts,
  buildVocabQuestionDrafts,
} from "./seed-minitest-n5.js";

describe("seed-minitest-n5 drafts", () => {
  it("picks at least half vocabulary", () => {
    const lessonVocab = Array.from({ length: 6 }, (_, i) => ({
      id: `v${i}`,
      lessonId: "l1",
      word: `語${i}`,
      meaning: `nghĩa ${i}`,
    }));
    const drafts = buildVocabQuestionDrafts(lessonVocab, lessonVocab);
    expect(drafts.length).toBe(3);
  });

  it("uses Japanese phrase mode for long vocabulary", () => {
    const lessonVocab = [
      {
        id: "1",
        lessonId: "l1",
        word: "お仕事は何ですか",
        meaning: "Công việc của bạn là gì?",
      },
      {
        id: "2",
        lessonId: "l1",
        word: "お名前をもう一度お願いします",
        meaning: "Xin cho biết tên một lần nữa",
      },
    ];
    const drafts = buildVocabQuestionDrafts(lessonVocab, lessonVocab);
    expect(drafts[0].questionCategory).toBe("mini_test_vocab_phrase");
    expect(drafts[0].correctAnswer).toContain("お");
  });

  it("creates one question per lesson kanji", () => {
    const kanji = [
      { character: "食", meaning: "Ăn", hanVietPronunciation: "Thực" },
      { character: "飲", meaning: "Uống", hanVietPronunciation: "Ẩm" },
    ];
    const drafts = buildKanjiQuestionDrafts(kanji);
    expect(drafts).toHaveLength(2);
    expect(drafts[0].questionCategory).toBe("mini_test_kanji");
  });

  it("kanji distractors only from same lesson", () => {
    const lessonKanji = [
      { character: "食", meaning: "Ăn", hanVietPronunciation: "Thực" },
      { character: "飲", meaning: "Uống", hanVietPronunciation: "Ẩm" },
      { character: "見", meaning: "Nhìn", hanVietPronunciation: "Kiến" },
      { character: "聞", meaning: "Nghe", hanVietPronunciation: "Văn" },
    ];
    const drafts = buildKanjiQuestionDrafts(lessonKanji);
    const pool = drafts[0].distractorPool;
    expect(pool).not.toContain("Nước");
    expect(pool).toContain("Uống");
    expect(pool).toContain("Ẩm");
  });
});
