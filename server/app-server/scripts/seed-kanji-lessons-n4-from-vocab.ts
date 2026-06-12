import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { N4_COURSE_TITLE } from "../data/n4-lesson-titles.js";
import { DEFAULT_N4_VOCAB_CSV } from "./seed-vocabulary-n4-from-csv.js";
import { loadCsvStream } from "./seed-vocabulary-n5-from-csv.js";
import {
  parseKanjiLessonMapRows,
  seedKanjiLessonsN5FromCsv,
} from "./seed-kanji-lessons-n5.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function extractHanCharacters(text: string): string[] {
  return [...text].filter((ch) => /\p{Script=Han}/u.test(ch));
}

export async function buildN4KanjiLessonRowsFromVocabCsv(csvPath: string) {
  const rows = await loadCsvStream(csvPath);
  const byLesson = new Map<number, string[]>();

  for (const row of rows) {
    const lessonNumber = Number(row.lesson_number);
    if (!Number.isFinite(lessonNumber)) continue;
    const kanjiField = (row.kanji ?? "").trim();
    if (!kanjiField) continue;

    const chars = extractHanCharacters(kanjiField);
    const list = byLesson.get(lessonNumber) ?? [];
    for (const ch of chars) {
      if (!list.includes(ch)) list.push(ch);
    }
    byLesson.set(lessonNumber, list.slice(0, 5));
  }

  const mapped: Record<string, string>[] = [];
  for (const [lessonNumber, chars] of [...byLesson.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    chars.forEach((character, index) => {
      mapped.push({
        lesson_number: String(lessonNumber),
        character,
        order_index: String(index + 1),
      });
    });
  }
  return mapped;
}

export async function seedKanjiLessonsN4FromVocab(
  options: {
    db?: PrismaClient;
    courseId?: string;
    csvPath?: string;
  } = {},
) {
  const db = options.db ?? new PrismaClient();
  const ownsClient = !options.db;
  const csvPath = options.csvPath ?? DEFAULT_N4_VOCAB_CSV;

  try {
    const mapped = await buildN4KanjiLessonRowsFromVocabCsv(csvPath);
    console.log(
      `[seed:kanji-lessons-n4] Sinh ${mapped.length} liên kết kanji từ vocab CSV`,
    );

    const parsed = parseKanjiLessonMapRows(mapped);
    if (parsed.length === 0) {
      console.warn("[seed:kanji-lessons-n4] Không có kanji để gắn.");
      return { linked: 0 };
    }

    let courseId = options.courseId;
    if (!courseId) {
      const course = await db.course.findFirst({
        where: { jlptLevel: "N4", title: N4_COURSE_TITLE },
        select: { id: true },
      });
      if (!course) throw new Error("Chưa có khóa N4.");
      courseId = course.id;
    }

    const tempCsv = join(__dirname, "../data/.n4-kanji-by-lesson.generated.csv");
    const { writeFileSync } = await import("node:fs");
    const header = "lesson_number,character,order_index\n";
    const body = mapped
      .map(
        (r) =>
          `${r.lesson_number},${r.character},${r.order_index}`,
      )
      .join("\n");
    writeFileSync(tempCsv, header + body, "utf-8");

    return seedKanjiLessonsN5FromCsv({
      db,
      courseId,
      csvPath: tempCsv,
      replaceLinks: true,
    });
  } finally {
    if (ownsClient) await db.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seedKanjiLessonsN4FromVocab().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
