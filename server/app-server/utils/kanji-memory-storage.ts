export const KANJI_MEMORY_BUCKET = "kanji";

/** Object key inside bucket `kanji` (e.g. `N5/kanji-4e00.webp`). */
export function buildKanjiMemoryObjectKey(jlptLevel: string, slug: string) {
  return `${jlptLevel}/${slug}.webp`;
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
