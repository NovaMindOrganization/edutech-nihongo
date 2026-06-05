import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { normalizeKanjiMemoryStoragePath } from "../utils/kanji-memory-storage.js";
import { createKanjiSlug } from "../utils/kanji-slug.js";
import { syncKanjiMemoryImagesFromMinio } from "./sync-kanji-memory-images.js";
import { loadCsvStream } from "./seed-vocabulary-n5-from-csv.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_N5_KANJI_CSV = join(
  __dirname,
  "../data/Database_Kanji_and_Example_N5_Updated.csv",
);

const EXAMPLE_WORD_KEYS = ["Word 1", "Word 2", "Word 3"] as const;

const NO_READING = /^\(không có\)$/i;

export type ParsedKanjiExample = {
  word: string;
  reading?: string;
  meaning: string;
};

export type SeedKanjiN5Options = {
  csvPath?: string;
  adminId?: string;
  db?: PrismaClient;
  /** Ghi đè ví dụ từ CSV (mặc định: true). */
  replaceExamples?: boolean;
  /** Gắn memoryImageUrl từ MinIO sau khi seed (mặc định: true). */
  syncMemoryImages?: boolean;
};

/** Parse ô CSV dạng `一つ【ひとつ】một cái`. */
export function parseKanjiExampleCell(
  cell: string,
): ParsedKanjiExample | null {
  const trimmed = cell.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(.+?)【([^】]+)】(.*)$/);
  if (!match) return null;

  const word = match[1].trim();
  const reading = match[2].trim();
  const meaning = match[3].trim();
  if (!word || !meaning) return null;

  return {
    word,
    reading: reading || undefined,
    meaning,
  };
}

export function parseKanjiReadingList(value: string | undefined): string[] {
  const raw = (value ?? "").trim();
  if (!raw || NO_READING.test(raw)) return [];

  return [
    ...new Set(
      raw
        .split(/[,，]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0 && !NO_READING.test(part)),
    ),
  ];
}

export function parseKanjiExamplesFromRow(
  row: Record<string, string>,
): ParsedKanjiExample[] {
  const examples: ParsedKanjiExample[] = [];

  for (const key of EXAMPLE_WORD_KEYS) {
    const parsed = parseKanjiExampleCell(row[key] ?? "");
    if (parsed) examples.push(parsed);
  }

  return examples;
}

function parseStrokeCount(value: string | undefined): number | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  const parsed = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return null;

  const normalized = Math.round(parsed);
  if (normalized < 1 || normalized > 80) return null;

  return normalized;
}

/** Chỉ trả về khi CSV có cột Image — tránh ghi đè URL MinIO đã có. */
function parseMemoryImageFromCsv(
  value: string | undefined,
): string | undefined {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return undefined;
  return normalizeKanjiMemoryStoragePath(trimmed);
}

function mapKanjiRow(row: Record<string, string>) {
  const character = (row.Kanji || row.kanji || row.Character || "").trim();
  const meaning = (row.Meaning || "").trim();
  const jlptLevel = (row.Level || "N5").trim() || "N5";

  return {
    character,
    meaning,
    jlptLevel,
    hanVietPronunciation:
      (row["Han-Viet Pronunciation"] || "").trim() || null,
    readingsOn: parseKanjiReadingList(row.On),
    readingsKun: parseKanjiReadingList(row.Kun),
    memoryTip: (row.MemoryTip || "").trim() || null,
    memoryImageUrl: parseMemoryImageFromCsv(row.Image),
    strokeCount: parseStrokeCount(row.StrokeCount),
    radical: (row["Bộ thủ chính"] || row.radical || "").trim() || null,
    examples: parseKanjiExamplesFromRow(row),
  };
}

function reserveUniqueSlug(character: string, usedSlugs: Set<string>) {
  let slug = createKanjiSlug(character);
  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${createKanjiSlug(character)}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(slug);
  return slug;
}

export async function seedKanjiN5FromCsv(options: SeedKanjiN5Options = {}) {
  const db = options.db ?? new PrismaClient();
  const ownsClient = !options.db;
  const csvPath = options.csvPath ?? DEFAULT_N5_KANJI_CSV;
  const replaceExamples = options.replaceExamples ?? true;
  const syncMemoryImages = options.syncMemoryImages ?? true;

  try {
    const rows = await loadCsvStream(csvPath);
    console.log(
      `[seed:kanji-n5] Đọc ${rows.length} dòng từ ${csvPath.split(/[/\\]/).pop()}`,
    );

    let adminId = options.adminId;
    if (!adminId) {
      const admin = await db.user.findFirst({
        where: { role: "admin" },
        select: { id: true },
      });
      adminId = admin?.id;
    }

    const usedSlugs = new Set(
      (
        await db.kanji.findMany({
          select: { slug: true },
        })
      ).map((row) => row.slug),
    );

    let created = 0;
    let updated = 0;
    let examplesWritten = 0;
    let skipped = 0;

    for (const row of rows) {
      const mapped = mapKanjiRow(row);
      if (!mapped.character) {
        skipped += 1;
        continue;
      }
      if (!mapped.meaning) {
        console.warn(
          `[seed:kanji-n5] Bỏ qua ${mapped.character}: thiếu Meaning.`,
        );
        skipped += 1;
        continue;
      }

      const { examples, memoryImageUrl, ...kanjiData } = mapped;

      let kanji = await db.kanji.findFirst({
        where: { character: mapped.character },
        select: { id: true },
      });

      if (!kanji) {
        const slug = reserveUniqueSlug(mapped.character, usedSlugs);
        kanji = await db.kanji.create({
          data: {
            ...kanjiData,
            slug,
            ...(memoryImageUrl ? { memoryImageUrl } : {}),
            ...(adminId ? { createdById: adminId } : {}),
          },
          select: { id: true },
        });
        created += 1;
      } else {
        await db.kanji.update({
          where: { id: kanji.id },
          data: {
            ...kanjiData,
            ...(memoryImageUrl ? { memoryImageUrl } : {}),
          },
        });
        updated += 1;
      }

      if (replaceExamples && examples.length > 0) {
        await db.kanjiExample.deleteMany({ where: { kanjiId: kanji.id } });
        await db.kanjiExample.createMany({
          data: examples.map((example, index) => ({
            kanjiId: kanji!.id,
            orderIndex: index,
            word: example.word,
            reading: example.reading ?? null,
            meaning: example.meaning,
          })),
        });
        examplesWritten += examples.length;
      }
    }

    console.log(
      `[seed:kanji-n5] Tạo mới ${created}, cập nhật ${updated}, ví dụ ${examplesWritten}, bỏ qua ${skipped}.`,
    );

    let imageSync: Awaited<ReturnType<typeof syncKanjiMemoryImagesFromMinio>> | undefined;
    if (syncMemoryImages) {
      imageSync = await syncKanjiMemoryImagesFromMinio({
        db,
        jlptLevel: "N5",
      });
    }

    return {
      created,
      updated,
      examplesWritten,
      skipped,
      rowCount: rows.length,
      imageSync,
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
    console.log("[seed:kanji-n5] Bắt đầu...");
    await seedKanjiN5FromCsv({ db });
    console.log("[seed:kanji-n5] Hoàn tất.");
  } finally {
    await db.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error("[seed:kanji-n5] Lỗi:", error);
    process.exit(1);
  });
}
