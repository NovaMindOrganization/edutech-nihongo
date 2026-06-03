import type { LessonProgressStatus, Vocabulary } from "@prisma/client";

import { db } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

/** Vocabulary by lesson_id FK; falls back to junction if legacy rows lack FK. */
async function loadLessonVocabulary(lessonId: string): Promise<Vocabulary[]> {
  const direct = await db.vocabulary.findMany({
    where: { lessonId },
    orderBy: { word: "asc" },
  });
  if (direct.length > 0) return direct;

  const linked = await db.lessonVocabulary.findMany({
    where: { lessonId },
    include: { vocabulary: true },
  });
  return linked
    .map((row) => row.vocabulary)
    .sort((a, b) => a.word.localeCompare(b.word, "ja"));
}

export async function createLesson(data: {
  courseId: string;
  title: string;
  orderIndex: number;
  passThreshold?: number;
  isBonus?: boolean;
}) {
  return db.lesson.create({ data });
}

export async function updateLesson(
  id: string,
  data: Partial<{
    title: string;
    orderIndex: number;
    passThreshold: number;
    isBonus: boolean;
    speakingPrompt: string | null;
  }>,
) {
  const lesson = await db.lesson.findUnique({ where: { id } });
  if (!lesson) throw new AppError("Lesson not found", 404, "NOT_FOUND");
  return db.lesson.update({ where: { id }, data });
}

export async function deleteLesson(id: string) {
  const lesson = await db.lesson.findUnique({ where: { id } });
  if (!lesson) throw new AppError("Lesson not found", 404, "NOT_FOUND");
  await db.lesson.delete({ where: { id } });
}

export async function getLessonForAdmin(id: string) {
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, jlptLevel: true } },
      grammar: { include: { grammar: true } },
      kanji: {
        include: {
          kanji: {
            include: {
              examples: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      },
      conversations: { include: { conversation: true } },
    },
  });
  if (!lesson) throw new AppError("Lesson not found", 404, "NOT_FOUND");

  const vocabulary = await loadLessonVocabulary(id);

  return {
    id: lesson.id,
    courseId: lesson.courseId,
    title: lesson.title,
    orderIndex: lesson.orderIndex,
    passThreshold: lesson.passThreshold,
    isBonus: lesson.isBonus,
    speakingPrompt: lesson.speakingPrompt,
    createdAt: lesson.createdAt,
    course: lesson.course,
    grammar: lesson.grammar.map((row) => row.grammar),
    kanji: lesson.kanji.map((row) => row.kanji),
    conversations: lesson.conversations.map((row) => row.conversation),
    vocabulary,
  };
}

export async function assignVocabularyToLesson(
  lessonId: string,
  vocabularyIds: string[],
) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true },
  });
  if (!lesson) throw new AppError("Lesson not found", 404, "NOT_FOUND");

  await db.$transaction(async (tx) => {
    await tx.vocabulary.updateMany({
      where: { lessonId },
      data: { lessonId: null, courseId: null },
    });
    await tx.lessonVocabulary.deleteMany({ where: { lessonId } });

    if (vocabularyIds.length === 0) return;

    await tx.vocabulary.updateMany({
      where: { id: { in: vocabularyIds } },
      data: { lessonId: lesson.id, courseId: lesson.courseId },
    });
    await tx.lessonVocabulary.createMany({
      data: vocabularyIds.map((vocabularyId) => ({ lessonId, vocabularyId })),
      skipDuplicates: true,
    });
  });

  return { count: vocabularyIds.length };
}

export async function assignGrammarToLesson(
  lessonId: string,
  grammarIds: string[],
) {
  await db.$transaction(async (tx) => {
    await tx.lessonGrammar.deleteMany({ where: { lessonId } });
    await tx.grammar.updateMany({
      where: { lessonId },
      data: { lessonId: null, order: null },
    });

    if (grammarIds.length === 0) return;

    await tx.lessonGrammar.createMany({
      data: grammarIds.map((grammarId) => ({ lessonId, grammarId })),
      skipDuplicates: true,
    });

    for (let i = 0; i < grammarIds.length; i++) {
      await tx.grammar.update({
        where: { id: grammarIds[i] },
        data: { lessonId, order: i + 1 },
      });
    }
  });

  return { count: grammarIds.length };
}

export async function assignKanjiToLesson(
  lessonId: string,
  kanjiIds: string[],
) {
  await db.lessonKanji.deleteMany({ where: { lessonId } });
  if (kanjiIds.length === 0) return { count: 0 };
  await db.lessonKanji.createMany({
    data: kanjiIds.map((kanjiId) => ({ lessonId, kanjiId })),
    skipDuplicates: true,
  });
  return { count: kanjiIds.length };
}

export async function assignQuestionsToLesson(
  lessonId: string,
  questionIds: string[],
) {
  await db.lessonQuestion.deleteMany({ where: { lessonId } });
  if (questionIds.length === 0) return { count: 0 };
  await db.lessonQuestion.createMany({
    data: questionIds.map((questionId) => ({ lessonId, questionId })),
    skipDuplicates: true,
  });
  return { count: questionIds.length };
}

export async function getStudentLessonsWithProgress(
  userId: string,
  courseId: string,
) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const progress = await db.userLessonProgress.findMany({
    where: { userId, lessonId: { in: course.lessons.map((l) => l.id) } },
  });
  const progressMap = new Map(progress.map((p) => [p.lessonId, p]));

  return course.lessons.map((lesson) => ({
    ...lesson,
    progress: progressMap.get(lesson.id) ?? {
      status: "locked" as LessonProgressStatus,
    },
  }));
}

export async function getLessonContentForStudent(
  userId: string,
  lessonId: string,
) {
  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  if (!progress || progress.status === "locked") {
    throw new AppError("Lesson is locked", 403, "LESSON_LOCKED");
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      grammar: { include: { grammar: true } },
      kanji: {
        include: {
          kanji: {
            select: {
              id: true,
              character: true,
              hanVietPronunciation: true,
              meaning: true,
              memoryTip: true,
              memoryImageUrl: true,
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
          },
        },
      },
      conversations: { include: { conversation: true } },
      course: { select: { id: true, title: true, jlptLevel: true } },
    },
  });

  if (!lesson) throw new AppError("Lesson not found", 404, "NOT_FOUND");

  const vocabulary = await loadLessonVocabulary(lessonId);

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      orderIndex: lesson.orderIndex,
      passThreshold: lesson.passThreshold,
      isBonus: lesson.isBonus,
      speakingPrompt: lesson.speakingPrompt,
      course: {
        id: lesson.course.id,
        title: lesson.course.title,
        jlptLevel: lesson.course.jlptLevel,
      },
    },
    vocabulary,
    grammar: lesson.grammar.map((lg) => lg.grammar),
    kanji: lesson.kanji.map((lk) => lk.kanji),
    conversations: lesson.conversations.map((lc) => lc.conversation),
    progress,
  };
}

export async function enrollAndInitProgress(userId: string, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { where: { isBonus: false }, orderBy: { orderIndex: "asc" } },
    },
  });
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  await db.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });

  const mainLessons = course.lessons;
  for (let i = 0; i < mainLessons.length; i++) {
    const status: LessonProgressStatus = i === 0 ? "active" : "locked";
    await db.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: mainLessons[i].id } },
      create: { userId, lessonId: mainLessons[i].id, status },
      update: {},
    });
  }

  return { enrolled: true, lessonsInitialized: mainLessons.length };
}
