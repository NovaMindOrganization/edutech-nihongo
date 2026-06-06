import { describe, expect, it } from "vitest";

import {
  buildMcqOptions,
  isLongJapanesePhrase,
  minHalfCount,
  pickLengthSimilarDistractors,
} from "./minitest-options.js";

describe("minitest-options", () => {
  it("minHalfCount rounds up half", () => {
    expect(minHalfCount(0)).toBe(0);
    expect(minHalfCount(5)).toBe(3);
    expect(minHalfCount(6)).toBe(3);
  });

  it("detects long Japanese phrases", () => {
    expect(isLongJapanesePhrase("お仕事は何ですか")).toBe(true);
    expect(isLongJapanesePhrase("私")).toBe(false);
  });

  it("pickLengthSimilarDistractors prefers similar length", () => {
    const picked = pickLengthSimilarDistractors(
      ["短い", "お名前をもう一度お願いします", "こんにちは"],
      "お仕事は何ですか",
      2,
      "お仕事は何ですか".length,
    );
    expect(picked.some((p) => p.includes("お名前"))).toBe(true);
  });

  it("buildMcqOptions keeps correct answer text", () => {
    const { options, correctAnswer } = buildMcqOptions({
      correctAnswer: "Tôi",
      distractorPool: ["Bạn", "Chúng ta", "Anh ấy"],
      optionCount: 4,
    });
    expect(correctAnswer).toBe("Tôi");
    expect(options.map((o) => o.text)).toContain("Tôi");
  });
});
