import bcrypt from 'bcrypt';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import {
  createRefreshTokenRaw,
  hashRefreshToken,
  signAccessToken,
} from '../utils/jwt.js';
import { consumeRegistrationVerificationToken } from './registration-otp.service.js';

const SALT_ROUNDS = 12;
const REFRESH_DAYS = 7;

function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_DAYS);
  return d;
}

async function issueSession(user: {
  id: string;
  email: string;
  role: import('@prisma/client').UserRole;
  displayName: string | null;
}) {
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshRaw = createRefreshTokenRaw();
  await db.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshRaw),
      expiresAt: refreshExpiresAt(),
    },
  });
  return { user: sanitizeUser(user), accessToken, refreshToken: refreshRaw };
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName?: string;
  emailVerificationToken: string;
}) {
  const email = input.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  await consumeRegistrationVerificationToken(email, input.emailVerificationToken);

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      displayName: input.displayName,
      role: 'student',
    },
  });

  return issueSession(user);
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await db.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user?.passwordHash) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  if (user.isBanned || user.isSuspended) {
    throw new AppError('Account disabled', 403, 'ACCOUNT_DISABLED');
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  return issueSession(user);
}

export async function refreshSession(refreshRaw: string) {
  const tokenHash = hashRefreshToken(refreshRaw);
  const stored = await db.refreshToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  if (!stored?.user || stored.user.isBanned || stored.user.isSuspended) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH');
  }

  await db.refreshToken.delete({ where: { id: stored.id } });
  return issueSession(stored.user);
}

export async function revokeRefreshToken(refreshRaw: string) {
  const tokenHash = hashRefreshToken(refreshRaw);
  await db.refreshToken.deleteMany({ where: { tokenHash } });
}

function sanitizeUser(user: {
  id: string;
  email: string;
  role: string;
  displayName: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
  };
}
