import { loadEnvFile } from "node:process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  loadEnvFile(join(__dirname, "../.env"));
} catch {
  // .env is optional when vars are injected by the host.
}

/** Central env accessors */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5434/app",
  minioEndpoint: process.env.MINIO_ENDPOINT ?? 'localhost:9002',
  minioAccessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
  minioSecretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
  jwtAccessExpires:
    process.env.JWT_ACCESS_EXPIRES ??
    (process.env.NODE_ENV === 'production' ? '15m' : '8h'),
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6380",
  aiServerUrl: process.env.AI_SERVER_URL ?? 'http://localhost:8000',
  sepaySecret: process.env.SEPAY_SECRET ?? '',
  appPublicUrl: process.env.APP_PUBLIC_URL ?? '',
  sepayAccountNumber: process.env.SEPAY_ACCOUNT_NUMBER ?? '',
  sepayAccountName: process.env.SEPAY_ACCOUNT_NAME ?? '',
  sepayBankName: process.env.SEPAY_BANK_NAME ?? 'Vietcombank',
  sepayBankBin: process.env.SEPAY_BANK_BIN ?? '970436',
  paymentCodePrefix: process.env.PAYMENT_CODE_PREFIX ?? 'NIHONGO',
  orderExpiryMinutes: Number(process.env.ORDER_EXPIRY_MINUTES ?? 30),
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpStartTls: process.env.SMTP_STARTTLS !== 'false',
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'NihongoCoach <no-reply@localhost>',
  registrationOtpTtlSeconds: Number(process.env.REGISTRATION_OTP_TTL_SECONDS ?? 600),
  registrationOtpVerifyTokenTtlSeconds: Number(
    process.env.REGISTRATION_OTP_VERIFY_TOKEN_TTL_SECONDS ?? 900,
  ),
  registrationOtpResendCooldownSeconds: Number(
    process.env.REGISTRATION_OTP_RESEND_COOLDOWN_SECONDS ?? 60,
  ),
  registrationOtpMaxAttempts: Number(process.env.REGISTRATION_OTP_MAX_ATTEMPTS ?? 5),
} as const;

const WEAK_JWT_SECRETS = new Set([
  'dev-access-secret-change-me',
  'dev-refresh-secret-change-me',
  'change-me-access-secret-min-32-chars',
  'change-me-refresh-secret-min-32-chars',
]);

function isWeakSecret(value: string) {
  return value.length < 32 || WEAK_JWT_SECRETS.has(value);
}

/** Fail fast in production when secrets are missing or still dev placeholders. */
export function assertProductionEnv() {
  if ((process.env.NODE_ENV ?? 'development') !== 'production') return;

  const accessSecret = process.env.JWT_ACCESS_SECRET?.trim() ?? '';
  const refreshSecret = process.env.JWT_REFRESH_SECRET?.trim() ?? '';

  const missing: string[] = [];
  if (!process.env.DATABASE_URL?.trim()) missing.push('DATABASE_URL');
  if (!accessSecret) missing.push('JWT_ACCESS_SECRET');
  if (!refreshSecret) missing.push('JWT_REFRESH_SECRET');
  if (!process.env.CORS_ORIGIN?.trim()) missing.push('CORS_ORIGIN');

  if (missing.length > 0) {
    throw new Error(
      `[env] Production requires: ${missing.join(', ')}. Copy server/app-server/.env.example and set real values.`,
    );
  }

  if (isWeakSecret(accessSecret) || isWeakSecret(refreshSecret)) {
    throw new Error(
      '[env] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be unique random strings (≥32 chars) in production.',
    );
  }
}
