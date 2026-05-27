-- Store MinIO object paths instead of environment-specific public URLs.
UPDATE "kanji"
SET "memory_image_url" = regexp_replace("memory_image_url", '^https?://[^/]+/kanji/', 'kanji/')
WHERE "memory_image_url" ~ '^https?://[^/]+/kanji/';
