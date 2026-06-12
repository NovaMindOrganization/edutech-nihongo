import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { N5_COURSE_TITLE } from "../data/n5-lesson-titles.js";
import {
  buildMcqOptions,
  isLongJapanesePhrase,
  minHalfCount,
  shuffle,
} from "../utils/minitest-options.js";
import { loadCsvStream } from "./seed-vocabulary-n5-from-csv.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_N5_MINITEST_CSV = join(
  __dirname,
  "../data/n5-minitest-questions.csv",
);

export const MINITEST_VOCAB_CATEGORY = "mini_test_vocab";
export const MINITEST_VOCAB_PHRASE_CATEGORY = "mini_test_vocab_phrase";
export const MINITEST_KANJI_CATEGORY = "mini_test_kanji";

const MINITEST_CATEGORIES = [
  MINITEST_VOCAB_CATEGORY,
  MINITEST_VOCAB_PHRASE_CATEGORY,
  MINITEST_KANJI_CATEGORY,
] as const;

export type SeedMiniTestN5Options = {
  db?: PrismaClient;
  adminId?: string;
  courseId?: string;
  csvPath?: string;
  optionCount?: number;
  replaceExisting?: boolean;
};

export type MiniTestCsvRow = {
  lesson_number: string;
  word?: string;
  question_text?: string;
  correct_meaning: string;
  distractor_1?: string;
  distractor_2?: string;
  distractor_3?: string;
  distractor_4?: string;
  explanation?: string;
};

type VocabRow = { id: string; lessonId: string | null; word: string; meaning: string };
type KanjiRow = {
  character: string;
  meaning: string;
  hanVietPronunciation: string | null;
};

type QuestionDraft = {
  questionText: string;
  correctAnswer: string;
  distractorPool: string[];
  targetLength?: number;
  questionCategory: string;
  explanation?: string;
};

function parseCsvDistractors(row: MiniTestCsvRow): string[] {
  return [
    row.distractor_1,
    row.distractor_2,
    row.distractor_3,
    row.distractor_4,
  ].filter((v): v is string => Boolean(v?.trim()));
}

export function groupMiniTestCsvByLesson(
  rows: MiniTestCsvRow[],
): Map<number, MiniTestCsvRow[]> {
  const map = new Map<number, MiniTestCsvRow[]>();
  for (const row of rows) {
    const lessonNumber = Number(row.lesson_number);
    if (!Number.isFinite(lessonNumber) || lessonNumber < 1) continue;
    const list = map.get(lessonNumber) ?? [];
    list.push(row);
    map.set(lessonNumber, list);
  }
  return map;
}

export function buildVocabQuestionDrafts(
  lessonVocab: VocabRow[],
  courseVocab: VocabRow[],
): QuestionDraft[] {
  const count = minHalfCount(lessonVocab.length);
  if (count === 0) return [];

  const picked = shuffle(lessonVocab).slice(0, count);
  const lessonMeanings = lessonVocab.map((v) => v.meaning.trim()).filter(Boolean);
  const courseMeanings = courseVocab.map((v) => v.meaning.trim()).filter(Boolean);
  const lessonWords = lessonVocab.map((v) => v.word.trim()).filter(Boolean);
  const courseWords = courseVocab.map((v) => v.word.trim()).filter(Boolean);

  return picked.map((v) => {
    const word = v.word.trim();
    const meaning = v.meaning.trim();

    if (isLongJapanesePhrase(word)) {
      const sameLessonWords = lessonVocab
        .filter((item) => item.id !== v.id)
        .map((item) => item.word.trim());
      return {
        questionText: `次の意味に合う日本語の表現はどれですか。\n（${meaning}）`,
        correctAnswer: word,
        distractorPool: [...sameLessonWords, ...courseWords],
        targetLength: word.length,
        questionCategory: MINITEST_VOCAB_PHRASE_CATEGORY,
      };
    }

    const sameLessonMeanings = lessonVocab
      .filter((item) => item.id !== v.id)
      .map((item) => item.meaning.trim());

    return {
      questionText: `「${word}」の意味は？`,
      correctAnswer: meaning,
      distractorPool: [...sameLessonMeanings, ...lessonMeanings, ...courseMeanings],
      targetLength: meaning.length,
      questionCategory: MINITEST_VOCAB_CATEGORY,
    };
  });
}

