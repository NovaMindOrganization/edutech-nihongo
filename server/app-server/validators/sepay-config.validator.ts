import { z } from "zod";

export const sepayConfigSchema = z.object({
  authMode: z.enum(["api_key", "hmac", "none"]),
  apiKey: z.string().max(512).optional(),
  webhookSecret: z.string().max(512).optional(),
  accountNumber: z.string().min(1).max(32),
  accountName: z.string().min(1).max(120),
  bankName: z.string().min(1).max(80),
  bankBin: z.string().min(6).max(10),
  paymentCodePrefix: z.string().min(2).max(20),
  orderExpiryMinutes: z.string().regex(/^\d+$/),
});
