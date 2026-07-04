import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { AppError } from '../utils/app-error.js';
import { sendMail } from './email.service.js';

type OtpRecord = {
  otpHash: string;
  expiresAt: number;
  attempts: number;
};

type VerificationRecord = {
  email: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();
const verificationStore = new Map<string, VerificationRecord>();
const cooldownStore = new Map<string, number>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function otpKey(email: string) {
  return `auth:register-otp:${email}`;
}

function verifyTokenKey(tokenHash: string) {
  return `auth:register-otp-token:${tokenHash}`;
}

function cooldownKey(email: string) {
  return `auth:register-otp-cooldown:${email}`;
}

function hashOtp(email: string, otp: string) {
  return sha256(`${email}:${otp}`);
}

function safeEqualHex(a: string, b: string) {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}

function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

async function storeOtp(email: string, otp: string) {
  const ttl = env.registrationOtpTtlSeconds;
  const record: OtpRecord = {
    otpHash: hashOtp(email, otp),
    expiresAt: Date.now() + ttl * 1000,
    attempts: 0,
  };
  await redis.setex(otpKey(email), ttl, JSON.stringify(record));
  otpStore.set(email, record);
}

async function getOtp(email: string): Promise<OtpRecord | null> {
  const raw = await redis.get(otpKey(email));
  const fromRedis = raw ? (JSON.parse(raw) as OtpRecord) : null;
  const record = fromRedis ?? otpStore.get(email) ?? null;
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    await deleteOtp(email);
    return null;
  }
  return record;
}

async function saveOtp(email: string, record: OtpRecord) {
  const ttl = Math.max(1, Math.ceil((record.expiresAt - Date.now()) / 1000));
  await redis.setex(otpKey(email), ttl, JSON.stringify(record));
  otpStore.set(email, record);
}

async function deleteOtp(email: string) {
  await redis.del(otpKey(email));
  otpStore.delete(email);
}

async function ensureCanSend(email: string) {
  const memoryUntil = cooldownStore.get(email) ?? 0;
  if (memoryUntil > Date.now()) {
    const remaining = Math.ceil((memoryUntil - Date.now()) / 1000);
    throw new AppError(`Please wait ${remaining}s before requesting another OTP`, 429, 'OTP_COOLDOWN');
  }

  const redisCoolingDown = await redis.get(cooldownKey(email));
  if (redisCoolingDown) {
    throw new AppError('Please wait before requesting another OTP', 429, 'OTP_COOLDOWN');
  }
}

async function setCooldown(email: string) {
  const ttl = env.registrationOtpResendCooldownSeconds;
  await redis.setex(cooldownKey(email), ttl, '1');
  cooldownStore.set(email, Date.now() + ttl * 1000);
}

async function storeVerificationToken(email: string) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const ttl = env.registrationOtpVerifyTokenTtlSeconds;
  const record: VerificationRecord = {
    email,
    expiresAt: Date.now() + ttl * 1000,
  };
  await redis.setex(verifyTokenKey(tokenHash), ttl, email);
  verificationStore.set(tokenHash, record);
  return token;
}

async function getVerificationTokenEmail(token: string) {
  const tokenHash = sha256(token.trim());
  const fromRedis = await redis.get(verifyTokenKey(tokenHash));
  const memory = verificationStore.get(tokenHash) ?? null;
  if (memory && memory.expiresAt < Date.now()) {
    verificationStore.delete(tokenHash);
    await redis.del(verifyTokenKey(tokenHash));
    return null;
  }
  return fromRedis ?? memory?.email ?? null;
}

async function deleteVerificationToken(token: string) {
  const tokenHash = sha256(token.trim());
  await redis.del(verifyTokenKey(tokenHash));
  verificationStore.delete(tokenHash);
}

function registrationOtpEmail(otp: string) {
  const minutes = Math.max(1, Math.ceil(env.registrationOtpTtlSeconds / 60));
  return {
    subject: 'NihongoCoach registration OTP',
    text: [
      `Your registration OTP is: ${otp}`,
      '',
      `This code expires in ${minutes} minute(s).`,
      'If you did not request an account, please ignore this email.',
    ].join('\n'),
    html: [
      '<p>Your registration OTP is:</p>',
      `<p style="font-size:24px;font-weight:700;letter-spacing:4px">${otp}</p>`,
      `<p>This code expires in ${minutes} minute(s).</p>`,
      '<p>If you did not request an account, please ignore this email.</p>',
    ].join(''),
  };
}

export async function sendRegistrationOtp(email: string) {
  const normalized = normalizeEmail(email);
  const existing = await db.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  await ensureCanSend(normalized);

  const otp = generateOtp();
  await storeOtp(normalized, otp);
  await setCooldown(normalized);

  const emailBody = registrationOtpEmail(otp);
  const sendResult = await sendMail({
    to: normalized,
    ...emailBody,
  });

  if (env.nodeEnv !== 'production') {
    console.log(`[registration-otp] ${normalized}: ${otp}`);
  }

  return {
    message: 'Registration OTP has been sent.',
    expiresInSeconds: env.registrationOtpTtlSeconds,
    resendCooldownSeconds: env.registrationOtpResendCooldownSeconds,
    emailSent: sendResult.sent,
    ...(env.nodeEnv !== 'production' ? { devOtp: otp } : {}),
  };
}

export async function verifyRegistrationOtp(email: string, otp: string) {
  const normalized = normalizeEmail(email);
  const cleanOtp = otp.trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new AppError('OTP must be 6 digits', 422, 'VALIDATION_ERROR');
  }

  const existing = await db.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const record = await getOtp(normalized);
  if (!record) {
    throw new AppError('OTP is invalid or expired', 400, 'INVALID_OTP');
  }
  if (record.attempts >= env.registrationOtpMaxAttempts) {
    await deleteOtp(normalized);
    throw new AppError('OTP attempt limit exceeded', 400, 'OTP_ATTEMPTS_EXCEEDED');
  }

  const ok = safeEqualHex(record.otpHash, hashOtp(normalized, cleanOtp));
  if (!ok) {
    record.attempts += 1;
    if (record.attempts >= env.registrationOtpMaxAttempts) {
      await deleteOtp(normalized);
      throw new AppError('OTP attempt limit exceeded', 400, 'OTP_ATTEMPTS_EXCEEDED');
    }
    await saveOtp(normalized, record);
    throw new AppError('OTP is invalid or expired', 400, 'INVALID_OTP');
  }

  await deleteOtp(normalized);
  const emailVerificationToken = await storeVerificationToken(normalized);
  return {
    verified: true,
    email: normalized,
    emailVerificationToken,
    expiresInSeconds: env.registrationOtpVerifyTokenTtlSeconds,
  };
}

export async function consumeRegistrationVerificationToken(email: string, token: string) {
  const normalized = normalizeEmail(email);
  const verifiedEmail = await getVerificationTokenEmail(token);
  if (verifiedEmail !== normalized) {
    throw new AppError('Email has not been verified for registration', 400, 'EMAIL_NOT_VERIFIED');
  }
  await deleteVerificationToken(token);
}