export function buildKanjiQuestionDrafts(lessonKanji: KanjiRow[]): QuestionDraft[] {
  if (lessonKanji.length === 0) return [];

  return lessonKanji.map((kanji) => {
    const meaning = kanji.meaning.trim();
    const others = lessonKanji.filter((k) => k.character !== kanji.character);

    const distractorPool = [
      ...others.map((k) => k.meaning.trim()),
      ...others
        .map((k) => k.hanVietPronunciation?.trim())
        .filter((v): v is string => Boolean(v)),
    ];

    return {
      questionText: `「${kanji.character}」の意味は？`,
      correctAnswer: meaning,
      distractorPool,
      targetLength: meaning.length,
      questionCategory: MINITEST_KANJI_CATEGORY,
    };
  });
}

async function resolveAdminId(db: PrismaClient, adminId?: string) {
  if (adminId) return adminId;
  const admin = await db.user.findFirst({
    where: { role: "admin" },
    select: { id: true },
  });
  if (!admin) throw new Error("Không tìm thấy user admin để gán createdById.");
  return admin.id;
}

async function resolveN5CourseId(db: PrismaClient, courseId?: string) {
  if (courseId) return courseId;
  const course = await db.course.findFirst({
    where: { jlptLevel: "N5", title: N5_COURSE_TITLE },
    select: { id: true },
  });
  if (!course) throw new Error(`Không tìm thấy khóa N5: ${N5_COURSE_TITLE}`);
  return course.id;
}

async function clearLessonMiniTestQuestions(db: PrismaClient, lessonId: string) {
  const links = await db.lessonQuestion.findMany({
    where: { lessonId },
    include: {
      question: {
        select: { id: true, questionCategory: true, questionText: true },
      },
    },
  });

  const miniTestQuestionIds = links
    .filter(
      (l) =>
        MINITEST_CATEGORIES.includes(
          l.question.questionCategory as (typeof MINITEST_CATEGORIES)[number],
        ) ||
        (l.question.questionCategory === "文字語彙" &&
          l.question.questionText.includes("の意味は？")),
    )
    .map((l) => l.questionId);

  if (miniTestQuestionIds.length === 0) return 0;

  await db.lessonQuestion.deleteMany({
    where: { lessonId, questionId: { in: miniTestQuestionIds } },
  });

  for (const questionId of miniTestQuestionIds) {
    const remaining = await db.lessonQuestion.count({ where: { questionId } });
    if (remaining === 0) {
      await db.question.delete({ where: { id: questionId } });
    }
  }

  return miniTestQuestionIds.length;
}

async function persistQuestionDrafts(
  db: PrismaClient,
  lessonId: string,
  adminId: string,
  drafts: QuestionDraft[],
  optionCount: number,
) {
  let created = 0;
  for (const draft of drafts) {
    const { options, correctAnswer } = buildMcqOptions({
      correctAnswer: draft.correctAnswer,
      distractorPool: draft.distractorPool,
      optionCount,
      targetLength: draft.targetLength,
    });

    const question = await db.question.create({
      data: {
        questionText: draft.questionText,
        questionType: "multiple_choice",
        options,
        correctAnswer,
        explanation: draft.explanation,
        jlptLevel: "N5",
        questionCategory: draft.questionCategory,
        createdById: adminId,
      },
    });

    await db.lessonQuestion.create({
      data: { lessonId, questionId: question.id },
    });
    created += 1;
  }
  return created;
}

