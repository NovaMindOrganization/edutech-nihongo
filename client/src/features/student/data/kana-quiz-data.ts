export type KanaChar = { kana: string; romaji: string[] };

export type KanaRow = {
  key: string;
  label: string;
  chars: KanaChar[];
};

export type KanaGroupId = 'main' | 'dakuten' | 'combination';

export type KanaGroup = {
  id: KanaGroupId;
  label: string;
  rows: KanaRow[];
};

const c = (kana: string, romaji: string | string[]): KanaChar => ({
  kana,
  romaji: Array.isArray(romaji) ? romaji : [romaji],
});

const row = (key: string, label: string, chars: KanaChar[]): KanaRow => ({
  key,
  label,
  chars,
});

/** Hiragana chart — mirrors tofugu kana-quiz row groupings */
export const HIRAGANA_GROUPS: KanaGroup[] = [
  {
    id: 'main',
    label: 'Main Kana',
    rows: [
      row('a', 'あ/a', [
        c('あ', 'a'),
        c('い', 'i'),
        c('う', 'u'),
        c('え', 'e'),
        c('お', 'o'),
      ]),
      row('ka', 'か/ka', [
        c('か', 'ka'),
        c('き', 'ki'),
        c('く', 'ku'),
        c('け', 'ke'),
        c('こ', 'ko'),
      ]),
      row('sa', 'さ/sa', [
        c('さ', 'sa'),
        c('し', ['shi', 'si']),
        c('す', 'su'),
        c('せ', 'se'),
        c('そ', 'so'),
      ]),
      row('ta', 'た/ta', [
        c('た', 'ta'),
        c('ち', ['chi', 'ti']),
        c('つ', ['tsu', 'tu']),
        c('て', 'te'),
        c('と', 'to'),
      ]),
      row('na', 'な/na', [
        c('な', 'na'),
        c('に', 'ni'),
        c('ぬ', 'nu'),
        c('ね', 'ne'),
        c('の', 'no'),
      ]),
      row('ha', 'は/ha', [
        c('は', 'ha'),
        c('ひ', 'hi'),
        c('ふ', ['fu', 'hu']),
        c('へ', 'he'),
        c('ほ', 'ho'),
      ]),
      row('ma', 'ま/ma', [
        c('ま', 'ma'),
        c('み', 'mi'),
        c('む', 'mu'),
        c('め', 'me'),
        c('も', 'mo'),
      ]),
      row('ya', 'や/ya', [c('や', 'ya'), c('ゆ', 'yu'), c('よ', 'yo')]),
      row('ra', 'ら/ra', [
        c('ら', 'ra'),
        c('り', 'ri'),
        c('る', 'ru'),
        c('れ', 're'),
        c('ろ', 'ro'),
      ]),
      row('wa', 'わ/wa', [c('わ', 'wa'), c('を', 'wo'), c('ん', 'n')]),
    ],
  },
  {
    id: 'dakuten',
    label: 'Dakuten Kana',
    rows: [
      row('ga', 'が/ga', [
        c('が', 'ga'),
        c('ぎ', 'gi'),
        c('ぐ', 'gu'),
        c('げ', 'ge'),
        c('ご', 'go'),
      ]),
      row('za', 'ざ/za', [
        c('ざ', 'za'),
        c('じ', ['ji', 'zi']),
        c('ず', 'zu'),
        c('ぜ', 'ze'),
        c('ぞ', 'zo'),
      ]),
      row('da', 'だ/da', [
        c('だ', 'da'),
        c('ぢ', ['di', 'ji']),
        c('づ', ['du', 'zu']),
        c('で', 'de'),
        c('ど', 'do'),
      ]),
      row('ba', 'ば/ba', [
        c('ば', 'ba'),
        c('び', 'bi'),
        c('ぶ', 'bu'),
        c('べ', 'be'),
        c('ぼ', 'bo'),
      ]),
      row('pa', 'ぱ/pa', [
        c('ぱ', 'pa'),
        c('ぴ', 'pi'),
        c('ぷ', 'pu'),
        c('ぺ', 'pe'),
        c('ぽ', 'po'),
      ]),
    ],
  },
  {
    id: 'combination',
    label: 'Combination Kana',
    rows: [
      row('kya', 'きゃ/kya', [c('きゃ', 'kya'), c('きゅ', 'kyu'), c('きょ', 'kyo')]),
      row('sha', 'しゃ/sha', [
        c('しゃ', ['sha', 'sya']),
        c('しゅ', ['shu', 'syu']),
        c('しょ', ['sho', 'syo']),
      ]),
      row('cha', 'ちゃ/cha', [
        c('ちゃ', ['cha', 'tya', 'cya']),
        c('ちゅ', ['chu', 'tyu', 'cyu']),
        c('ちょ', ['cho', 'tyo', 'cyo']),
      ]),
      row('nya', 'にゃ/nya', [c('にゃ', 'nya'), c('にゅ', 'nyu'), c('にょ', 'nyo')]),
      row('hya', 'ひゃ/hya', [c('ひゃ', 'hya'), c('ひゅ', 'hyu'), c('ひょ', 'hyo')]),
      row('mya', 'みゃ/mya', [c('みゃ', 'mya'), c('みゅ', 'myu'), c('みょ', 'myo')]),
      row('rya', 'りゃ/rya', [c('りゃ', 'rya'), c('りゅ', 'ryu'), c('りょ', 'ryo')]),
      row('gya', 'ぎゃ/gya', [c('ぎゃ', 'gya'), c('ぎゅ', 'gyu'), c('ぎょ', 'gyo')]),
      row('ja', 'じゃ/ja', [
        c('じゃ', ['ja', 'jya', 'zya']),
        c('じゅ', ['ju', 'jyu', 'zyu']),
        c('じょ', ['jo', 'jyo', 'zyo']),
      ]),
      row('dya', 'ぢゃ/dya', [
        c('ぢゃ', ['dya', 'ja']),
        c('ぢゅ', ['dyu', 'ju']),
        c('ぢょ', ['dyo', 'jo']),
      ]),
      row('bya', 'びゃ/bya', [c('びゃ', 'bya'), c('びゅ', 'byu'), c('びょ', 'byo')]),
      row('pya', 'ぴゃ/pya', [c('ぴゃ', 'pya'), c('ぴゅ', 'pyu'), c('ぴょ', 'pyo')]),
    ],
  },
];

