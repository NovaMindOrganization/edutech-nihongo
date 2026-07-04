export type Jpd1LessonRow = {
  id: string;
  title: string;
  orderIndex: number;
  slug?: string | null;
  isBonus?: boolean;
  lessonType?: string | null;
  progress?: { status: string };
};

export type Jpd1UnitGroup = {
  unit: number;
  title: string;
  lessons: Jpd1LessonRow[];
};

export const JPD1_UNIT_TITLES: Record<number, string> = {
  1: "Bài 1: Chào hỏi và giới thiệu bản thân",
  2: "Bài 2: Mua sắm và nhà hàng",
  3: "Bài 3: Cuộc sống hằng ngày",
};

const BAI1_ORDER = [0, 1, 2, 3, 4];
const BAI2_ORDER = [5, 6, 7, 8];
const BAI3_ORDER = [9, 10, 11, 12, 13, 14];

export function parseJpd1UnitFromSlug(slug?: string | null): number | null {
  if (!slug) return null;
  const match = slug.match(/^bai-(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

export function groupJpd1Lessons(lessons: Jpd1LessonRow[]): Jpd1UnitGroup[] {
  const byUnit = new Map<number, Jpd1LessonRow[]>();

  for (const lesson of lessons) {
    const unit = parseJpd1UnitFromSlug(lesson.slug) ?? 0;
    const list = byUnit.get(unit) ?? [];
    list.push(lesson);
    byUnit.set(unit, list);
  }

  return [...byUnit.entries()]
    .filter(([unit]) => unit > 0)
    .sort(([a], [b]) => a - b)
    .map(([unit, unitLessons]) => ({
      unit,
      title: JPD1_UNIT_TITLES[unit] ?? `Bài ${unit}`,
      lessons: [...unitLessons].sort((a, b) => a.orderIndex - b.orderIndex),
    }));
}

function formatJpd1UnitSection(
  unit: number,
  lesson: Pick<Jpd1LessonRow, "slug" | "orderIndex">,
  unitLessons: Jpd1LessonRow[],
): string {
  const sorted = [...unitLessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const sectionIndex = sorted.findIndex((l) => l.orderIndex === lesson.orderIndex) + 1;
  if (sectionIndex <= 0) return `Bài ${unit}`;
  const isKanji = lesson.slug?.includes("kanji");
  const suffix = isKanji ? "Kanji" : `Tiết ${sectionIndex}`;
  return `Bài ${unit} · ${suffix}`;
}

function formatJpd1ShellSection(
  unit: number,
  lesson: Pick<Jpd1LessonRow, "slug" | "orderIndex">,
): string {
  if (unit === 1) {
    const sectionIndex = BAI1_ORDER.indexOf(lesson.orderIndex) + 1;
    return sectionIndex > 0 ? `Bài 1 · Tiết ${sectionIndex}` : "Bài 1";
  }
  if (unit === 2) {
    if (lesson.slug?.includes("kanji")) return "Bài 2 · Kanji";
    const sectionIndex = BAI2_ORDER.indexOf(lesson.orderIndex) + 1;
    return sectionIndex > 0 ? `Bài 2 · Tiết ${sectionIndex}` : "Bài 2";
  }
  if (unit === 3) {
    if (lesson.slug?.includes("kanji")) return "Bài 3 · Kanji";
    const sectionIndex = BAI3_ORDER.indexOf(lesson.orderIndex) + 1;
    return sectionIndex > 0 ? `Bài 3 · Tiết ${sectionIndex}` : "Bài 3";
  }
  return `Tiết ${lesson.orderIndex + 1}`;
}

export function formatJpd1ShellSubtitle(lesson: Pick<Jpd1LessonRow, "slug" | "orderIndex">): string {
  const unit = parseJpd1UnitFromSlug(lesson.slug);
  if (!unit) return `Tiết ${lesson.orderIndex + 1}`;
  return formatJpd1ShellSection(unit, lesson);
}

export function formatJpd1LessonEyebrow(
  lesson: Pick<Jpd1LessonRow, "slug" | "orderIndex">,
  unitLessons: Jpd1LessonRow[],
): string {
  const unit = parseJpd1UnitFromSlug(lesson.slug);
  if (unit === 1) {
    const sectionIndex = unitLessons.findIndex((l) => l.orderIndex === lesson.orderIndex) + 1;
    return sectionIndex > 0 ? `Bài 1 · Tiết ${sectionIndex}` : "Bài 1";
  }
  if (unit === 2 || unit === 3) {
    return formatJpd1UnitSection(unit, lesson, unitLessons);
  }
  return `Tiết ${lesson.orderIndex + 1}`;
}
