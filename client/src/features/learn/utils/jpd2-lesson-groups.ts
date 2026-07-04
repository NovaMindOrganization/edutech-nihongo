export type Jpd2LessonRow = {
  id: string;
  title: string;
  orderIndex: number;
  slug?: string | null;
  isBonus?: boolean;
  lessonType?: string | null;
  progress?: { status: string };
};

export type Jpd2UnitGroup = {
  unit: number;
  title: string;
  lessons: Jpd2LessonRow[];
};

export const JPD2_UNIT_TITLES: Record<number, string> = {
  4: "Bài 4: Đất nước và thành phố của tôi",
  5: "Bài 5: Ngày nghỉ",
  6: "Bài 6: Rủ rê & mời mọc",
  7: "Bài 7: Tại nhà bạn",
};

const BAI4_ORDER = [0, 1, 2, 3, 4, 5];
const BAI5_ORDER = [6, 7, 8];
const BAI6_ORDER = [9, 10, 11, 12, 13, 14];
const BAI7_ORDER = [15, 16, 17, 18, 19, 20, 21, 22];

function sectionIndexForUnit(
  unit: number,
  orderIndex: number,
  unitLessons?: Jpd2LessonRow[],
): number {
  if (unit === 4) {
    const idx = BAI4_ORDER.indexOf(orderIndex);
    return idx >= 0 ? idx + 1 : 0;
  }
  if (unit === 5) {
    const idx = BAI5_ORDER.indexOf(orderIndex);
    return idx >= 0 ? idx + 1 : 0;
  }
  if (unit === 6) {
    const idx = BAI6_ORDER.indexOf(orderIndex);
    return idx >= 0 ? idx + 1 : 0;
  }
  if (unit === 7) {
    const idx = BAI7_ORDER.indexOf(orderIndex);
    return idx >= 0 ? idx + 1 : 0;
  }
  if (unitLessons?.length) {
    const sorted = [...unitLessons].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex((l) => l.orderIndex === orderIndex);
    return idx >= 0 ? idx + 1 : 0;
  }
  return 0;
}

export function parseJpd2UnitFromSlug(slug?: string | null): number | null {
  if (!slug) return null;
  const match = slug.match(/^bai-(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

export function groupJpd2Lessons(lessons: Jpd2LessonRow[]): Jpd2UnitGroup[] {
  const byUnit = new Map<number, Jpd2LessonRow[]>();

  for (const lesson of lessons) {
    const unit = parseJpd2UnitFromSlug(lesson.slug) ?? 0;
    const list = byUnit.get(unit) ?? [];
    list.push(lesson);
    byUnit.set(unit, list);
  }

  return [...byUnit.entries()]
    .filter(([unit]) => unit >= 4)
    .sort(([a], [b]) => a - b)
    .map(([unit, unitLessons]) => ({
      unit,
      title: JPD2_UNIT_TITLES[unit] ?? `Bài ${unit}`,
      lessons: [...unitLessons].sort((a, b) => a.orderIndex - b.orderIndex),
    }));
}

export function formatJpd2ShellSubtitle(lesson: Pick<Jpd2LessonRow, "slug" | "orderIndex">): string {
  const unit = parseJpd2UnitFromSlug(lesson.slug);
  if (!unit || unit < 4) return `Tiết ${lesson.orderIndex + 1}`;
  const section = sectionIndexForUnit(unit, lesson.orderIndex);
  return section > 0 ? `Bài ${unit} · Tiết ${section}` : `Bài ${unit}`;
}

export function formatJpd2LessonEyebrow(
  lesson: Pick<Jpd2LessonRow, "slug" | "orderIndex">,
  unitLessons: Jpd2LessonRow[],
): string {
  const unit = parseJpd2UnitFromSlug(lesson.slug);
  if (!unit || unit < 4) return `Tiết ${lesson.orderIndex + 1}`;
  const section = sectionIndexForUnit(unit, lesson.orderIndex, unitLessons);
  return section > 0 ? `Bài ${unit} · Tiết ${section}` : `Bài ${unit}`;
}
