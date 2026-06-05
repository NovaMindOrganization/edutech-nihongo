import { z } from 'zod';

export const lessonVocabularyQuerySchema = z.object({
  source: z.enum(['all', 'starred', 'unmastered', 'mastered']).optional().default('all'),
});

export const vocabularyProgressPatchSchema = z
  .object({
    vocabularyId: z.string().uuid(),
    isStarred: z.boolean().optional(),
    status: z.enum(['learning', 'mastered']).optional(),
  })
  .refine((body) => body.isStarred !== undefined || body.status !== undefined, {
    message: 'At least one of isStarred or status is required',
  });
