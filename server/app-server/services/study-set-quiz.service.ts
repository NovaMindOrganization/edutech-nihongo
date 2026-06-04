import { db } from '../config/db.js';
import { generateStudySetQuizViaAi } from './ai-client.service.js';
import {
  normalizeQuizPayload,
  QUIZ_QUESTION_COUNT_MAX,
  studySetQuizSchema,
  type StudySetQuizPayload,
} from '../validators/study-set.validator.js';

const QUIZABLE_TYPES = new Set(['vocabulary', 'grammar', 'kanji', 'listening', 'speaking']);

export function parseStoredQuiz(raw: unknown): StudySetQuizPayload | null {
  const parsed = studySetQuizSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function generateAndStoreStudySetQuiz(studySetId: string): Promise<StudySetQuizPayload | null> {
  const set = await db.studySet.findUnique({
    where: { id: studySetId },
    include: {
      items: { orderBy: { orderIndex: 'asc' } },
    },
  });
  if (!set) return null;

  const quizableItems = set.items.filter((it) => QUIZABLE_TYPES.has(it.contentType));
  if (quizableItems.length < 1) {
    await db.studySet.update({
      where: { id: studySetId },
      data: { quiz: { questions: [] }, quizGeneratedAt: new Date() },
    });
    return { questions: [], generatedAt: new Date().toISOString() };
  }

  const targetCount = Math.min(
    QUIZ_QUESTION_COUNT_MAX,
    Math.max(1, set.quizQuestionCount ?? quizableItems.length),
  );

  try {
    const aiResult = await generateStudySetQuizViaAi({
      title: set.title,
      description: set.description,
      questionCount: targetCount,
      items: quizableItems.map((it) => ({
        contentType: it.contentType,
        content: it.content as Record<string, unknown>,
      })),
    });

    if (aiResult.error || !aiResult.questions?.length) {
      console.warn('[study-set-quiz] no questions', studySetId, aiResult.error);
      return null;
    }

    const payload = normalizeQuizPayload({
      questions: aiResult.questions.slice(0, targetCount).map((q, i) => ({
        id: q.id || `q${i + 1}`,
        prompt: q.prompt,
        choices: q.choices,
        answer: q.answer,
        explanation: q.explanation ?? undefined,
      })),
      generatedAt: new Date().toISOString(),
      questionCount: targetCount,
    });

    if (!payload.questions.length) return null;

    const validated = studySetQuizSchema.parse(payload);
    await db.studySet.update({
      where: { id: studySetId },
      data: {
        quiz: validated,
        quizGeneratedAt: new Date(),
      },
    });
    return validated;
  } catch (err) {
    console.error('[study-set-quiz] failed', studySetId, err);
    return null;
  }
}
