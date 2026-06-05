-- CreateEnum
CREATE TYPE "VocabularyProgressStatus" AS ENUM ('learning', 'mastered');

-- CreateTable
CREATE TABLE "user_vocabulary_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vocabulary_id" TEXT NOT NULL,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "status" "VocabularyProgressStatus",
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_vocabulary_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_user_id_is_starred_idx" ON "user_vocabulary_progress"("user_id", "is_starred");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_user_id_status_idx" ON "user_vocabulary_progress"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_vocabulary_progress_user_id_vocabulary_id_key" ON "user_vocabulary_progress"("user_id", "vocabulary_id");

-- AddForeignKey
ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "user_vocabulary_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "user_vocabulary_progress_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
