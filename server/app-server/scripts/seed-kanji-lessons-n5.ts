import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { N5_COURSE_TITLE } from "../data/n5-lesson-titles.js";
import { loadCsvStream } from "./seed-vocabulary-n5-from-csv.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_N5_KANJI_LESSONS_CSV = join(
  __dirname,
  "../data/n5-kanji-by-lesson.csv",
);

export type SeedKanjiLessonsN5Options = {
  csvPath?: string;
  courseId?: string;
  db?: PrismaClient;
  /** Xóa liên kết lesson_kanji của các bài trong CSV trước khi gắn lại (mặc định: true). */
  replaceLinks?: boolean;
};

export type KanjiLessonMapRow = {
  lessonNumber: number;
  character: string;
  orderIndex: number;
};

export function parseKanjiLessonMapRows(
  rows: Record<string, string>[],
): KanjiLessonMapRow[] {
  const parsed: KanjiLessonMapRow[] = [];

  for (const row of rows) {
    const character = (row.character ?? row.Kanji ?? "").trim();
    const lessonNumber = Number(row.lesson_number);
    const orderIndex = Number(row.order_index ?? row.orderIndex ?? "0");

    if (!character) continue;
    if (!Number.isFinite(lessonNumber) || lessonNumber < 1) {
      throw new Error(
        `lesson_number không hợp lệ: "${row.lesson_number}" (kanji ${character}).`,
      );
    }

    parsed.push({
      lessonNumber,
      character,
      orderIndex: Number.isFinite(orderIndex) ? orderIndex : parsed.length,
    });
  }

  return parsed;
}

export function lessonNumbersFromKanjiLessonRows(
  rows: KanjiLessonMapRow[],
): number[] {
  return [
    ...new Set(rows.map((row) => row.lessonNumber)),
  ].sort((a, b) => a - b);
}

export async function seedKanjiLessonsN5FromCsv(
  options: SeedKanjiLessonsN5Options = {},
) {
  const db = options.db ?? new PrismaClient();
  const ownsClient = !options.db;
  const csvPath = options.csvPath ?? DEFAULT_N5_KANJI_LESSONS_CSV;
  const replaceLinks = options.replaceLinks ?? true;

  try {
    const csvRows = await loadCsvStream(csvPath);
    const mapped = parseKanjiLessonMapRows(csvRows);
    const lessonNumbers = lessonNumbersFromKanjiLessonRows(mapped);

    console.log(
      `[seed:kanji-lessons-n5] Đọc ${mapped.length} dòng từ ${csvPath.split(/[/\\]/).pop()}`,
    );

    let courseId = options.courseId;
    if (!courseId) {
      const course = await db.course.findFirst({
        where: { jlptLevel: "N5", title: N5_COURSE_TITLE },
        select: { id: true },
      });
      if (!course) {
        throw new Error(
          `Chưa có khóa N5 "${N5_COURSE_TITLE}". Chạy prisma db seed trước.`,
        );
      }
      courseId = course.id;
    }

    const lessons = await db.lesson.findMany({
      where: { courseId, orderIndex: { in: lessonNumbers } },
      select: { id: true, orderIndex: true },
    });
    const lessonIdByNumber = new Map(
      lessons.map((lesson) => [lesson.orderIndex, lesson.id]),
    );

    const missingLessons = lessonNumbers.filter((n) => !lessonIdByNumber.has(n));
    if (missingLessons.length > 0) {
      throw new Error(
        `Không tìm thấy lesson orderIndex: ${missingLessons.join(", ")}.`,
      );
    }

    const characters = [...new Set(mapped.map((row) => row.character))];
    const kanjiRows = await db.kanji.findMany({
      where: { character: { in: characters } },
      select: { id: true, character: true },
    });
    const kanjiIdByCharacter = new Map(
      kanjiRows.map((row) => [row.character, row.id]),
    );

    const missingKanji = characters.filter((c) => !kanjiIdByCharacter.has(c));
    if (missingKanji.length > 0) {
      console.warn(
        `[seed:kanji-lessons-n5] Bỏ qua ${missingKanji.length} kanji chưa có trong DB: ${missingKanji.join(", ")}`,
      );
    }

    const lessonIds = lessonNumbers.map((n) => lessonIdByNumber.get(n)!);

    if (replaceLinks) {
      const deleted = await db.lessonKanji.deleteMany({
        where: { lessonId: { in: lessonIds } },
      });
      console.log(
        `[seed:kanji-lessons-n5] Đã xóa ${deleted.count} liên kết lesson_kanji cũ.`,
      );
    }

    const links: { lessonId: string; kanjiId: string }[] = [];
    const seen = new Set<string>();

    for (const row of mapped.sort(
      (a, b) =>
        a.lessonNumber - b.lessonNumber || a.orderIndex - b.orderIndex,
    )) {
      const kanjiId = kanjiIdByCharacter.get(row.character);
      if (!kanjiId) continue;

      const lessonId = lessonIdByNumber.get(row.lessonNumber)!;
      const key = `${lessonId}:${kanjiId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      links.push({ lessonId, kanjiId });
    }

    if (links.length > 0) {
      await db.lessonKanji.createMany({ data: links, skipDuplicates: true });
    }

    const byLesson = new Map<number, number>();
    for (const row of mapped) {
      if (!kanjiIdByCharacter.has(row.character)) continue;
      byLesson.set(
        row.lessonNumber,
        (byLesson.get(row.lessonNumber) ?? 0) + 1,
      );
    }

    console.log("[seed:kanji-lessons-n5] Đã gắn kanji theo bài:");
    for (const num of lessonNumbers) {
      console.log(`  - Bài ${num}: ${byLesson.get(num) ?? 0} kanji`);
    }
    console.log(`[seed:kanji-lessons-n5] Tổng: ${links.length} liên kết.`);

    return {
      linked: links.length,
      missingKanji,
      lessonNumbers,
      rowCount: mapped.length,
    };
  } finally {
    if (ownsClient) {
      await db.$disconnect();
    }
  }
}

async function main() {
  const db = new PrismaClient();
  try {
    console.log("[seed:kanji-lessons-n5] Bắt đầu...");
    await seedKanjiLessonsN5FromCsv({ db });
    console.log("[seed:kanji-lessons-n5] Hoàn tất.");
  } finally {
    await db.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error("[seed:kanji-lessons-n5] Lỗi:", error);
    process.exit(1);
  });
}
