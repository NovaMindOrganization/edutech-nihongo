import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (env.nodeEnv === 'development') {
    console.error(err);
  }

  const message =
    env.nodeEnv === 'development' && err instanceof Error
      ? err.message
      : 'An unexpected error occurred';

  const code =
    err instanceof Error && err.name === 'PrismaClientInitializationError'
      ? 'DATABASE_UNAVAILABLE'
      : 'INTERNAL_ERROR';

  res.status(500).json({
    success: false,
    error: { code, message },
  });
}
