import type { NextFunction, Request, Response } from "express";
import { z, type ZodSchema } from "zod";

import { AppError } from "../utils/app-error.js";

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError("Validation failed", 422, "VALIDATION_ERROR"));
    }
    req.validatedBody = result.data;
    return next();
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new AppError("Validation failed", 422, "VALIDATION_ERROR"));
    }
    req.validatedQuery = result.data;
    return next();
  };
}

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  jlptLevel: z.string().optional(),
  topic: z.string().optional(),
  courseId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  lesson: z.coerce.number().int().min(1).optional(),
  questionType: z.string().max(50).optional(),
});

export const usersListQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: z.enum(["student", "instructor", "admin"]).optional(),
  q: z.string().max(200).optional(),
  status: z.enum(["active", "banned", "suspended"]).optional(),
});

export const authRegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100).optional(),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const vocabSchema = z.object({
  word: z.string().min(1).max(100),
  reading: z.string().max(100).optional(),
  meaning: z.string().min(1),
  meaningEn: z.string().optional(),
  jlptLevel: z.string().min(2).max(5),
  topic: z.string().max(100).optional(),
  partOfSpeech: z.string().max(50).optional(),
  courseId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
});

export const grammarSchema = z.object({
  pattern: z.string().min(1).max(200),
  meaning: z.string().min(1),
  meaningEn: z.string().optional(),
  structure: z.string().optional(),
  grammarType: z.string().optional(),
  usageNote: z.string().optional(),
  jlptLevel: z.string().min(2).max(5),
  sourceLesson: z.number().int().optional(),
  exampleSentences: z.unknown().optional(),
});

export const courseSchema = z.object({
  title: z.string().min(1).max(255),
  jlptLevel: z.string().min(2).max(5),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const lessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(255),
  orderIndex: z.number().int().min(1),
  passThreshold: z.number().int().min(0).max(100).optional(),
  isBonus: z.boolean().optional(),
  speakingPrompt: z.string().max(2000).optional().nullable(),
});

export const conversationSchema = z.object({
  title: z.string().max(255).optional(),
  dialogue: z.array(
    z.object({
      speaker: z.string(),
      text: z.string(),
      reading: z.string().optional(),
      translation: z.string().optional(),
    }),
  ),
  audioUrl: z.string().url().optional(),
  jlptLevel: z.string().optional(),
});

export const reviewGenerateSchema = z.object({
  mode: z.enum(["random", "weakness", "flashcard"]).optional(),
  count: z.number().int().min(1).max(50).optional(),
  type: z.enum(["kanji", "vocabulary", "grammar", "mixed"]).optional(),
});

export const assignIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(0),
});

export const questionSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.string().min(1).max(50),
  options: z.unknown().optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().optional(),
  jlptLevel: z.string().optional(),
  questionCategory: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
});

export const kanjiSchema = z.object({
  character: z.string().min(1).max(10),
  hanVietPronunciation: z.string().max(100).optional(),
  meaning: z.string().min(1),
  memoryTip: z.string().max(500).optional(),
  memoryImageUrl: z.string().min(1).max(2000).optional(),
  jlptLevel: z.string().min(2).max(5),
  readingsOn: z.array(z.string()).optional(),
  readingsKun: z.array(z.string()).optional(),
  strokeCount: z.number().int().optional(),
  radical: z.string().optional(),
  examples: z
    .array(
      z.object({
        word: z.string().min(1).max(200),
        reading: z.string().max(200).optional(),
        meaning: z.string().min(1).max(200),
      }),
    )
    .optional(),
});

export const radicalSchema = z.object({
  radicalIndex: z.number().int().min(1).max(214).optional(),
  character: z.string().min(1).max(10),
  sinoVietnamese: z.string().min(1).max(100),
  meaning: z.string().min(1).max(255),
  strokeCount: z.number().int().min(1),
});
