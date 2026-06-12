import type { UserRole } from '@prisma/client';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export type ActiveAuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

/** Revoke all refresh tokens — forces re-login; access token still checked against DB on each request. */
export async function revokeAllUserRefreshTokens(userId: string) {
  await db.refreshToken.deleteMany({ where: { userId } });
}

export async function assertActiveAuthUser(userId: string): Promise<ActiveAuthUser> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isBanned: true,
      isSuspended: true,
    },
  });

  if (!user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  if (user.isBanned || user.isSuspended) {
    throw new AppError('Account disabled', 403, 'ACCOUNT_DISABLED');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

/** Returns null when user missing or disabled (for optional auth / WebSocket). */
export async function loadActiveAuthUser(userId: string): Promise<ActiveAuthUser | null> {
  try {
    return await assertActiveAuthUser(userId);
  } catch (err) {
    if (err instanceof AppError) return null;
    throw err;
  }
}
