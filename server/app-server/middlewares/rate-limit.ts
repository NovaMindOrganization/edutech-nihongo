import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';
import {
  getUsageLimit,
  USAGE_LIMIT_KEYS,
} from '../services/usage-limit.service.js';

/** GET ảnh memorics kanji — tương tự static asset, không tính vào quota chung. */
const PUBLIC_KANJI_MEMORY_IMAGE =
  /^\/api\/public\/kanji\/[^/]+\/memory-image$/;

function rateLimitJsonHandler(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
    },
  });
}

async function resolveApiRateLimitMax(): Promise<number> {
  if (env.nodeEnv !== 'production') return 10_000;
  const configured = await getUsageLimit(USAGE_LIMIT_KEYS.apiRateLimitMax);
  return configured > 0 ? configured : 300;
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: async () => resolveApiRateLimitMax(),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === 'GET' && PUBLIC_KANJI_MEMORY_IMAGE.test(req.path),
  handler: rateLimitJsonHandler,
});
