/*
  Warnings:

  - Made the column `slug` on table `kanji` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill before NOT NULL (run scripts/backfill-kanji-slugs.ts for full slug rules)
UPDATE "kanji"
SET "slug" = 'kanji-' || replace("id"::text, '-', '')
WHERE "slug" IS NULL;

-- AlterTable
ALTER TABLE "kanji" ALTER COLUMN "slug" SET NOT NULL;
