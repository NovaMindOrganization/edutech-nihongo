import { PrismaClient } from "@prisma/client";

import { createKanjiSlug } from "../utils/kanji-slug.js";

const db = new PrismaClient();

async function main() {
  const kanjiRows = await db.kanji.findMany({
    select: { id: true, character: true, slug: true },
    orderBy: { character: "asc" },
  });

  let updated = 0;

  for (const row of kanjiRows) {
    if (row.slug) continue;

    await db.kanji.update({
      where: { id: row.id },
      data: { slug: createKanjiSlug(row.character) },
    });
    updated += 1;
  }

  console.log(`[kanji-slug] Backfilled ${updated} kanji rows.`);
}

main()
  .catch((error) => {
    console.error("[kanji-slug] Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
