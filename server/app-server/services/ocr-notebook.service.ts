import { MasteryItemType, Prisma } from '@prisma/client';

import { db } from '../config/db.js';

const KANJI_IN_TEXT_RE = /[\u4e00-\u9fff\u3400-\u4dbf]/gu;
const MAX_VOCAB_SUGGESTIONS = 30;
const MAX_KANJI_SUGGESTIONS = 24;

export type OcrVocabSuggestion = {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  jlptLevel: string;
};

export type OcrKanjiSuggestion = {
  id: string;
  character: string;
  meaning: string;
  jlptLevel: string;
  readingsOn: string[];
  readingsKun: string[];
};

async function getNotebookItemIds(userId: string) {
  const mastery = await db.userMasteryItem.findMany({
    where: { userId },
    select: { itemId: true, itemType: true },
  });

  const vocabulary = new Set<string>();
  const kanji = new Set<string>();
  for (const row of mastery) {
    if (row.itemType === MasteryItemType.vocabulary) vocabulary.add(row.itemId);
    if (row.itemType === MasteryItemType.kanji) kanji.add(row.itemId);
  }
  return { vocabulary, kanji };
}

function extractKanjiCharacters(text: string): string[] {
  const matches = text.match(KANJI_IN_TEXT_RE);
  if (!matches) return [];
  return [...new Set(matches)];
}

async function findVocabularyInText(text: string): Promise<OcrVocabSuggestion[]> {
  const trimmed = text.trim();
  if (trimmed.length < 2) return [];

  const rows = await db.$queryRaw<
    Array<{
      id: string;
      word: string;
      reading: string | null;
      meaning: string;
      jlpt_level: string;
    }>
  >(Prisma.sql`
    SELECT id, word, reading, meaning, jlpt_level
    FROM vocabulary
    WHERE char_length(word) >= 2
      AND strpos(${trimmed}, word) > 0
    ORDER BY char_length(word) DESC
    LIMIT ${MAX_VOCAB_SUGGESTIONS * 2}
  `);

  return rows.map((r) => ({
    id: r.id,
    word: r.word,
    reading: r.reading,
    meaning: r.meaning,
    jlptLevel: r.jlpt_level,
  }));
}

export async function discoverNotInNotebook(userId: string, extractedText: string) {
  const text = extractedText.trim();
  if (!text) {
    return { suggested_vocabulary: [] as OcrVocabSuggestion[], suggested_kanji: [] as OcrKanjiSuggestion[] };
  }

  const notebook = await getNotebookItemIds(userId);

  const vocabCandidates = await findVocabularyInText(text);
  const suggested_vocabulary = vocabCandidates
    .filter((v) => !notebook.vocabulary.has(v.id))
    .slice(0, MAX_VOCAB_SUGGESTIONS);

  const kanjiChars = extractKanjiCharacters(text);
  const kanjiRows =
    kanjiChars.length > 0
      ? await db.kanji.findMany({
          where: { character: { in: kanjiChars } },
          select: {
            id: true,
            character: true,
            meaning: true,
            jlptLevel: true,
            readingsOn: true,
            readingsKun: true,
          },
          take: MAX_KANJI_SUGGESTIONS * 2,
        })
      : [];

  const suggested_kanji: OcrKanjiSuggestion[] = kanjiRows
    .filter((k) => !notebook.kanji.has(k.id))
    .slice(0, MAX_KANJI_SUGGESTIONS)
    .map((k) => ({
      id: k.id,
      character: k.character,
      meaning: k.meaning,
      jlptLevel: k.jlptLevel,
      readingsOn: k.readingsOn,
      readingsKun: k.readingsKun,
    }));

  return { suggested_vocabulary, suggested_kanji };
}

export async function addItemsToNotebook(
  userId: string,
  items: Array<{ itemId: string; itemType: 'vocabulary' | 'kanji' }>,
) {
  const unique = new Map<string, { itemId: string; itemType: 'vocabulary' | 'kanji' }>();
  for (const item of items) {
    if (!item.itemId || (item.itemType !== 'vocabulary' && item.itemType !== 'kanji')) continue;
    unique.set(`${item.itemType}:${item.itemId}`, item);
  }

  const list = [...unique.values()].slice(0, 50);
  const results = await Promise.all(
    list.map((item) =>
      db.userMasteryItem.upsert({
        where: {
          userId_itemId_itemType: {
            userId,
            itemId: item.itemId,
            itemType: item.itemType as MasteryItemType,
          },
        },
        create: {
          userId,
          itemId: item.itemId,
          itemType: item.itemType as MasteryItemType,
          isLearned: false,
          isFavorite: false,
        },
        update: {},
      }),
    ),
  );

  return { added: results.length };
}
