import { describe, expect, it } from "vitest";

import {
  parseKanjiExampleCell,
  parseKanjiExamplesFromRow,
  parseKanjiReadingList,
} from "./seed-kanji-n5-from-csv.js";

describe("parseKanjiExampleCell", () => {
  it("parses word, reading, and meaning", () => {
    expect(parseKanjiExampleCell("一つ【ひとつ】một cái")).toEqual({
      word: "一つ",
      reading: "ひとつ",
      meaning: "một cái",
    });
  });

  it("keeps slash readings and long meanings", () => {
    expect(
      parseKanjiExampleCell(
        "一日【いちにち/ついたち】một ngày / ngày mùng 1",
      ),
    ).toEqual({
      word: "一日",
      reading: "いちにち/ついたち",
      meaning: "một ngày / ngày mùng 1",
    });
  });

  it("returns null when brackets are missing", () => {
    expect(parseKanjiExampleCell("一つひとつ")).toBeNull();
  });
});

describe("parseKanjiReadingList", () => {
  it("splits kun/on readings and skips empty markers", () => {
    expect(parseKanjiReadingList("ひと, ひと.つ")).toEqual(["ひと", "ひと.つ"]);
    expect(parseKanjiReadingList("(không có)")).toEqual([]);
  });
});

describe("parseKanjiExamplesFromRow", () => {
  it("collects Word 1–3 columns", () => {
    const examples = parseKanjiExamplesFromRow({
      "Word 1": "一つ【ひとつ】một cái",
      "Word 2": "一人【ひとり】một người",
      "Word 3": "",
    });
    expect(examples).toHaveLength(2);
    expect(examples[1]?.word).toBe("一人");
  });
});
