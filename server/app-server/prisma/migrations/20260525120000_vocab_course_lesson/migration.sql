-- Vocabulary: assign to course + lesson (replace source_lesson). IDs are TEXT in this DB.

ALTER TABLE "vocabulary" DROP COLUMN IF EXISTS "course_id";
ALTER TABLE "vocabulary" DROP COLUMN IF EXISTS "lesson_id";

ALTER TABLE "vocabulary" ADD COLUMN "course_id" TEXT;
ALTER TABLE "vocabulary" ADD COLUMN "lesson_id" TEXT;

UPDATE "vocabulary" v
SET
  "lesson_id" = lv.lesson_id,
  "course_id" = l.course_id
FROM "lesson_vocabulary" lv
JOIN "lessons" l ON l.id = lv.lesson_id
WHERE v.id = lv.vocabulary_id;

UPDATE "vocabulary" v
SET
  "lesson_id" = l.id,
  "course_id" = l.course_id
FROM "lessons" l
JOIN "courses" c ON c.id = l.course_id
WHERE v.source_lesson IS NOT NULL
  AND v.lesson_id IS NULL
  AND v.jlpt_level = c.jlpt_level
  AND l.order_index = v.source_lesson;

ALTER TABLE "vocabulary" DROP COLUMN IF EXISTS "source_lesson";

ALTER TABLE "vocabulary" DROP CONSTRAINT IF EXISTS "vocabulary_course_id_fkey";
ALTER TABLE "vocabulary" DROP CONSTRAINT IF EXISTS "vocabulary_lesson_id_fkey";

ALTER TABLE "vocabulary"
  ADD CONSTRAINT "vocabulary_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "vocabulary"
  ADD CONSTRAINT "vocabulary_lesson_id_fkey"
  FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "vocabulary_course_id_idx" ON "vocabulary"("course_id");
CREATE INDEX IF NOT EXISTS "vocabulary_lesson_id_idx" ON "vocabulary"("lesson_id");
