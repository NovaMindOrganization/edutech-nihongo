import { incrRateLimit } from '../config/redis.js';
import { AppError } from '../utils/app-error.js';
import { getConfigValue } from './config.service.js';

/** Admin-configurable keys (system_config table). 0 = unlimited. */
export const USAGE_LIMIT_KEYS = {
  apiRateLimitMax: 'api_rate_limit_max',
  guestDictRateLimit: 'guest_dict_rate_limit',
  aiSpeakingDailyLimit: 'ai_speaking_daily_limit',
  ocrDailyLimit: 'ocr_daily_limit',
  speechTtsDailyLimit: 'speech_tts_daily_limit',
  speechSttDailyLimit: 'speech_stt_daily_limit',
  pronunciationDailyLimit: 'pronunciation_daily_limit',
  communityTranslateDailyLimit: 'community_translate_daily_limit',
  communityEvaluateDailyLimit: 'community_evaluate_daily_limit',
  studySetQuizDailyLimit: 'study_set_quiz_daily_limit',
  authLoginLimitPerIp: 'auth_login_limit_per_ip',
  authOtpSendLimitPerIp: 'auth_otp_send_limit_per_ip',
  authForgotPasswordLimitPerIp: 'auth_forgot_password_limit_per_ip',
  registrationOtpResendCooldownSeconds: 'registration_otp_resend_cooldown_seconds',
} as const;

export const USAGE_LIMIT_DEFAULTS: Record<string, string> = {
  [USAGE_LIMIT_KEYS.apiRateLimitMax]: '300',
  [USAGE_LIMIT_KEYS.guestDictRateLimit]: '30',
  [USAGE_LIMIT_KEYS.aiSpeakingDailyLimit]: '20',
  [USAGE_LIMIT_KEYS.ocrDailyLimit]: '15',
  [USAGE_LIMIT_KEYS.speechTtsDailyLimit]: '100',
  [USAGE_LIMIT_KEYS.speechSttDailyLimit]: '50',
  [USAGE_LIMIT_KEYS.pronunciationDailyLimit]: '30',
  [USAGE_LIMIT_KEYS.communityTranslateDailyLimit]: '40',
  [USAGE_LIMIT_KEYS.communityEvaluateDailyLimit]: '10',
  [USAGE_LIMIT_KEYS.studySetQuizDailyLimit]: '5',
  [USAGE_LIMIT_KEYS.authLoginLimitPerIp]: '20',
  [USAGE_LIMIT_KEYS.authOtpSendLimitPerIp]: '10',
  [USAGE_LIMIT_KEYS.authForgotPasswordLimitPerIp]: '5',
  [USAGE_LIMIT_KEYS.registrationOtpResendCooldownSeconds]: '120',
};

export const USAGE_LIMIT_SEED_META: Array<{
  key: string;
  description: string;
}> = [
  {
    key: USAGE_LIMIT_KEYS.apiRateLimitMax,
    description: 'Max API requests per 15 minutes per IP (production)',
  },
  {
    key: USAGE_LIMIT_KEYS.guestDictRateLimit,
    description: 'Dictionary searches per hour for guests (per IP)',
  },
  {
    key: USAGE_LIMIT_KEYS.aiSpeakingDailyLimit,
    description: 'AI speaking messages per day per user',
  },
  {
    key: USAGE_LIMIT_KEYS.ocrDailyLimit,
    description: 'OCR analyze/quiz/grade actions per day per user',
  },
  {
    key: USAGE_LIMIT_KEYS.speechTtsDailyLimit,
    description: 'Text-to-speech requests per day per user',
  },
  {
    key: USAGE_LIMIT_KEYS.speechSttDailyLimit,
    description: 'Speech-to-text requests per day per user',
  },
  {
    key: USAGE_LIMIT_KEYS.pronunciationDailyLimit,
    description: 'Pronunciation assessments per day per user',
  },
  {
    key: USAGE_LIMIT_KEYS.communityTranslateDailyLimit,
    description: 'Community call translations per day per user',
  },
  {
    key: USAGE_LIMIT_KEYS.communityEvaluateDailyLimit,
    description: 'WebRTC speaking evaluations per day per user',
  },
  {
    key: USAGE_LIMIT_KEYS.studySetQuizDailyLimit,
    description: 'AI study-set quiz generations per day per owner',
  },
  {
    key: USAGE_LIMIT_KEYS.authLoginLimitPerIp,
    description: 'Login attempts per 15 minutes per IP',
  },
  {
    key: USAGE_LIMIT_KEYS.authOtpSendLimitPerIp,
    description: 'Registration OTP send requests per hour per IP',
  },
  {
    key: USAGE_LIMIT_KEYS.authForgotPasswordLimitPerIp,
    description: 'Forgot-password requests per hour per IP',
  },
  {
    key: USAGE_LIMIT_KEYS.registrationOtpResendCooldownSeconds,
    description: 'Seconds before the same email can request another OTP',
  },
];

function todayKeyUtc() {
  return new Date().toISOString().slice(0, 10);
}

export async function getUsageLimit(key: string, fallback?: string): Promise<number> {
  const raw = await getConfigValue(key, fallback ?? USAGE_LIMIT_DEFAULTS[key] ?? '0');
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

export async function checkWindowLimit(
  redisKey: string,
  configKey: string,
  windowSeconds: number,
): Promise<boolean> {
  const limit = await getUsageLimit(configKey);
  if (limit === 0) return true;
  return incrRateLimit(redisKey, limit, windowSeconds);
}

export async function checkDailyUserLimit(
  userId: string,
  configKey: string,
  scope: string,
): Promise<boolean> {
  const limit = await getUsageLimit(configKey);
  if (limit === 0) return true;
  const key = `nihongocoach:daily:${scope}:${userId}:${todayKeyUtc()}`;
  return incrRateLimit(key, limit, 86_400);
}

export async function assertDailyUserLimit(
  userId: string,
  configKey: string,
  scope: string,
  message = 'Đã đạt giới hạn sử dụng trong ngày. Vui lòng thử lại vào ngày mai.',
) {
  const ok = await checkDailyUserLimit(userId, configKey, scope);
  if (!ok) {
    throw new AppError(message, 429, 'DAILY_LIMIT_EXCEEDED');
  }
}

export async function assertAuthIpLimit(
  ip: string,
  configKey: string,
  scope: string,
  windowSeconds: number,
  message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
) {
  const safeIp = ip.trim() || 'unknown';
  const redisKey = `nihongocoach:auth:${scope}:${safeIp}`;
  const ok = await checkWindowLimit(redisKey, configKey, windowSeconds);
  if (!ok) {
    throw new AppError(message, 429, 'RATE_LIMITED');
  }
}

export async function getRegistrationOtpResendCooldownSeconds(
  envFallbackSeconds: number,
): Promise<number> {
  const fromConfig = await getUsageLimit(
    USAGE_LIMIT_KEYS.registrationOtpResendCooldownSeconds,
    String(envFallbackSeconds),
  );
  return fromConfig > 0 ? fromConfig : envFallbackSeconds;
}
