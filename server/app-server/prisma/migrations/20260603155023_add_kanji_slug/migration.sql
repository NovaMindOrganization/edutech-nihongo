/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `kanji` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "kanji" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "kanji_slug_key" ON "kanji"("slug");
