import { z } from 'zod';

export const feedbackCategorySchema = z.enum([
  'lesson_content',
  'system_bug',
  'payment_account',
  'feature_request',
  'other',
]);

export const feedbackStatusSchema = z.enum([
  'pending',
  'in_progress',
  'resolved',
  'rejected',
  'closed',
]);

export const createFeedbackSchema = z.object({
  category: feedbackCategorySchema,
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  courseId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  pageUrl: z.string().url().max(500).optional(),
});

export const feedbackListQuerySchema = z.object({
  status: feedbackStatusSchema.optional(),
  category: feedbackCategorySchema.optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const addFeedbackMessageSchema = z.object({
  body: z.string().min(1).max(5000),
  isInternal: z.boolean().optional(),
});

export const updateFeedbackStatusSchema = z.object({
  status: feedbackStatusSchema,
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type FeedbackListQuery = z.infer<typeof feedbackListQuerySchema>;
