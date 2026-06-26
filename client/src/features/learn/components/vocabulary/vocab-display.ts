type VocabLike = {
  word: string;
  reading: string | null;
  jlptLevel?: string;
};

const KANA_FIRST_LEVELS = new Set(['N5', 'N4']);

/** N5/N4: reading (kana) lớn, kanji nhỏ bên dưới. JPD1 và khác: chỉ hiển thị word. */
export function getVocabDisplay({ word, reading, jlptLevel }: VocabLike) {
  const speechText = reading ?? word;

  if (!KANA_FIRST_LEVELS.has(jlptLevel ?? '')) {
    return { primaryText: word, kanjiText: null as string | null, speechText };
  }

  const primaryText = reading ?? word;
  const kanjiText = reading && reading !== word ? word : null;

  return { primaryText, kanjiText, speechText };
}
