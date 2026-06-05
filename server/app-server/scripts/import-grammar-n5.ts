import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  loadEnvFile(join(__dirname, "../.env"));
} catch {
  // The deployment environment may provide DATABASE_URL directly.
}

const db = new PrismaClient();

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const ch = line[index];

    if (ch === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index++;
      } else {
        inQuotes = !inQuotes;
      }
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

function loadCsv(path: string): Record<string, string>[] {
  const raw = readFileSync(path, "utf-8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) {
    throw new Error(`CSV file is empty: ${path}`);
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, (cols[index] ?? "").trim()]),
    );
  });
}

function parseJsonField(value: string | undefined) {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  return JSON.parse(raw);
}

async function main() {
  const csvPath = join(__dirname, "../data/grammar-n5.csv");
  const rows = loadCsv(csvPath);

  const lessonNumbers = [
    ...new Set(
      rows
        .map((row) => Number.parseInt(row.lesson ?? "", 10))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ].sort((a, b) => a - b);

  const courses = await db.course.findMany({
    where: { jlptLevel: "N5" },
    select: { id: true },
  });
  const courseIds = courses.map((course) => course.id);

  const lessons = await db.lesson.findMany({
    where: {
      orderIndex: { in: lessonNumbers },
      ...(courseIds.length > 0 ? { courseId: { in: courseIds } } : {}),
    },
    select: { id: true, orderIndex: true },
  });
  const lessonIdByOrder = new Map(lessons.map((lesson) => [lesson.orderIndex, lesson.id]));

  const grammarIdsToRemove = await db.grammar.findMany({
    where: { jlpt: "N5" },
    select: { id: true },
  });

  if (grammarIdsToRemove.length > 0) {
    await db.lessonGrammar.deleteMany({
      where: { grammarId: { in: grammarIdsToRemove.map((row) => row.id) } },
    });
  }
  await db.grammar.deleteMany({ where: { jlpt: "N5" } });

  let created = 0;
  let linked = 0;

  for (const row of rows) {
    const lessonNumber = Number.parseInt(row.lesson ?? "", 10);
    const order = Number.parseInt(row.order ?? "", 10);

    if (!Number.isInteger(lessonNumber) || !Number.isInteger(order)) {
      throw new Error(`Invalid lesson/order in row: ${JSON.stringify(row)}`);
    }

    const title = (row.title ?? "").trim();
    const jlpt = (row.jlpt ?? "").trim();
    const type = (row.type ?? "").trim() || null;
    const pattern = (row.pattern ?? "").trim();
    const meaningVi = (row.meaning_vi ?? "").trim();
    const usage = (row.usage ?? "").trim() || null;
    const notes = (row.notes ?? "").trim() || null;

    if (!title || !jlpt || !pattern || !meaningVi) {
      throw new Error(`Missing required grammar data in row: ${JSON.stringify(row)}`);
    }

    const createdGrammar = await db.grammar.create({
      data: {
        title,
        jlpt,
        type,
        pattern,
        meaningVi,
        usage,
        notes,
        examples: parseJsonField(row.examples),
        quiz: parseJsonField(row.quiz),
        lessonId: lessonIdByOrder.get(lessonNumber) ?? null,
        order,
      },
    });
    created++;

    const lessonId = lessonIdByOrder.get(lessonNumber);
    if (lessonId) {
      await db.lessonGrammar.create({
        data: {
          lessonId,
          grammarId: createdGrammar.id,
        },
      });
      linked++;
    }
  }

  console.log(
    `[grammar-n5] Imported ${rows.length} rows. Created: ${created}, linked: ${linked}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());