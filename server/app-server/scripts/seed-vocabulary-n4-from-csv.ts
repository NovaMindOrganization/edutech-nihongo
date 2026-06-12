import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { N4_COURSE_TITLE } from "../data/n4-lesson-titles.js";
import {
  lessonNumbersFromVocabRows,
  loadCsvStream,
  mapVocabularyRow,
} from "./seed-vocabulary-n5-from-csv.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_N4_VOCAB_CSV = join(
  __dirname,
  "../data/N4_Vocabulary_Seed_Lesson26_to_50_firstly.csv",
);

export type SeedN4VocabularyOptions = {
  csvPath?: string;
  courseId?: string;
  adminId?: string;
  db?: PrismaClient;
  skipDelete?: boolean;
};

export async function seedN4VocabularyFromCsv(
  options: SeedN4VocabularyOptions = {},
) {
  const db = options.db ?? new PrismaClient();
  const ownsClient = !options.db;
  const csvPath = options.csvPath ?? DEFAULT_N4_VOCAB_CSV;

  try {
    const csvRows = await loadCsvStream(csvPath);
    const lessonNumbers = lessonNumbersFromVocabRows(csvRows);

    console.log(
      `[seed:vocab-n4] Đọc ${csvRows.length} dòng từ ${csvPath.split(/[/\\]/).pop()}`,
    );

    let courseId = options.courseId;
    if (!courseId) {
      const course = await db.course.findFirst({
        where: { jlptLevel: "N4", title: N4_COURSE_TITLE },
        select: { id: true },
      });
      if (!course) {
        throw new Error(
          "Chưa có khóa N4. Chạy prisma db seed trước để tạo course và lessons.",
        );
      }
      courseId = course.id;
    }

    const lessons = await db.lesson.findMany({
      where: {
        courseId,
        orderIndex: { in: lessonNumbers },
      },
      select: { id: true, orderIndex: true },
      orderBy: { orderIndex: "asc" },
    });

    const lessonIdByNumber = new Map(
      lessons.map((lesson) => [lesson.orderIndex, lesson.id]),
    );

    const missing = lessonNumbers.filter((n) => !lessonIdByNumber.has(n));
    if (missing.length > 0) {
      throw new Error(
        `Không tìm thấy lesson orderIndex: ${missing.join(", ")} (course ${courseId}).`,
      );
    }

    let adminId = options.adminId;
    if (!adminId) {
      const admin = await db.user.findFirst({
        where: { role: "admin" },
        select: { id: true },
      });
      adminId = admin?.id;
    }

    const lessonIds = lessonNumbers.map((n) => lessonIdByNumber.get(n)!);

    if (!options.skipDelete) {
      const deletedLinks = await db.lessonVocabulary.deleteMany({
        where: { lessonId: { in: lessonIds } },
      });
      const deletedVocab = await db.vocabulary.deleteMany({
        where: { lessonId: { in: lessonIds } },
      });
      console.log(
        `[seed:vocab-n4] Đã xóa ${deletedVocab.count} từ (${deletedLinks.count} liên kết) cho ${lessonNumbers.length} bài.`,
      );
    }

    const mapped = csvRows.map((row) => {
      const lessonNumber = Number(row.lesson_number);
      const mappedRow = mapVocabularyRow(
        row,
        lessonIdByNumber.get(lessonNumber)!,
        courseId!,
        adminId,
      );
      return {
        ...mappedRow,
        jlptLevel: (row.jlptLevel ?? "N4").trim() || "N4",
      };
    });

    const batchSize = 100;
    for (let i = 0; i < mapped.length; i += batchSize) {
      const batch = mapped.slice(i, i + batchSize);
      await db.vocabulary.createMany({
        data: batch.map(({ lessonNumber: _n, ...data }) => data),
      });
    }

    const inserted = await db.vocabulary.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { id: true, lessonId: true },
    });

    if (inserted.length > 0) {
      await db.lessonVocabulary.deleteMany({
        where: { lessonId: { in: lessonIds } },
      });
      await db.lessonVocabulary.createMany({
        data: inserted.map((v) => ({
          lessonId: v.lessonId!,
          vocabularyId: v.id,
        })),
        skipDuplicates: true,
      });
    }

    const byLesson = new Map<number, number>();
    for (const row of mapped) {
      byLesson.set(
        row.lessonNumber,
        (byLesson.get(row.lessonNumber) ?? 0) + 1,
      );
    }

    console.log("[seed:vocab-n4] Đã import từ vựng theo bài:");
    for (const num of lessonNumbers) {
      console.log(`  - Bài ${num}: ${byLesson.get(num) ?? 0} từ`);
    }
    console.log(`[seed:vocab-n4] Tổng: ${mapped.length} từ vựng.`);

    return { imported: mapped.length, lessonNumbers, lessonIds };
  } finally {
    if (ownsClient) {
      await db.$disconnect();
    }
  }
}

async function main() {
  const db = new PrismaClient();
  try {
    console.log("[seed:vocab-n4] Bắt đầu...");
    await db.vocabulary.deleteMany({ where: { jlptLevel: "N4" } });
    await seedN4VocabularyFromCsv({ db });
    console.log("[seed:vocab-n4] Hoàn tất.");
  } finally {
    await db.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
