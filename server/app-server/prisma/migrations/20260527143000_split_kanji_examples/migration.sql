-- Add Kanji detail fields
ALTER TABLE "kanji"
ADD COLUMN IF NOT EXISTS "han_viet_pronunciation" TEXT,
ADD COLUMN IF NOT EXISTS "memory_tip" TEXT;

-- Split kanji examples into a dedicated table
CREATE TABLE IF NOT EXISTS "kanji_examples" (
    "id" TEXT NOT NULL,
    "kanji_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "word" TEXT NOT NULL,
    "reading" TEXT,
    "meaning" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanji_examples_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "kanji_examples_kanji_id_order_index_key"
ON "kanji_examples"("kanji_id", "order_index");

CREATE INDEX IF NOT EXISTS "kanji_examples_kanji_id_idx"
ON "kanji_examples"("kanji_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kanji_examples_kanji_id_fkey'
  ) THEN
    ALTER TABLE "kanji_examples"
      ADD CONSTRAINT "kanji_examples_kanji_id_fkey"
      FOREIGN KEY ("kanji_id") REFERENCES "kanji"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill from legacy JSON examples when present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'kanji'
      AND column_name = 'example_words'
  ) THEN
    INSERT INTO "kanji_examples" ("id", "kanji_id", "order_index", "word", "reading", "meaning", "created_at")
    SELECT
      (
        substr(md5(random()::text || clock_timestamp()::text), 1, 8) || '-' ||
        substr(md5(random()::text || clock_timestamp()::text), 9, 4) || '-' ||
        substr(md5(random()::text || clock_timestamp()::text), 13, 4) || '-' ||
        substr(md5(random()::text || clock_timestamp()::text), 17, 4) || '-' ||
        substr(md5(random()::text || clock_timestamp()::text), 21, 12)
      )::uuid,
      k."id",
      (example_row.ordinal - 1),
      COALESCE(example_row.item->>'word', ''),
      NULLIF(example_row.item->>'reading', ''),
      COALESCE(example_row.item->>'meaning', ''),
      k."created_at"
    FROM "kanji" k
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(k."example_words") = 'array' THEN k."example_words"
        ELSE '[]'::jsonb
      END
    ) WITH ORDINALITY AS example_row(item, ordinal)
    WHERE COALESCE(example_row.item->>'word', '') <> ''
      AND COALESCE(example_row.item->>'meaning', '') <> ''
    ON CONFLICT ("kanji_id", "order_index") DO NOTHING;
  END IF;
END $$;
