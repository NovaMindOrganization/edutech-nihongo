-- AlterTable
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "lesson_id" TEXT;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "order_index" INTEGER;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "quiz" JSONB;

-- Backfill data for existing rows
UPDATE "grammar"
SET "title" = COALESCE(NULLIF("pattern", ''), NULLIF("meaning", ''), 'Untitled')
WHERE "title" IS NULL;

UPDATE "grammar" AS g
SET "lesson_id" = lg."lesson_id"
FROM (
    SELECT "grammar_id", MIN("lesson_id") AS "lesson_id"
    FROM "lesson_grammar"
    GROUP BY "grammar_id"
) AS lg
WHERE g."id" = lg."grammar_id"
  AND g."lesson_id" IS NULL;

UPDATE "grammar"
SET "order_index" = "source_lesson"
WHERE "order_index" IS NULL
  AND "source_lesson" IS NOT NULL;

-- Enforce required column after backfill
ALTER TABLE "grammar" ALTER COLUMN "title" SET NOT NULL;

-- Drop deprecated columns
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "meaning_en";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "structure";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "topic";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "source_lesson";
