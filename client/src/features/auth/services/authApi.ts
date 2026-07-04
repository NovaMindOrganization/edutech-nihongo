import { apiFetch, getAccessToken } from '@/services/httpClient';

import type { AuthUser } from '../store/authStore';

export async function login(email: string, password: string) {
  return apiFetch<{ user: AuthUser; accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

type RegisterInput = {
  email: string;
  password: string;
  displayName?: string;
  emailVerificationToken: string;
};

type RegisterOtpSendResult = {
  message: string;
  expiresInSeconds: number;
  resendCooldownSeconds: number;
  emailSent: boolean;
  devOtp?: string;
};

type RegisterOtpVerifyResult = {
  verified: true;
  email: string;
  emailVerificationToken: string;
  expiresInSeconds: number;
};

export async function sendRegisterOtp(email: string) {
  return apiFetch<RegisterOtpSendResult>('/auth/register/otp/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyRegisterOtp(email: string, otp: string) {
  return apiFetch<RegisterOtpVerifyResult>('/auth/register/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

export async function register(input: RegisterInput) {
  return apiFetch<{ user: AuthUser; accessToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchMe() {
  const data = await apiFetch<{ user: AuthUser }>('/auth/me');
  return { user: data.user, accessToken: getAccessToken() };
}

export async function logoutApi() {
  return apiFetch<null>('/auth/logout', { method: 'POST' });
}

export async function forgotPassword(email: string) {
  return apiFetch<{ message: string; devResetUrl?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return apiFetch<{ ok: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}