function hiraToKata(char: KanaChar): KanaChar {
  const code = char.kana.charCodeAt(0);
  const kata =
    code >= 0x3041 && code <= 0x3096
      ? String.fromCharCode(code + 0x60)
      : char.kana;
  return { kana: kata, romaji: char.romaji };
}

function convertGroups(groups: KanaGroup[]): KanaGroup[] {
  return groups.map((g) => ({
    ...g,
    rows: g.rows.map((r) => ({
      ...r,
      chars: r.chars.map(hiraToKata),
    })),
  }));
}

export const KATAKANA_GROUPS = convertGroups(HIRAGANA_GROUPS);

export const KANA_FONT_OPTIONS = [
  { value: 'sans', label: 'Noto Sans JP', family: "'Noto Sans JP Variable', 'Noto Sans JP', sans-serif" },
  { value: 'serif', label: 'Noto Serif JP', family: "'Noto Serif JP', serif" },
] as const;

export function normalizeRomaji(input: string): string {
  return input.trim().toLowerCase();
}

export function isRomajiCorrect(input: string, accepted: string[]): boolean {
  const n = normalizeRomaji(input);
  if (!n) return false;
  return accepted.some((r) => normalizeRomaji(r) === n);
}

/** Unbiased index in [0, maxExclusive) — prefers crypto RNG */
function randomIndex(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  if (typeof crypto !== 'undefined') {
    const c = crypto as Crypto & { randomInt?: (n: number) => number };
    if (typeof c.randomInt === 'function') {
      return c.randomInt(maxExclusive);
    }
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

/** Fisher–Yates shuffle; order differs on every call (non-deterministic) */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type QuizCard = KanaChar & {
  id: string;
  groupId: KanaGroupId;
  rowKey: string;
};

export function buildQuizCards(
  groups: KanaGroup[],
  selectedRowKeys: Set<string>,
): QuizCard[] {
  const cards: QuizCard[] = [];
  for (const group of groups) {
    for (const r of group.rows) {
      if (!selectedRowKeys.has(`${group.id}:${r.key}`)) continue;
      for (const ch of r.chars) {
        cards.push({
          ...ch,
          id: `${group.id}:${r.key}:${ch.kana}`,
          groupId: group.id,
          rowKey: r.key,
        });
      }
    }
  }
  return shuffle(cards);
}

export function allRowKeys(groups: KanaGroup[]): string[] {
  return groups.flatMap((g) => g.rows.map((r) => `${g.id}:${r.key}`));
}
