const KANJI_BUCKET = "kanji";

export type KanjiImageSource = {
  id: string;
  character: string;
  jlptLevel: string;
};

export function getKanjiSlug(kanji: Pick<KanjiImageSource, "character">) {
  const codePoint = kanji.character.codePointAt(0);
  if (codePoint == null) return "kanji-unknown";
  return `kanji-${codePoint.toString(16).toLowerCase()}`;
}

export function getKanjiImageObjectKey(kanji: Pick<KanjiImageSource, "character" | "jlptLevel">) {
  return `${kanji.jlptLevel}/${getKanjiSlug(kanji)}.webp`;
}

export function getKanjiImageStoragePath(kanji: Pick<KanjiImageSource, "character" | "jlptLevel">) {
  return `${KANJI_BUCKET}/${getKanjiImageObjectKey(kanji)}`;
}

export function getKanjiImageUrl(kanji: Pick<KanjiImageSource, "id">) {
  return `/api/public/kanji/${encodeURIComponent(kanji.id)}/memory-image`;
}

export function withKanjiImageUrl<T extends KanjiImageSource>(kanji: T) {
  return {
    ...kanji,
    imageUrl: getKanjiImageUrl(kanji),
  };
}
