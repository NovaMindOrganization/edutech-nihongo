import { createHash, randomBytes } from 'node:crypto';

import { SignJWT, jwtVerify } from 'jose';

import { env } from '../config/env.js';
import type { UserRole } from '@prisma/client';

const accessSecret = new TextEncoder().encode(env.jwtAccessSecret);
const refreshSecret = new TextEncoder().encode(env.jwtRefreshSecret);

function parseExpiry(exp: string): string {
  return exp;
}

export async function signAccessToken(payload: {
  sub: string;
  email: string;
  role: UserRole;
}) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(parseExpiry(env.jwtAccessExpires))
    .sign(accessSecret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret);
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as UserRole,
  };
}

export function hashRefreshToken(raw: string) {
  return createHash('sha256').update(raw).digest('hex');
}

export function createRefreshTokenRaw() {
  return randomBytes(48).toString('base64url');
}

export async function signRefreshJwt(userId: string) {
  return new SignJWT({ typ: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(parseExpiry(env.jwtRefreshExpires))
    .sign(refreshSecret);
}

export async function verifyRefreshJwt(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret);
  return { sub: payload.sub as string };
}
