/*
  Warnings:

  - Made the column `slug` on table `kanji` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "kanji" ALTER COLUMN "slug" SET NOT NULL;
