import type { Request, Response } from 'express';

import { env } from '../config/env.js';
import * as authService from '../services/auth.service.js';
import * as passwordResetService from '../services/password-reset.service.js';
import * as registrationOtpService from '../services/registration-otp.service.js';
import { asyncHandler } from '../utils/async-handler.js';

const REFRESH_COOKIE = 'refreshToken';
const isProd = env.nodeEnv === 'production';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}

function authPayload(result: Awaited<ReturnType<typeof authService.loginUser>>) {
  const { refreshToken, ...rest } = result;
  return rest;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser((req.validatedBody ?? req.body) as never);
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({ success: true, data: authPayload(result) });
});

export const sendRegisterOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = (req.validatedBody ?? req.body) as { email: string };
  const data = await registrationOtpService.sendRegistrationOtp(email);
  res.json({ success: true, data });
});

export const verifyRegisterOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = (req.validatedBody ?? req.body) as { email: string; otp: string };
  const data = await registrationOtpService.verifyRegistrationOtp(email, otp);
  res.json({ success: true, data });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser((req.validatedBody ?? req.body) as never);
  setRefreshCookie(res, result.refreshToken);
  res.json({ success: true, data: authPayload(result) });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!raw) {
    res.status(401).json({ success: false, error: { code: 'NO_REFRESH', message: 'Missing refresh token' } });
    return;
  }
  const result = await authService.refreshSession(raw);
  setRefreshCookie(res, result.refreshToken);
  res.json({ success: true, data: authPayload(result) });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (raw) await authService.revokeRefreshToken(raw);
  clearRefreshCookie(res);
  res.json({ success: true, data: null });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = (req.validatedBody ?? req.body) as { email: string };
  const data = await passwordResetService.requestPasswordReset(email);
  res.json({ success: true, data });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = (req.validatedBody ?? req.body) as {
    token: string;
    password: string;
  };
  const data = await passwordResetService.resetPasswordWithToken(token, password);
  res.json({ success: true, data });
});
