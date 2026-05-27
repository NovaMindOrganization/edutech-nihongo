-- CreateTable
CREATE TABLE "kanji" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "readings_on" TEXT[],
    "readings_kun" TEXT[],
    "meaning" TEXT NOT NULL,
    "stroke_count" INTEGER,
    "radical" TEXT,
    "jlpt_level" TEXT NOT NULL,
    "stroke_animation_url" TEXT,
    "example_words" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "dialogue" JSONB NOT NULL,
    "audio_url" TEXT,
    "jlpt_level" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_kanji" (
    "lesson_id" TEXT NOT NULL,
    "kanji_id" TEXT NOT NULL,

    CONSTRAINT "lesson_kanji_pkey" PRIMARY KEY ("lesson_id","kanji_id")
);

-- CreateTable
CREATE TABLE "lesson_conversations" (
    "lesson_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,

    CONSTRAINT "lesson_conversations_pkey" PRIMARY KEY ("lesson_id","conversation_id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "explanation" TEXT,
    "jlpt_level" TEXT,
    "question_category" TEXT,
    "audio_url" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_questions" (
    "lesson_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "lesson_questions_pkey" PRIMARY KEY ("lesson_id","question_id")
);

-- CreateTable
CREATE TABLE "mock_exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "jlpt_level" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_exam_questions" (
    "mock_exam_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "section" TEXT,

    CONSTRAINT "mock_exam_questions_pkey" PRIMARY KEY ("mock_exam_id","question_id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mock_exam_id" TEXT,
    "level" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "answers" JSONB,
    "score" JSONB,
    "is_auto_submitted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_error_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "original_text" TEXT,
    "correction" TEXT,
    "lesson_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_error_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sets" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "cloned_from" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_set_cards" (
    "id" TEXT NOT NULL,
    "study_set_id" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "study_set_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abuse_reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT,
    "reported_user_id" TEXT,
    "room_id" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abuse_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_results" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "recommended_level" TEXT NOT NULL,
    "scores_by_level" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_questions" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "placement_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kanji_character_key" ON "kanji"("character");

-- CreateIndex
CREATE INDEX "kanji_jlpt_level_idx" ON "kanji"("jlpt_level");

-- CreateIndex
CREATE INDEX "conversation_history_user_id_session_id_idx" ON "conversation_history"("user_id", "session_id");

-- CreateIndex
CREATE INDEX "user_error_log_user_id_source_idx" ON "user_error_log"("user_id", "source");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "kanji" ADD CONSTRAINT "kanji_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_kanji" ADD CONSTRAINT "lesson_kanji_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_kanji" ADD CONSTRAINT "lesson_kanji_kanji_id_fkey" FOREIGN KEY ("kanji_id") REFERENCES "kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_conversations" ADD CONSTRAINT "lesson_conversations_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_conversations" ADD CONSTRAINT "lesson_conversations_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_questions" ADD CONSTRAINT "mock_exam_questions_mock_exam_id_fkey" FOREIGN KEY ("mock_exam_id") REFERENCES "mock_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_questions" ADD CONSTRAINT "mock_exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_mock_exam_id_fkey" FOREIGN KEY ("mock_exam_id") REFERENCES "mock_exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_history" ADD CONSTRAINT "conversation_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_error_log" ADD CONSTRAINT "user_error_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_error_log" ADD CONSTRAINT "user_error_log_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sets" ADD CONSTRAINT "study_sets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sets" ADD CONSTRAINT "study_sets_cloned_from_fkey" FOREIGN KEY ("cloned_from") REFERENCES "study_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_set_cards" ADD CONSTRAINT "study_set_cards_study_set_id_fkey" FOREIGN KEY ("study_set_id") REFERENCES "study_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abuse_reports" ADD CONSTRAINT "abuse_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abuse_reports" ADD CONSTRAINT "abuse_reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_results" ADD CONSTRAINT "placement_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_questions" ADD CONSTRAINT "placement_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
