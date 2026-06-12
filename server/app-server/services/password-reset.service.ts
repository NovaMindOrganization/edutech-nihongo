import { randomBytes } from 'node:crypto';

import bcrypt from 'bcrypt';

import { redis } from '../config/redis.js';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { revokeAllUserRefreshTokens } from './session.service.js';
import { AppError } from '../utils/app-error.js';

const TOKEN_TTL_SECONDS = 60 * 60;
const devTokenStore = new Map<string, { userId: string; exp: number }>();

function tokenKey(token: string) {
  return `pwd-reset:${token}`;
}

async function storeToken(token: string, userId: string) {
  await redis.setex(tokenKey(token), TOKEN_TTL_SECONDS, userId);
  devTokenStore.set(token, {
    userId,
    exp: Date.now() + TOKEN_TTL_SECONDS * 1000,
  });
}

async function consumeToken(token: string): Promise<string | null> {
  const fromRedis = await redis.get(tokenKey(token));
  if (fromRedis) {
    await redis.del(tokenKey(token));
    devTokenStore.delete(token);
    return fromRedis;
  }
  const dev = devTokenStore.get(token);
  devTokenStore.delete(token);
  if (!dev || dev.exp < Date.now()) return null;
  return dev.userId;
}

export async function requestPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email: normalized } });

  const token = randomBytes(32).toString('hex');
  if (user?.passwordHash) {
    await storeToken(token, user.id);
    const resetUrl = `${env.corsOrigin.split(',')[0]?.trim() ?? 'http://localhost:5173'}/reset-password?token=${token}`;
    if (env.nodeEnv !== 'production') {
      console.log(`[password-reset] Dev reset link for ${normalized}: ${resetUrl}`);
    }
  }

  return {
    message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.',
    ...(env.nodeEnv !== 'production' && user
      ? { devResetUrl: `${env.corsOrigin.split(',')[0]?.trim() ?? 'http://localhost:5173'}/reset-password?token=${token}` }
      : {}),
  };
}

export async function resetPasswordWithToken(token: string, password: string) {
  if (password.length < 8) {
    throw new AppError('VALIDATION_ERROR', 'Mật khẩu tối thiểu 8 ký tự.', 422);
  }
  const userId = await consumeToken(token.trim());
  if (!userId) {
    throw new AppError('INVALID_TOKEN', 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', 400);
  }
  const hash = await bcrypt.hash(password, 12);
  await db.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  await revokeAllUserRefreshTokens(userId);
  return { ok: true };
}
