import { describe, expect, it } from "vitest";

import {
  createKanjiSlug,
  isKanjiMigrationPlaceholderSlug,
  isStandardKanjiSlug,
  kanjiSlugNeedsRepair,
  reserveUniqueKanjiSlug,
} from "./kanji-slug.js";

describe("createKanjiSlug", () => {
  it("maps 火 to kanji-706b", () => {
    expect(createKanjiSlug("火")).toBe("kanji-706b");
  });

  it("maps 一 to kanji-4e00", () => {
    expect(createKanjiSlug("一")).toBe("kanji-4e00");
  });
});

describe("kanjiSlugNeedsRepair", () => {
  const id = "aef4948b-ab31-4fb0-92d1-6e6330a9dcde";

  it("flags migration placeholder slugs", () => {
    expect(
      kanjiSlugNeedsRepair(`kanji-${id.replace(/-/g, "")}`, "火", id),
    ).toBe(true);
  });

  it("accepts standard slug for character", () => {
    expect(kanjiSlugNeedsRepair("kanji-706b", "火", id)).toBe(false);
  });
});

describe("isStandardKanjiSlug", () => {
  it("accepts collision suffix", () => {
    expect(isStandardKanjiSlug("kanji-4e00-2", "一")).toBe(true);
    expect(isStandardKanjiSlug("kanji-4e00-x", "一")).toBe(false);
  });
});

describe("reserveUniqueKanjiSlug", () => {
  it("allocates suffix on collision", () => {
    const used = new Set<string>(["kanji-4e00"]);
    expect(reserveUniqueKanjiSlug("一", used)).toBe("kanji-4e00-2");
  });
});

describe("isKanjiMigrationPlaceholderSlug", () => {
  it("matches uuid-based placeholder", () => {
    const id = "aef4948b-ab31-4fb0-92d1-6e6330a9dcde";
    expect(
      isKanjiMigrationPlaceholderSlug(
        "kanji-aef4948bab314fb092d16e6330a9dcde",
        id,
      ),
    ).toBe(true);
  });
});
