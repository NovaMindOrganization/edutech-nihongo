-- CreateEnum
CREATE TYPE "StudySetModerationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "study_sets" ADD COLUMN IF NOT EXISTS "moderation_status" "StudySetModerationStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "study_sets" ADD COLUMN IF NOT EXISTS "moderated_at" TIMESTAMP(3);
