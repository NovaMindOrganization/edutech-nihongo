-- CreateEnum
CREATE TYPE "StudySetContentType" AS ENUM ('vocabulary', 'grammar', 'kanji', 'listening', 'speaking');

-- AlterTable study_sets
ALTER TABLE "study_sets" ADD COLUMN IF NOT EXISTS "cover_image_url" TEXT;
ALTER TABLE "study_sets" ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "study_sets" ADD COLUMN IF NOT EXISTS "moderation_note" TEXT;
ALTER TABLE "study_sets" ADD COLUMN IF NOT EXISTS "view_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "study_sets" ADD COLUMN IF NOT EXISTS "clone_count" INTEGER NOT NULL DEFAULT 0;

-- Rename study_set_cards -> study_set_items and migrate columns
ALTER TABLE "study_set_cards" RENAME TO "study_set_items";

ALTER TABLE "study_set_items" ADD COLUMN IF NOT EXISTS "content_type" "StudySetContentType";
ALTER TABLE "study_set_items" ADD COLUMN IF NOT EXISTS "content" JSONB;

UPDATE "study_set_items"
SET
  "content_type" = 'vocabulary',
  "content" = jsonb_build_object(
    'word', "front",
    'meaning', "back",
    'reading', ''
  )
WHERE "content_type" IS NULL;

ALTER TABLE "study_set_items" ALTER COLUMN "content_type" SET NOT NULL;
ALTER TABLE "study_set_items" ALTER COLUMN "content" SET NOT NULL;

ALTER TABLE "study_set_items" DROP COLUMN IF EXISTS "front";
ALTER TABLE "study_set_items" DROP COLUMN IF EXISTS "back";

CREATE INDEX IF NOT EXISTS "study_set_items_study_set_id_content_type_idx"
  ON "study_set_items"("study_set_id", "content_type");
