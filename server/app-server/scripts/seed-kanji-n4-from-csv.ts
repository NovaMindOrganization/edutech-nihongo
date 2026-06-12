import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { seedKanjiFromCsv } from "./seed-kanji-n5-from-csv.js";
import { seedKanjiLessonsN4FromCsv } from "./seed-kanji-lessons-n4.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_N4_KANJI_CSV = join(
  __dirname,
  "../data/Database_Kanji_and_Example_N4.csv",
);

export type SeedKanjiN4Options = {
  csvPath?: string;
  adminId?: string;
  courseId?: string;
  db?: PrismaClient;
  replaceExamples?: boolean;
  assignImagePaths?: boolean;
  syncMemoryImages?: boolean;
  backfillSlugs?: boolean;
  linkLessons?: boolean;
};

export async function seedKanjiN4FromCsv(options: SeedKanjiN4Options = {}) {
  const courseId = options.courseId;
  const linkLessons = options.linkLessons ?? true;

  return seedKanjiFromCsv({
    csvPath: options.csvPath ?? DEFAULT_N4_KANJI_CSV,
    jlptLevel: "N4",
    adminId: options.adminId,
    db: options.db,
    replaceExamples: options.replaceExamples,
    assignImagePaths: options.assignImagePaths,
    syncMemoryImages: options.syncMemoryImages,
    backfillSlugs: options.backfillSlugs,
    linkLessons,
    lessonLink: linkLessons
      ? (db) => seedKanjiLessonsN4FromCsv({ db, courseId })
      : undefined,
  });
}

async function main() {
  const db = new PrismaClient();
  try {
    console.log("[seed:kanji-n4] Bắt đầu...");
    await seedKanjiN4FromCsv({ db });
    console.log("[seed:kanji-n4] Hoàn tất.");
  } finally {
    await db.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error("[seed:kanji-n4] Lỗi:", error);
    process.exit(1);
  });
}
