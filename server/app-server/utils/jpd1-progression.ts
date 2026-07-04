/** Ranh giới tiết theo giáo trình JPD1 (orderIndex). */
export const JPD1_UNIT_RANGES = [
  { unit: 1, start: 0, end: 4, label: "Bài 1" },
  { unit: 2, start: 5, end: 8, label: "Bài 2" },
  { unit: 3, start: 9, end: 14, label: "Bài 3" },
] as const;

export const JPD1_KANJI_MINITEST_MAX = 8;

export function isJpd1SupportLesson(lesson: {
  isBonus: boolean;
  lessonType?: string | null;
}): boolean {
  return lesson.isBonus || lesson.lessonType === "support";
}

export function jpd1UnitForOrderIndex(orderIndex: number): (typeof JPD1_UNIT_RANGES)[number] | null {
  for (const range of JPD1_UNIT_RANGES) {
    if (orderIndex >= range.start && orderIndex <= range.end) return range;
  }
  return null;
}

export function isJpd1LastLessonInUnit(orderIndex: number): boolean {
  return orderIndex === 4 || orderIndex === 8 || orderIndex === 14;
}

/** Ngưỡng MiniTest mặc định theo loại tiết — giữ tuần tự nhưng giảm áp lực ở tiết phụ trợ / kanji. */
export function defaultJpd1PassThreshold(seed: {
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
