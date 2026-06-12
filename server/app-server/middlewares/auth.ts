import type { NextFunction, Request, Response } from 'express';
import { errors, jwtVerify } from 'jose';

import { env } from '../config/env.js';
import { assertActiveAuthUser, loadActiveAuthUser } from '../services/session.service.js';
import { AppError } from '../utils/app-error.js';
import type { UserRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      validatedQuery?: unknown;
      validatedBody?: unknown;
    }
  }
}

const accessSecret = new TextEncoder().encode(env.jwtAccessSecret);

async function userFromAccessToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, accessSecret);
  const userId = String(payload.sub);
  return assertActiveAuthUser(userId);
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  try {
    const token = header.slice(7);
    req.user = await userFromAccessToken(token);
    return next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    if (err instanceof errors.JWTExpired) {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const token = header.slice(7);
    const { payload } = await jwtVerify(token, accessSecret);
    const user = await loadActiveAuthUser(String(payload.sub));
    if (user) req.user = user;
  } catch {
    /* guest */
  }
  return next();
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }
    return next();
  };
}
