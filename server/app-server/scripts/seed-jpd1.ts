import type { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";

import { JPD1_COURSE_META, JPD1_LESSONS } from "../data/jpd1/index.js";
import type { Jpd1LessonSeed } from "../data/jpd1/types.js";
import { reserveUniqueKanjiSlug } from "../utils/kanji-slug.js";

export const JPD1_COURSE_TITLE = JPD1_COURSE_META.title;

type SeedJpd1Options = {
  db: PrismaClient;
  adminId: string;
  replaceExisting?: boolean;
};

async function clearJpd1Content(db: PrismaClient, courseId: string) {
  const lessons = await db.lesson.findMany({
    where: { courseId },
    select: { id: true },
  });
  const lessonIds = lessons.map((l) => l.id);

  if (lessonIds.length > 0) {
    await db.lessonQuestion.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await db.lessonConversation.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await db.lessonKanji.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await db.lessonGrammar.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await db.lessonVocabulary.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await db.userLessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await db.lesson.deleteMany({ where: { courseId } });
  }

  await db.vocabulary.deleteMany({ where: { jlptLevel: "JPD1" } });
  await db.grammar.deleteMany({ where: { jlpt: "JPD1" } });

  const jpd1Kanji = await db.kanji.findMany({
    where: { jlptLevel: "JPD1" },
    select: { id: true },
  });
  if (jpd1Kanji.length > 0) {
    const ids = jpd1Kanji.map((k) => k.id);
    await db.kanjiExample.deleteMany({ where: { kanjiId: { in: ids } } });
    await db.kanji.deleteMany({ where: { id: { in: ids } } });
  }

  await db.question.deleteMany({ where: { jlptLevel: "JPD1" } });
}

async function seedLessonContent(
  db: PrismaClient,
  adminId: string,
  courseId: string,
  lessonId: string,
  seed: Jpd1LessonSeed,
  usedKanjiSlugs: Set<string>,
) {
  for (let i = 0; i < seed.vocabulary.length; i++) {
    const v = seed.vocabulary[i];
    const vocab = await db.vocabulary.create({
      data: {
        word: v.word,
        reading: v.reading ?? null,
        meaning: v.meaning,
        memoryTip: v.memoryTip ?? null,
        exampleSentence: v.exampleSentence ?? null,
        exampleTranslation: v.exampleTranslation ?? null,
        partOfSpeech: v.partOfSpeech ?? null,
        orderIndex: i,
        jlptLevel: "JPD1",
        courseId,
        lessonId,
        createdById: adminId,
      },
    });
    await db.lessonVocabulary.create({
      data: { lessonId, vocabularyId: vocab.id },
    });
  }

  for (let i = 0; i < seed.grammar.length; i++) {
    const g = seed.grammar[i];
    const grammar = await db.grammar.create({
      data: {
        title: g.title,
        pattern: g.pattern,
        meaningVi: g.meaningVi,
        usage: g.usage ?? null,
        notes: g.notes ?? null,
        examples: g.examples,
        quiz: g.quiz ?? null,
        jlpt: "JPD1",
        lessonId,
        order: i + 1,
        createdById: adminId,
      },
    });
    await db.lessonGrammar.create({
      data: { lessonId, grammarId: grammar.id },
    });
  }

  for (const dialogue of seed.dialogues) {
    const conversation = await db.conversation.create({
      data: {
        title: dialogue.title,
        dialogue: dialogue.lines,
        jlptLevel: "JPD1",
        createdById: adminId,
      },
    });
    await db.lessonConversation.create({
      data: { lessonId, conversationId: conversation.id },
    });
  }

  for (let i = 0; i < seed.kanji.length; i++) {
    const k = seed.kanji[i];
    const existing = await db.kanji.findUnique({
      where: { character: k.character },
      select: { id: true },
    });

    let kanjiId: string;

    if (existing) {
      kanjiId = existing.id;
    } else {
      const slug = reserveUniqueKanjiSlug(k.character, usedKanjiSlugs);
      const created = await db.kanji.create({
        data: {
          character: k.character,
          slug,
          hanVietPronunciation: k.hanViet,
          meaning: k.meaning,
          readingsOn: k.readingsOn,
          readingsKun: k.readingsKun,
          strokeCount: k.strokeCount ?? null,
          memoryTip: k.memoryTip ?? null,
          jlptLevel: "JPD1",
          createdById: adminId,
        },
      });
      kanjiId = created.id;

      for (let ei = 0; ei < k.examples.length; ei++) {
        const ex = k.examples[ei];
        await db.kanjiExample.create({
          data: {
            kanjiId,
            orderIndex: ei,
            word: ex.word,
            reading: ex.reading ?? null,
            meaning: ex.meaning,
          },
        });
      }
    }

    await db.lessonKanji.upsert({
      where: { lessonId_kanjiId: { lessonId, kanjiId } },
      create: { lessonId, kanjiId },
      update: {},
    });
  }

  if (!seed.isBonus) {
    const quizQuestions = buildLessonQuizQuestions(seed);
    for (const q of quizQuestions) {
      const question = await db.question.create({
        data: {
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          jlptLevel: "JPD1",
          questionCategory: "JPD1 Lesson Quiz",
          createdById: adminId,
        },
      });
      await db.lessonQuestion.create({
        data: { lessonId, questionId: question.id },
      });
    }
  }
}

function buildLessonQuizQuestions(seed: Jpd1LessonSeed) {
  const items: Array<{
    questionText: string;
    questionType: string;
    options: Array<{ label: string; text: string }>;
    correctAnswer: string;
    explanation: string;
  }> = [];

  if (seed.vocabulary.length >= 4) {
    const target = seed.vocabulary[0];
    const distractors = seed.vocabulary.slice(1, 4).map((v) => v.meaning);
    items.push({
      questionText: `「${target.word}」の いみは？`,
      questionType: "multiple_choice",
      options: [target.meaning, ...distractors].map((text, idx) => ({
        label: String.fromCharCode(65 + idx),
        text,
      })),
      correctAnswer: "A",
      explanation: `${target.word} = ${target.meaning}`,
    });
  }

  if (seed.grammar.length > 0) {
    const g = seed.grammar[0];
    items.push({
      questionText: `「${g.pattern}」の いみは？`,
      questionType: "multiple_choice",
      options: [
        g.meaningVi,
        "Không phải câu hỏi",
        "Chỉ dùng trong văn viết",
        "Không dùng với です",
      ].map((text, idx) => ({ label: String.fromCharCode(65 + idx), text })),
      correctAnswer: "A",
      explanation: g.meaningVi,
    });
  }

  return items;
}

export async function seedJpd1Course(options: SeedJpd1Options) {
  const { db, adminId } = options;
  const replaceExisting = options.replaceExisting ?? true;

  console.log("[seed:jpd1] Starting JPD1 course seed…");

  let course = await db.course.findFirst({
    where: { slug: JPD1_COURSE_META.slug },
  });

  if (!course) {
    course = await db.course.create({
      data: {
        title: JPD1_COURSE_META.title,
        slug: JPD1_COURSE_META.slug,
        subtitle: JPD1_COURSE_META.subtitle,
        level: JPD1_COURSE_META.level,
        jlptLevel: JPD1_COURSE_META.jlptLevel,
        description: JPD1_COURSE_META.description,
        sortOrder: JPD1_COURSE_META.sortOrder,
        isPublished: true,
        createdById: adminId,
      },
    });
  } else {
    course = await db.course.update({
      where: { id: course.id },
      data: {
        title: JPD1_COURSE_META.title,
        subtitle: JPD1_COURSE_META.subtitle,
        level: JPD1_COURSE_META.level,
        description: JPD1_COURSE_META.description,
        sortOrder: JPD1_COURSE_META.sortOrder,
        isPublished: true,
      },
    });
  }

  if (replaceExisting) {
    await clearJpd1Content(db, course.id);
  }

  await db.course.updateMany({
    where: { jlptLevel: "N5", title: { contains: "N5" } },
    data: { sortOrder: 10 },
  });
  await db.course.updateMany({
    where: { jlptLevel: "N4" },
    data: { sortOrder: 20 },
  });

  const usedKanjiSlugs = new Set(
    (await db.kanji.findMany({ select: { slug: true } })).map((row) => row.slug),
  );

  const lessonIdByOrder = new Map<number, string>();

  for (const seed of JPD1_LESSONS) {
    const lesson = await db.lesson.create({
      data: {
        courseId: course.id,
        title: seed.title,
        slug: seed.slug,
        description: seed.description,
        objective: seed.objective,
        lessonType: seed.lessonType,
        estimatedMinutes: seed.estimatedMinutes,
        orderIndex: seed.orderIndex,
        passThreshold: 70,
        isBonus: seed.isBonus,
        speakingPrompt: seed.speakingPrompt ?? seed.finalTask?.instructionVi ?? null,
        finalTask: seed.finalTask ?? null,
      },
    });
    lessonIdByOrder.set(seed.orderIndex, lesson.id);
    await seedLessonContent(db, adminId, course.id, lesson.id, seed, usedKanjiSlugs);
  }

  const freePlan = await db.pricingPlan.findFirst({
    where: { name: "Gói JPD1 — Miễn phí" },
  });
  if (!freePlan) {
    await db.pricingPlan.create({
      data: {
        name: "Gói JPD1 — Miễn phí",
        description: "Khóa nhập môn JPD1 cho sinh viên FPT",
        price: 0,
        features: ["5 bài học", "Flashcard & quiz", "Luyện hội thoại"],
        isActive: true,
        sortOrder: -1,
        courses: { create: [{ courseId: course.id }] },
      },
    });
  }

  console.log(
    `[seed:jpd1] Done — course "${course.title}" with ${JPD1_LESSONS.length} lessons.`,
  );

  return { courseId: course.id, lessonIdByOrder };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient();
  db.user
    .findFirst({ where: { role: "admin" }, select: { id: true } })
    .then((admin) => {
      if (!admin) throw new Error("Chưa có admin. Chạy prisma db seed trước.");
      return seedJpd1Course({ db, adminId: admin.id });
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:jpd1] Lỗi:", err);
      process.exit(1);
    })
    .finally(() => db.$disconnect());
}
