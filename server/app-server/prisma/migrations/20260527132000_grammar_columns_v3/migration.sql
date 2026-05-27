-- AlterTable
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "meaning_vi" TEXT;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "jlpt" TEXT;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "usage" TEXT;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "examples" JSONB;
ALTER TABLE "grammar" ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Backfill new columns from legacy columns
UPDATE "grammar"
SET "meaning_vi" = "meaning"
WHERE "meaning_vi" IS NULL
  AND "meaning" IS NOT NULL;

UPDATE "grammar"
SET "jlpt" = "jlpt_level"
WHERE "jlpt" IS NULL
  AND "jlpt_level" IS NOT NULL;

UPDATE "grammar"
SET "type" = "grammar_type"
WHERE "type" IS NULL
  AND "grammar_type" IS NOT NULL;

UPDATE "grammar"
SET "usage" = "usage_note"
WHERE "usage" IS NULL
  AND "usage_note" IS NOT NULL;

UPDATE "grammar"
SET "notes" = "explanation"
WHERE "notes" IS NULL
  AND "explanation" IS NOT NULL;

UPDATE "grammar"
SET "examples" = "example_sentences"
WHERE "examples" IS NULL
  AND "example_sentences" IS NOT NULL;

UPDATE "grammar"
SET "order" = "order_index"
WHERE "order" IS NULL
  AND "order_index" IS NOT NULL;

-- Enforce required columns
ALTER TABLE "grammar" ALTER COLUMN "meaning_vi" SET NOT NULL;
ALTER TABLE "grammar" ALTER COLUMN "jlpt" SET NOT NULL;

-- Drop legacy index and columns
DROP INDEX IF EXISTS "grammar_jlpt_level_idx";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "meaning";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "jlpt_level";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "grammar_type";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "usage_note";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "explanation";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "example_sentences";
ALTER TABLE "grammar" DROP COLUMN IF EXISTS "order_index";

-- Create new index
CREATE INDEX IF NOT EXISTS "grammar_jlpt_idx" ON "grammar"("jlpt");
