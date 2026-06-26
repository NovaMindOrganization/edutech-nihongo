export const KANJI_MEMORY_BUCKET = "kanji";

/** JLPT folders to try when a kanji row level (e.g. JPD1) differs from where images live. */
export const KANJI_MEMORY_JLPT_FALLBACK_LEVELS = ["N5", "N4"] as const;

/** Object key inside bucket `kanji` (e.g. `N5/kanji-4e00.webp`). */
export function buildKanjiMemoryObjectKey(jlptLevel: string, slug: string) {
  return `${jlptLevel}/${slug}.webp`;
}

/** Ordered MinIO keys to try for a kanji memory image. */
export function buildKanjiMemoryObjectKeyCandidates(
  kanji: {
    jlptLevel: string;
    slug: string;
    memoryImageUrl?: string | null;
  },
): string[] {
  const keys: string[] = [];

  if (kanji.memoryImageUrl?.trim()) {
    keys.push(normalizeKanjiMemoryStoragePath(kanji.memoryImageUrl));
  }

  if (kanji.slug?.trim()) {
    keys.push(buildKanjiMemoryObjectKey(kanji.jlptLevel, kanji.slug));
    for (const level of KANJI_MEMORY_JLPT_FALLBACK_LEVELS) {
      if (level !== kanji.jlptLevel) {
        keys.push(buildKanjiMemoryObjectKey(level, kanji.slug));
      }
    }
  }

  return [...new Set(keys)];
}

export function normalizeKanjiMemoryStoragePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf(KANJI_MEMORY_BUCKET);
    if (bucketIndex >= 0 && segments[bucketIndex + 1]) {
      return segments
        .slice(bucketIndex + 1)
        .map(decodeURIComponent)
        .join("/");
    }
  } catch {
    // Storage path, not a URL.
  }

  if (trimmed.startsWith(`${KANJI_MEMORY_BUCKET}/`)) {
    return trimmed.slice(KANJI_MEMORY_BUCKET.length + 1);
  }

  return trimmed.replace(/^\/+/, "");
}