export async function seedMiniTestN5(options: SeedMiniTestN5Options = {}) {
  const db = options.db ?? new PrismaClient();
  const ownsDb = !options.db;
  const replaceExisting = options.replaceExisting ?? true;
  const optionCount = options.optionCount ?? 4;

  try {
    const adminId = await resolveAdminId(db, options.adminId);
    const courseId = await resolveN5CourseId(db, options.courseId);

    const lessons = await db.lesson.findMany({
      where: { courseId, isBonus: false },
      orderBy: { orderIndex: "asc" },
      select: { id: true, orderIndex: true, title: true },
    });

    const allVocab = await db.vocabulary.findMany({
      where: { lesson: { courseId }, jlptLevel: "N5" },
      select: { id: true, lessonId: true, word: true, meaning: true },
    });

    const allKanjiLinks = await db.lessonKanji.findMany({
      where: { lesson: { courseId } },
      include: {
        kanji: {
          select: {
            character: true,
            meaning: true,
            hanVietPronunciation: true,
          },
        },
      },
    });

    let csvByLesson = new Map<number, MiniTestCsvRow[]>();
    const csvPath = options.csvPath ?? DEFAULT_N5_MINITEST_CSV;
    if (existsSync(csvPath)) {
      const rawRows = (await loadCsvStream(csvPath)).filter(
        (row) =>
          row.lesson_number?.trim() &&
          row.correct_meaning?.trim() &&
          Number.isFinite(Number(row.lesson_number)),
      ) as MiniTestCsvRow[];
      if (rawRows.length > 0) {
        csvByLesson = groupMiniTestCsvByLesson(rawRows);
      }
    }

    let totalQuestions = 0;
    let cleared = 0;

    for (const lesson of lessons) {
      if (replaceExisting) {
        cleared += await clearLessonMiniTestQuestions(db, lesson.id);
      }

      const lessonVocab = allVocab.filter((v) => v.lessonId === lesson.id);
      const lessonKanji = allKanjiLinks
        .filter((link) => link.lessonId === lesson.id)
        .map((link) => link.kanji);

      const drafts: QuestionDraft[] = [];

      const csvRows = csvByLesson.get(lesson.orderIndex) ?? [];
      if (csvRows.length > 0) {
        const meaningPool = allVocab.map((v) => v.meaning.trim()).filter(Boolean);
        for (const row of csvRows) {
          const word = row.word?.trim();
          drafts.push({
            questionText:
              row.question_text?.trim() ||
              (word ? `「${word}」の意味は？` : row.correct_meaning),
            correctAnswer: row.correct_meaning.trim(),
            distractorPool: [...parseCsvDistractors(row), ...meaningPool],
            questionCategory: MINITEST_VOCAB_CATEGORY,
            explanation: row.explanation?.trim() || undefined,
          });
        }
      } else {
        drafts.push(...buildVocabQuestionDrafts(lessonVocab, allVocab));
        drafts.push(...buildKanjiQuestionDrafts(lessonKanji));
      }

      const created = await persistQuestionDrafts(
        db,
        lesson.id,
        adminId,
        drafts,
        optionCount,
      );
      totalQuestions += created;

      const vocabCount = csvRows.length > 0 ? 0 : minHalfCount(lessonVocab.length);
      console.log(
        `[seed:minitest-n5] Bài ${lesson.orderIndex} (${lesson.title}): ${created} câu` +
          (csvRows.length === 0
            ? ` (từ vựng ~${vocabCount}, kanji ${lessonKanji.length})`
            : " (từ CSV)"),
      );
    }

    console.log(
      `[seed:minitest-n5] Hoàn tất: ${totalQuestions} câu mới, đã xóa ${cleared} câu cũ.`,
    );

    return { totalQuestions, cleared, lessonCount: lessons.length };
  } finally {
    if (ownsDb) await db.$disconnect();
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  seedMiniTestN5()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:minitest-n5] Lỗi:", err);
      process.exit(1);
    });
}
