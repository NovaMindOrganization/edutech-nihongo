import { z } from 'zod';

const dialogueLineSchema = z.object({
  speaker: z.string().max(20),
  text: z.string().min(1).max(2000),
  translation: z.string().max(2000).optional(),
});

const quizQuestionSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(300)).min(2).max(6),
  answer: z.number().int().min(0),
});

export const studySetVocabContentSchema = z.object({
  word: z.string().min(1).max(100),
  reading: z.string().max(100).optional(),
  meaning: z.string().min(1).max(500),
  meaningEn: z.string().max(500).optional(),
  exampleSentence: z.string().max(500).optional(),
  exampleTranslation: z.string().max(500).optional(),
  audioUrl: z.string().max(2000).optional(),
});

export const studySetGrammarContentSchema = z.object({
  title: z.string().min(1).max(200),
  pattern: z.string().min(1).max(200),
  meaningVi: z.string().min(1).max(500),
  usage: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  examples: z
    .array(
      z.object({
        jp: z.string().min(1).max(500),
        vi: z.string().min(1).max(500),
        reading: z.string().max(500).optional(),
      }),
    )
    .default([]),
});

export const studySetKanjiContentSchema = z.object({
  character: z.string().min(1).max(10),
  meaning: z.string().min(1).max(500),
  readingsOn: z.array(z.string().max(50)).default([]),
  readingsKun: z.array(z.string().max(50)).default([]),
  hanViet: z.string().max(100).optional(),
  strokeCount: z.number().int().min(1).max(50).optional(),
  memoryTip: z.string().max(500).optional(),
  examples: z
    .array(
      z.object({
        word: z.string().min(1).max(200),
        reading: z.string().max(200).optional(),
        meaning: z.string().min(1).max(200),
      }),
    )
    .default([]),
});

export const studySetListeningContentSchema = z.object({
  title: z.string().min(1).max(200),
  audioUrl: z.string().min(1).max(2000),
  transcript: z.string().max(5000).optional(),
  questions: z.array(quizQuestionSchema).optional(),
});

export const studySetSpeakingContentSchema = z.object({
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(2000),
  sampleDialogue: z.array(dialogueLineSchema).optional(),
  audioUrl: z.string().max(2000).optional(),
});

export const studySetItemInputSchema = z.discriminatedUnion('contentType', [
  z.object({
    contentType: z.literal('vocabulary'),
    content: studySetVocabContentSchema,
  }),
  z.object({
    contentType: z.literal('grammar'),
    content: studySetGrammarContentSchema,
  }),
  z.object({
    contentType: z.literal('kanji'),
    content: studySetKanjiContentSchema,
  }),
  z.object({
    contentType: z.literal('listening'),
    content: studySetListeningContentSchema,
  }),
  z.object({
    contentType: z.literal('speaking'),
    content: studySetSpeakingContentSchema,
  }),
]);

export const studySetItemUpdateSchema = studySetItemInputSchema.and(
  z.object({ id: z.string().uuid().optional() }),
);

export const studySetCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  coverImageUrl: z.string().max(2000).optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  isPublic: z.boolean().optional(),
  items: z.array(studySetItemInputSchema).max(200).optional(),
});

export const studySetUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  coverImageUrl: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  isPublic: z.boolean().optional(),
  items: z.array(studySetItemUpdateSchema).max(200).optional(),
});

export const studySetListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  search: z.string().max(200).optional(),
  contentType: z
    .enum(['vocabulary', 'grammar', 'kanji', 'listening', 'speaking'])
    .optional(),
});

export const QUIZ_QUESTION_COUNT_MIN = 3;
export const QUIZ_QUESTION_COUNT_MAX = 30;

export const studySetModerateSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    moderationNote: z.string().max(1000).optional(),
    quizQuestionCount: z.number().int().min(QUIZ_QUESTION_COUNT_MIN).max(QUIZ_QUESTION_COUNT_MAX).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'approved' && data.quizQuestionCount == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'quizQuestionCount is required when approving',
        path: ['quizQuestionCount'],
      });
    }
  });

export const studySetAddItemsSchema = z.object({
  items: z.array(studySetItemInputSchema).min(1).max(50),
});

export const studySetAdminListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
  search: z.string().max(200).optional(),
});

export const studySetQuizQuestionSchema = z.object({
  id: z.string().min(1).max(50),
  prompt: z.string().min(1).max(1000),
  choices: z.array(z.string().min(1).max(500)).min(2).max(6),
  answer: z.number().int().min(0),
  explanation: z.string().max(1000).optional(),
});

export const studySetQuizSchema = z.object({
  questions: z.array(studySetQuizQuestionSchema).max(QUIZ_QUESTION_COUNT_MAX),
  generatedAt: z.string().optional(),
  questionCount: z.number().int().min(1).max(QUIZ_QUESTION_COUNT_MAX).optional(),
});

export type StudySetQuizPayload = z.infer<typeof studySetQuizSchema>;

export function parseStudySetItem(
  item: z.infer<typeof studySetItemInputSchema>,
) {
  return studySetItemInputSchema.parse(item);
}

export function normalizeQuizPayload(raw: StudySetQuizPayload): StudySetQuizPayload {
  const questions = raw.questions
    .map((q, i) => {
      const choices = [...new Set(q.choices.map((c) => c.trim()).filter(Boolean))];
      if (choices.length < 2 || !q.prompt.trim()) return null;
      while (choices.length < 4) {
        choices.push(`Phương án ${choices.length + 1}`);
      }
      const trimmed = choices.slice(0, 4);
      let answer = q.answer;
      if (answer < 0 || answer >= trimmed.length) answer = 0;
      return {
        id: q.id || `q${i + 1}`,
        prompt: q.prompt.trim(),
        choices: trimmed,
        answer,
        explanation: q.explanation?.trim(),
      };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  return { questions, generatedAt: raw.generatedAt };
}
