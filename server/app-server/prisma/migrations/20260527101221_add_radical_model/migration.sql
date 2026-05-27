/*
  Warnings:

  - You are about to drop the column `example_words` on the `kanji` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kanji" DROP COLUMN "example_words";

-- CreateTable
CREATE TABLE "radicals" (
    "id" TEXT NOT NULL,
    "radical_index" INTEGER NOT NULL,
    "character" TEXT NOT NULL,
    "sino_vietnamese" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "stroke_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radicals_pkey" PRIMARY KEY ("id")
);
