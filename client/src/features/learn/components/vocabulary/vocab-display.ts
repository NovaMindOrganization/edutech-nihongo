type VocabLike = {
  word: string;
  reading: string | null;
  jlptLevel?: string;
};

const KANA_FIRST_LEVELS = new Set(['N5', 'N4']);
const INTRO_LEVELS = new Set(['JPD1', 'JPD2']);

/** CJK unified + extension kanji */
const KANJI_RE = /[\u4e00-\u9faf\u3400-\u4dbf]/;

function containsKanji(text: string): boolean {
  return KANJI_RE.test(text);
}

/**
 * N5/N4: reading (kana) lớn, kanji nhỏ bên dưới.
 * JPD1/JPD2: word (có thể kanji) lớn; nếu có kanji thì hiện reading kana bên dưới.
 */
export function getVocabDisplay({ word, reading, jlptLevel }: VocabLike) {
  const speechText = reading ?? word;
  const level = jlptLevel ?? '';
  const readingText = reading?.trim() ?? '';

  if (INTRO_LEVELS.has(level)) {
    if (containsKanji(word) && readingText && readingText !== word.trim()) {
      return { primaryText: word, kanjiText: readingText, speechText };
    }
    return { primaryText: word, kanjiText: null as string | null, speechText };
  }

  if (KANA_FIRST_LEVELS.has(level)) {
    const primaryText = readingText || word;
    const kanjiText = readingText && readingText !== word ? word : null;
    return { primaryText, kanjiText, speechText };
  }

  return { primaryText: word, kanjiText: null as string | null, speechText };
}
