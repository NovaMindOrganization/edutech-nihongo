import { db } from '../config/db.js';
import { vocabMiniTestPrompt } from '../utils/minitest-generator.js';
import { isLongJapanesePhrase } from '../utils/minitest-options.js';

type ErrorRow = {
  id: string;
  source: string;
  questionText: string | null;
  originalText: string | null;
  correction: string | null;
  lessonId: string | null;
  createdAt: Date;
  lesson: { id: string; title: string; orderIndex: number } | null;
};

async function inferQuestionText(row: Pick<ErrorRow, 'source' | 'lessonId' | 'correction' | 'originalText'>): Promise<string | null> {
  const correction = row.correction?.trim();
  if (!correction || !row.lessonId) return null;

  if (row.source === 'mini_test' || row.source === 'review') {
    const dbQuestion = await db.lessonQuestion.findFirst({
      where: {
        lessonId: row.lessonId,
        question: { correctAnswer: correction },
      },
      select: { question: { select: { questionText: true } } },
    });
    if (dbQuestion?.question.questionText) {
      return dbQuestion.question.questionText;
    }

    const vocabRows = await db.vocabulary.findMany({
      where: { lessonId: row.lessonId },
      select: { word: true, reading: true, meaning: true },
    });

    const vocabMatch = vocabRows.find(
      (v) => v.meaning.trim().toLowerCase() === correction.toLowerCase(),
    );
    if (vocabMatch) {
      const prompt = vocabMiniTestPrompt(vocabMatch);
      if (isLongJapanesePhrase(prompt)) {
        return `Từ nào dưới đây có nghĩa là "${vocabMatch.meaning.trim()}"?`;
      }
      return `「${prompt}」の意味は？`;
    }

    const phraseMatch = vocabRows.find((v) => {
      const prompt = vocabMiniTestPrompt(v);
      return prompt === correction || v.word.trim() === correction;
    });
    if (phraseMatch) {
      return `Từ nào dưới đây có nghĩa là "${phraseMatch.meaning.trim()}"?`;
    }

    const kanjiLink = await db.lessonKanji.findFirst({
      where: {
        lessonId: row.lessonId,
        kanji: { meaning: { equals: correction, mode: 'insensitive' } },
      },
      include: { kanji: { select: { character: true } } },
    });
    if (kanjiLink) {
      return `「${kanjiLink.kanji.character}」の意味は？`;
    }
  }

  if (row.source === 'ai_speaking' || row.source === 'lesson_speaking') {
    return row.originalText?.trim() || null;
  }

  return null;
}

export async function listUserMistakes(userId: string, limit = 30) {
  const errors = await db.userErrorLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 100),
    include: {
      lesson: { select: { id: true, title: true, orderIndex: true } },
    },
  });

  return Promise.all(
    errors.map(async (e) => {
      const stored = e.questionText?.trim() || null;
      const questionText = stored ?? (await inferQuestionText(e));

      return {
        id: e.id,
        source: e.source,
        questionText,
        userAnswer: e.originalText,
        correctAnswer: e.correction,
        createdAt: e.createdAt,
        lesson: e.lesson,
      };
    }),
  );
}
