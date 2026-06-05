import { z } from 'zod';

export const pricingPlanSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().min(0),
  durationDays: z.number().int().min(1).optional().nullable(),
  features: z.array(z.string().min(1).max(200)).default([]),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  courseIds: z.array(z.string().uuid()).default([]),
});

export const createOrderSchema = z.object({
  planId: z.string().uuid(),
});

export type PricingPlanInput = z.infer<typeof pricingPlanSchema>;
