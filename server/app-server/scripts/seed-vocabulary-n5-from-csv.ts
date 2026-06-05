import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_N5_VOCAB_CSV = join(
  __dirname,
  "../data/N5_Vocabulary_Seed_Lesson1_to_25_firstly.csv",
);

export type SeedN5VocabularyOptions = {
  csvPath?: string;
  courseId?: string;
  adminId?: string;
  db?: PrismaClient;
  /** Bỏ qua bước xóa (khi seed.ts đã deleteMany toàn bộ N5). */
  skipDelete?: boolean;
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

export async function loadCsvStream(
  path: string,
): Promise<Record<string, string>[]> {
  const stream = createReadStream(path, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let headers: string[] | null = null;
  const rows: Record<string, string>[] = [];

  for await (const rawLine of rl) {
    const line = rawLine.replace(/^\uFEFF/, "").trim();
    if (!line) continue;

    const cols = parseCsvLine(line);
    if (!headers) {
      headers = cols.map((h) => h.trim());
      continue;
    }

    rows.push(
      Object.fromEntries(
        headers.map((h, i) => [h, (cols[i] ?? "").trim()]),
      ),
    );
  }

  return rows;
}

function normalizeKanji(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

function mapVocabularyRow(
  row: Record<string, string>,
  lessonId: string,
  courseId: string,
  createdById: string | undefined,
) {
  const hiragana = (row.word ?? "").trim();
  const kanji = normalizeKanji(row.kanji);
  const lessonNumber = Number(row.lesson_number);

  if (!hiragana) {
    throw new Error(
      `Dòng thiếu word (lesson_number=${row.lesson_number ?? "?"}).`,
    );
  }
  if (!Number.isFinite(lessonNumber)) {
    throw new Error(`lesson_number không hợp lệ: "${row.lesson_number}".`);
  }

  return {
    word: kanji ?? hiragana,
    reading: kanji ? hiragana : null,
    meaning: (row.meaning ?? "").trim(),
    jlptLevel: (row.jlptLevel ?? "N5").trim() || "N5",
    courseId,
    lessonId,
    lessonNumber,
    createdById: createdById ?? null,
  };
}

export function lessonNumbersFromVocabRows(
  rows: Record<string, string>[],
): number[] {
  return [
    ...new Set(
      rows
        .map((row) => Number(row.lesson_number))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),
  ].sort((a, b) => a - b);
}

export async function seedN5VocabularyFromCsv(
  options: SeedN5VocabularyOptions = {},
) {
  const db = options.db ?? new PrismaClient();
  const ownsClient = !options.db;
  const csvPath = options.csvPath ?? DEFAULT_N5_VOCAB_CSV;

  try {
    const csvRows = await loadCsvStream(csvPath);
    const lessonNumbers = lessonNumbersFromVocabRows(csvRows);

    console.log(
      `[seed:vocab-n5] Đọc ${csvRows.length} dòng từ ${csvPath.split(/[/\\]/).pop()}`,
    );

    let courseId = options.courseId;
    if (!courseId) {
      const course = await db.course.findFirst({
        where: {
          jlptLevel: "N5",
          title: "Japanese N5 — Complete Course",
        },
        select: { id: true },
      });
      if (!course) {
        throw new Error(
          "Chưa có khóa N5. Chạy prisma db seed trước để tạo course và lessons.",
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
        `[seed:vocab-n5] Đã xóa ${deletedVocab.count} từ (${deletedLinks.count} liên kết) cho ${lessonNumbers.length} bài.`,
      );
    }

    const mapped = csvRows.map((row) => {
      const lessonNumber = Number(row.lesson_number);
      return mapVocabularyRow(
        row,
        lessonIdByNumber.get(lessonNumber)!,
        courseId!,
        adminId,
      );
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

    console.log("[seed:vocab-n5] Đã import từ vựng theo bài:");
    for (const num of lessonNumbers) {
      console.log(`  - Bài ${num}: ${byLesson.get(num) ?? 0} từ`);
    }
    console.log(`[seed:vocab-n5] Tổng: ${mapped.length} từ vựng.`);

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
    console.log("[seed:vocab-n5] Bắt đầu...");
    await db.vocabulary.deleteMany({ where: { jlptLevel: "N5" } });
    await seedN5VocabularyFromCsv({ db });
    console.log("[seed:vocab-n5] Hoàn tất.");
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
