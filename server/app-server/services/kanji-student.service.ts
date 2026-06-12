import { db } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

export async function getCourseKanji(userId: string, courseId: string) {
  const enrollment = await db.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment)
    throw new AppError("Not enrolled in course", 403, "NOT_ENROLLED");

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { jlptLevel: true, title: true },
  });
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const progress = await db.userLessonProgress.findMany({
    where: {
      userId,
      status: { in: ["active", "completed"] },
      lesson: { courseId },
    },
    select: { lessonId: true },
  });
  const lessonIds = progress.map((p) => p.lessonId);

  const kanji =
    lessonIds.length === 0
      ? await db.kanji.findMany({
          where: { jlptLevel: course.jlptLevel },
          take: 200,
          select: {
            id: true,
            character: true,
            hanVietPronunciation: true,
            meaning: true,
            memoryTip: true,
            memoryImageUrl: true,
            memoryImageUpdatedAt: true,
            slug: true,
            readingsOn: true,
            readingsKun: true,
            strokeCount: true,
            jlptLevel: true,
            radical: true,
            examples: {
              orderBy: { orderIndex: "asc" },
              select: { word: true, reading: true, meaning: true },
            },
          },
        })
      : await db.kanji.findMany({
          where: { lessons: { some: { lessonId: { in: lessonIds } } } },
          distinct: ["id"],
          select: {
            id: true,
            character: true,
            hanVietPronunciation: true,
            meaning: true,
            memoryTip: true,
            memoryImageUrl: true,
            memoryImageUpdatedAt: true,
            slug: true,
            readingsOn: true,
            readingsKun: true,
            strokeCount: true,
            jlptLevel: true,
            radical: true,
            examples: {
              orderBy: { orderIndex: "asc" },
              select: { word: true, reading: true, meaning: true },
            },
          },
        });

  return {
    course,
    kanji,
    scope: lessonIds.length ? "unlocked_lessons" : "jlpt_level",
  };
}

export async function getKanjiLearnedStatus(userId: string, itemIds: string[]) {
  const uniqueIds = [...new Set(itemIds.filter(Boolean))];
  if (uniqueIds.length === 0) return { learnedIds: [] as string[] };

  const rows = await db.userMasteryItem.findMany({
    where: {
      userId,
      itemType: "kanji",
      itemId: { in: uniqueIds },
      isLearned: true,
    },
    select: { itemId: true },
  });

  return { learnedIds: rows.map((row) => row.itemId) };
}

export async function getHandbookKanji(userId: string, level?: string) {
  const mastery = await db.userMasteryItem.findMany({
    where: { userId, itemType: "kanji" },
  });
  const ids = mastery.map((m) => m.itemId);
  if (ids.length === 0) return { items: [], mastery: [] };

  const kanji = await db.kanji.findMany({
    where: {
      id: { in: ids },
      ...(level ? { jlptLevel: level } : {}),
    },
    select: {
      id: true,
      character: true,
      hanVietPronunciation: true,
      meaning: true,
      memoryTip: true,
      memoryImageUrl: true,
      memoryImageUpdatedAt: true,
      slug: true,
      readingsOn: true,
      readingsKun: true,
      strokeCount: true,
      jlptLevel: true,
      radical: true,
      examples: {
        orderBy: { orderIndex: "asc" },
        select: { word: true, reading: true, meaning: true },
      },
    },
  });
  const kanjiMap = new Map(kanji.map((k) => [k.id, k]));

  return {
    items: mastery
      .map((m) => ({ ...m, kanji: kanjiMap.get(m.itemId) }))
      .filter((x) => x.kanji),
  };
}
