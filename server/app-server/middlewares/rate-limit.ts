import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';

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

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === 'production' ? 1000 : 10_000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === 'GET' && PUBLIC_KANJI_MEMORY_IMAGE.test(req.path),
  handler: rateLimitJsonHandler,
});
