import { describe, expect, it } from "vitest";

import {
  lessonNumbersFromKanjiLessonRows,
  parseKanjiLessonMapRows,
} from "./seed-kanji-lessons-n5.js";

describe("parseKanjiLessonMapRows", () => {
  it("parses lesson_number, character, order_index", () => {
    const rows = parseKanjiLessonMapRows([
      { lesson_number: "3", character: "一", order_index: "1" },
      { lesson_number: "3", character: "二", order_index: "2" },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      lessonNumber: 3,
      character: "一",
      orderIndex: 1,
    });
  });

  it("collects lesson numbers", () => {
    const rows = parseKanjiLessonMapRows([
      { lesson_number: "2", character: "本", order_index: "1" },
      { lesson_number: "1", character: "人", order_index: "1" },
    ]);
    expect(lessonNumbersFromKanjiLessonRows(rows)).toEqual([1, 2]);
  });
});
