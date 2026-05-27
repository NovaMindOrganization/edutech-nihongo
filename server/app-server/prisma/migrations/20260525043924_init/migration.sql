-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'instructor', 'admin');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('locked', 'active', 'completed');

-- CreateEnum
CREATE TYPE "MasteryItemType" AS ENUM ('vocabulary', 'kanji');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "oauth_provider" TEXT,
    "oauth_id" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "display_name" TEXT,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "jlpt_level" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "pass_threshold" INTEGER NOT NULL DEFAULT 70,
    "is_bonus" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT,
    "meaning" TEXT NOT NULL,
    "meaning_en" TEXT,
    "example_sentence" TEXT,
    "example_translation" TEXT,
    "jlpt_level" TEXT NOT NULL,
    "topic" TEXT,
    "audio_url" TEXT,
    "part_of_speech" TEXT,
    "source_lesson" INTEGER,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "meaning_en" TEXT,
    "structure" TEXT,
    "grammar_type" TEXT,
    "usage_note" TEXT,
    "explanation" TEXT,
    "jlpt_level" TEXT NOT NULL,
    "topic" TEXT,
    "example_sentences" JSONB,
    "source_lesson" INTEGER,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_vocabulary" (
    "lesson_id" TEXT NOT NULL,
    "vocabulary_id" TEXT NOT NULL,

    CONSTRAINT "lesson_vocabulary_pkey" PRIMARY KEY ("lesson_id","vocabulary_id")
);

-- CreateTable
CREATE TABLE "lesson_grammar" (
    "lesson_id" TEXT NOT NULL,
    "grammar_id" TEXT NOT NULL,

    CONSTRAINT "lesson_grammar_pkey" PRIMARY KEY ("lesson_id","grammar_id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'locked',
    "mini_test_score" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_mastery_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_type" "MasteryItemType" NOT NULL,
    "is_learned" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_mastery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_streaks" (
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_course_id_order_index_key" ON "lessons"("course_id", "order_index");

-- CreateIndex
CREATE INDEX "vocabulary_jlpt_level_idx" ON "vocabulary"("jlpt_level");

-- CreateIndex
CREATE INDEX "vocabulary_topic_idx" ON "vocabulary"("topic");

-- CreateIndex
CREATE INDEX "grammar_jlpt_level_idx" ON "grammar"("jlpt_level");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_user_id_course_id_key" ON "course_enrollments"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_user_id_lesson_id_key" ON "user_lesson_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_mastery_items_user_id_item_id_item_type_key" ON "user_mastery_items"("user_id", "item_id", "item_type");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar" ADD CONSTRAINT "grammar_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabulary" ADD CONSTRAINT "lesson_vocabulary_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabulary" ADD CONSTRAINT "lesson_vocabulary_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_grammar" ADD CONSTRAINT "lesson_grammar_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_grammar" ADD CONSTRAINT "lesson_grammar_grammar_id_fkey" FOREIGN KEY ("grammar_id") REFERENCES "grammar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mastery_items" ADD CONSTRAINT "user_mastery_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
