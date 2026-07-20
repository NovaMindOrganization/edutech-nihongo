import type { NextFunction, Request, Response } from 'express';

import {
  assertAuthIpLimit,
  USAGE_LIMIT_KEYS,
} from '../services/usage-limit.service.js';
import { AppError } from '../utils/app-error.js';

const WINDOW_15_MIN = 15 * 60;
const WINDOW_1_HOUR = 60 * 60;

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

async function runAuthLimit(
  req: Request,
  configKey: string,
  scope: string,
  windowSeconds: number,
  message: string,
) {
  await assertAuthIpLimit(clientIp(req), configKey, scope, windowSeconds, message);
}

export function authLoginRateLimit() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await runAuthLimit(
        req,
        USAGE_LIMIT_KEYS.authLoginLimitPerIp,
        'login',
        WINDOW_15_MIN,
        'Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.',
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authOtpSendRateLimit() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await runAuthLimit(
        req,
        USAGE_LIMIT_KEYS.authOtpSendLimitPerIp,
        'otp_send',
        WINDOW_1_HOUR,
        'Quá nhiều yêu cầu gửi OTP. Vui lòng thử lại sau.',
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authForgotPasswordRateLimit() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await runAuthLimit(
        req,
        USAGE_LIMIT_KEYS.authForgotPasswordLimitPerIp,
        'forgot_password',
        WINDOW_1_HOUR,
        'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.',
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}
