-- Per-exam attempt limit (submitted sessions per user)
ALTER TABLE "mock_exams" ADD COLUMN "max_attempts" INTEGER NOT NULL DEFAULT 3;
