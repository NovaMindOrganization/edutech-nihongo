import { timingSafeEqual } from 'node:crypto';

import { env } from '../config/env.js';
import { getAllConfig, getConfigValue, setConfig } from './config.service.js';

export const SEPAY_CONFIG_KEYS = {
  authMode: 'sepay_auth_mode',
  apiKey: 'sepay_api_key',
  webhookSecret: 'sepay_webhook_secret',
  accountNumber: 'sepay_account_number',
  accountName: 'sepay_account_name',
  bankName: 'sepay_bank_name',
  bankBin: 'sepay_bank_bin',
  paymentCodePrefix: 'sepay_payment_code_prefix',
  orderExpiryMinutes: 'sepay_order_expiry_minutes',
} as const;

export type SepayAuthMode = 'api_key' | 'hmac' | 'none';

export type SepayRuntimeConfig = {
  authMode: SepayAuthMode;
  apiKey: string;
  webhookSecret: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankBin: string;
  paymentCodePrefix: string;
  orderExpiryMinutes: number;
  webhookUrl: string;
};

export type SepayAdminConfigView = {
  authMode: SepayAuthMode;
  apiKey: string;
  apiKeySet: boolean;
  apiKeyPreview: string | null;
  webhookSecret: string;
  webhookSecretSet: boolean;
  webhookSecretPreview: string | null;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankBin: string;
  paymentCodePrefix: string;
  orderExpiryMinutes: string;
  webhookUrl: string;
};

function maskSecret(value: string | null | undefined): string | null {
  if (!value || value.length < 8) return null;
  return `••••${value.slice(-6)}`;
}

function parseAuthMode(raw: string | undefined): SepayAuthMode {
  if (raw === 'hmac' || raw === 'none') return raw;
  return 'api_key';
}

export function getWebhookPublicUrl(): string {
  const base = (
    env.appPublicUrl ||
    process.env.APP_PUBLIC_URL ||
    env.corsOrigin.split(',')[0]?.trim() ||
    `http://localhost:${env.port}`
  ).replace(/\/$/, '');
  return `${base}/api/public/webhook/sepay`;
}

export async function getSepayRuntimeConfig(): Promise<SepayRuntimeConfig> {
  const authMode = parseAuthMode(await getConfigValue(SEPAY_CONFIG_KEYS.authMode, 'api_key'));
  const apiKeyDb = await getConfigValue(SEPAY_CONFIG_KEYS.apiKey, '');
  const secretDb = await getConfigValue(SEPAY_CONFIG_KEYS.webhookSecret, '');

  const orderExpiryRaw = await getConfigValue(
    SEPAY_CONFIG_KEYS.orderExpiryMinutes,
    String(env.orderExpiryMinutes),
  );
  const orderExpiryMinutes = Number(orderExpiryRaw);
  const expiryMinutes = Number.isFinite(orderExpiryMinutes) && orderExpiryMinutes > 0
    ? orderExpiryMinutes
    : env.orderExpiryMinutes;

  return {
    authMode,
    apiKey: apiKeyDb.trim() || (process.env.SEPAY_API_KEY ?? '').trim(),
    webhookSecret: secretDb.trim() || env.sepaySecret,
    accountNumber:
      (await getConfigValue(SEPAY_CONFIG_KEYS.accountNumber, env.sepayAccountNumber)).trim(),
    accountName:
      (await getConfigValue(SEPAY_CONFIG_KEYS.accountName, env.sepayAccountName)).trim(),
    bankName: (await getConfigValue(SEPAY_CONFIG_KEYS.bankName, env.sepayBankName)).trim(),
    bankBin: (await getConfigValue(SEPAY_CONFIG_KEYS.bankBin, env.sepayBankBin)).trim(),
    paymentCodePrefix: (
      await getConfigValue(SEPAY_CONFIG_KEYS.paymentCodePrefix, env.paymentCodePrefix)
    ).trim(),
    orderExpiryMinutes: expiryMinutes,
    webhookUrl: getWebhookPublicUrl(),
  };
}

export async function getSepayAdminConfig(): Promise<SepayAdminConfigView> {
  const configs = await getAllConfig();
  const apiKey = configs[SEPAY_CONFIG_KEYS.apiKey] ?? '';
  const webhookSecret = configs[SEPAY_CONFIG_KEYS.webhookSecret] ?? '';

  return {
    authMode: parseAuthMode(configs[SEPAY_CONFIG_KEYS.authMode]),
    apiKey: '',
    apiKeySet: Boolean(apiKey.trim()),
    apiKeyPreview: maskSecret(apiKey),
    webhookSecret: '',
    webhookSecretSet: Boolean(webhookSecret.trim()),
    webhookSecretPreview: maskSecret(webhookSecret),
    accountNumber: configs[SEPAY_CONFIG_KEYS.accountNumber] ?? env.sepayAccountNumber,
    accountName: configs[SEPAY_CONFIG_KEYS.accountName] ?? env.sepayAccountName,
    bankName: configs[SEPAY_CONFIG_KEYS.bankName] ?? env.sepayBankName,
    bankBin: configs[SEPAY_CONFIG_KEYS.bankBin] ?? env.sepayBankBin,
    paymentCodePrefix: configs[SEPAY_CONFIG_KEYS.paymentCodePrefix] ?? env.paymentCodePrefix,
    orderExpiryMinutes:
      configs[SEPAY_CONFIG_KEYS.orderExpiryMinutes] ?? String(env.orderExpiryMinutes),
    webhookUrl: getWebhookPublicUrl(),
  };
}

export async function saveSepayAdminConfig(body: {
  authMode: SepayAuthMode;
  apiKey?: string;
  webhookSecret?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankBin: string;
  paymentCodePrefix: string;
  orderExpiryMinutes: string;
}) {
  await setConfig(SEPAY_CONFIG_KEYS.authMode, body.authMode);
  await setConfig(SEPAY_CONFIG_KEYS.accountNumber, body.accountNumber.trim());
  await setConfig(SEPAY_CONFIG_KEYS.accountName, body.accountName.trim());
  await setConfig(SEPAY_CONFIG_KEYS.bankName, body.bankName.trim());
  await setConfig(SEPAY_CONFIG_KEYS.bankBin, body.bankBin.trim());
  await setConfig(SEPAY_CONFIG_KEYS.paymentCodePrefix, body.paymentCodePrefix.trim().toUpperCase());
  await setConfig(SEPAY_CONFIG_KEYS.orderExpiryMinutes, body.orderExpiryMinutes.trim());

  if (body.apiKey?.trim()) {
    await setConfig(SEPAY_CONFIG_KEYS.apiKey, body.apiKey.trim());
  }
  if (body.webhookSecret?.trim()) {
    await setConfig(SEPAY_CONFIG_KEYS.webhookSecret, body.webhookSecret.trim());
  }
}

function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return a === b;
  }
}

/** SePAY sends: Authorization: Apikey YOUR_API_KEY */
export function verifySepayApiKey(authorizationHeader: string | undefined, expectedKey: string): boolean {
  if (!expectedKey || !authorizationHeader) return false;
  const match = authorizationHeader.trim().match(/^Apikey\s+(.+)$/i);
  if (!match) return false;
  return safeEqual(match[1].trim(), expectedKey.trim());
}
