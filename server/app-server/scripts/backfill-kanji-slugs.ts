import { loadEnvFile } from "node:process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import {
  kanjiSlugNeedsRepair,
  reserveUniqueKanjiSlug,
} from "../utils/kanji-slug.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  loadEnvFile(join(__dirname, "../.env"));
} catch {
  // Optional .env for local runs.
}

export type BackfillKanjiSlugsOptions = {
  db?: PrismaClient;
};

/**
 * Đưa mọi slug về dạng chuẩn `kanji-706b` (hex Unicode), thay placeholder migration.
 */
export async function backfillKanjiSlugs(options: BackfillKanjiSlugsOptions = {}) {
  const db = options.db ?? new PrismaClient();
  const ownsClient = !options.db;

  try {
    const kanjiRows = await db.kanji.findMany({
      select: { id: true, character: true, slug: true },
      orderBy: { character: "asc" },
    });

    let updated = 0;
    let skipped = 0;
    const usedSlugs = new Set<string>();

    for (const row of kanjiRows) {
      if (!kanjiSlugNeedsRepair(row.slug, row.character, row.id)) {
        usedSlugs.add(row.slug);
        skipped += 1;
        continue;
      }

      const slug = reserveUniqueKanjiSlug(row.character, usedSlugs);

      await db.kanji.update({
        where: { id: row.id },
        data: { slug },
      });
      updated += 1;
    }

    console.log(
      `[kanji-slug] Đã sửa ${updated} slug → dạng kanji-{hex}, giữ nguyên ${skipped} (tổng ${kanjiRows.length}).`,
    );

    return { updated, skipped, total: kanjiRows.length };
  } finally {
    if (ownsClient) {
      await db.$disconnect();
    }
  }
}

async function main() {
  await backfillKanjiSlugs();
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error("[kanji-slug] Backfill failed:", error);
    process.exit(1);
  });
}
