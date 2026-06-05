import { PrismaClient } from "@prisma/client";

import { createKanjiSlug } from "../utils/kanji-slug.js";

const db = new PrismaClient();

async function main() {
  const kanjiRows = await db.$queryRaw<{ id: string; character: string; slug: string | null }[]>`
    SELECT id, character, slug FROM kanji ORDER BY character ASC
  `;

  let updated = 0;
  const usedSlugs = new Set(
    kanjiRows.map((row) => row.slug).filter((slug): slug is string => Boolean(slug)),
  );

  for (const row of kanjiRows) {
    if (row.slug) continue;

    let slug = createKanjiSlug(row.character);
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${createKanjiSlug(row.character)}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    await db.$executeRaw`UPDATE kanji SET slug = ${slug} WHERE id = ${row.id}`;
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
