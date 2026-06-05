/** Slug tạm từ migration `make_kanji_slug_required` (kanji + id không dấu gạch). */
export function isKanjiMigrationPlaceholderSlug(slug: string, kanjiId: string) {
  const normalizedId = kanjiId.replace(/-/g, "").toLowerCase();
  return slug.toLowerCase() === `kanji-${normalizedId}`;
}

/**
 * Slug chuẩn cho kanji: `kanji-{codepoint hex}` (vd. 火 → kanji-706b).
 * Chữ Latin có thể ra dạng romanized; kanji/hiragana dùng hex Unicode.
 */
export function createKanjiSlug(value: string) {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalized) return normalized;

  const codePoints = Array.from(value)
    .map((character) => character.codePointAt(0)?.toString(16))
    .filter((part): part is string => Boolean(part));

  return `kanji-${codePoints.join("-")}`;
}

/** Slug dạng `kanji-706b` (hex), có thể thêm `-2` khi trùng. */
export function isStandardKanjiSlug(slug: string, character: string) {
  const base = createKanjiSlug(character);
  if (slug === base) return true;
  return new RegExp(`^${escapeRegExp(base)}-\\d+$`).test(slug);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Cần sửa slug (null, placeholder migration, hoặc không khớp chữ kanji). */
export function kanjiSlugNeedsRepair(
  slug: string | null | undefined,
  character: string,
  kanjiId: string,
) {
  const trimmed = slug?.trim();
  if (!trimmed) return true;
  if (isKanjiMigrationPlaceholderSlug(trimmed, kanjiId)) return true;
  return !isStandardKanjiSlug(trimmed, character);
}

export function reserveUniqueKanjiSlug(character: string, usedSlugs: Set<string>) {
  let slug = createKanjiSlug(character);
  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${createKanjiSlug(character)}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(slug);
  return slug;
}
