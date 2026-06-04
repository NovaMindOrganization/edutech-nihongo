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
