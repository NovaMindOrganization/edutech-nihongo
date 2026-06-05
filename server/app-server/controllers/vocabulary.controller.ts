import type { Request, Response } from 'express';

import * as vocabularyStudentService from '../services/vocabulary-student.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getLessonVocabulary = asyncHandler(async (req: Request, res: Response) => {
  const { source } = req.validatedQuery as { source: vocabularyStudentService.VocabSourceFilter };

  const data = await vocabularyStudentService.listLessonVocabularyWithProgress(
    req.user!.id,
    req.params.id,
    source,
  );
  res.json({ success: true, data });
});

export const patchVocabularyProgress = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as {
    vocabularyId: string;
    isStarred?: boolean;
    status?: 'learning' | 'mastered';
  };

  const data = await vocabularyStudentService.upsertVocabularyProgress(req.user!.id, body);
  res.json({ success: true, data });
});
