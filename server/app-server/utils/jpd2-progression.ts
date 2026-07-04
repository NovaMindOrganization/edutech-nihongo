/** Ranh giới tiết JPD2 theo orderIndex. */

export const JPD2_UNIT_RANGES = [

  { unit: 4, start: 0, end: 5, label: "Bài 4" },

  { unit: 5, start: 6, end: 8, label: "Bài 5" },

  { unit: 6, start: 9, end: 14, label: "Bài 6" },

  { unit: 7, start: 15, end: 22, label: "Bài 7" },

] as const;



export const JPD2_KANJI_MINITEST_MAX = 8;



export function jpd2UnitForOrderIndex(orderIndex: number): number | null {

  for (const range of JPD2_UNIT_RANGES) {

    if (orderIndex >= range.start && orderIndex <= range.end) return range.unit;

  }

  return null;

}



export function isJpd2SupportLesson(lesson: {

  isBonus: boolean;

  lessonType?: string | null;

}): boolean {

  return lesson.isBonus || lesson.lessonType === "support";

}



export function defaultJpd2PassThreshold(seed: {

  lessonType: "main" | "support";

  vocabulary: unknown[];

  kanji: unknown[];

  passThreshold?: number;

}): number {

  if (seed.passThreshold != null) return seed.passThreshold;

  if (seed.lessonType === "support") return 60;

  if (seed.vocabulary.length === 0 && seed.kanji.length > 0) return 65;

  return 70;

}


