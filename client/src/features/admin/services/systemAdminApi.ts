import { apiFetch } from '@/services/httpClient';

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  isSuspended: boolean;
};

export type ListUsersParams = {
  page?: number;
  limit?: number;
  role?: string;
  q?: string;
  status?: 'active' | 'banned' | 'suspended';
};

export function listUsers(params: ListUsersParams = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.role) q.set('role', params.role);
  if (params.q) q.set('q', params.q);
  if (params.status) q.set('status', params.status);
  const qs = q.toString();
  return apiFetch<{ items: AdminUserRow[]; total: number; page: number; limit: number }>(
    `/admin/users${qs ? `?${qs}` : ''}`,
  );
}

export function getSystemConfig() {
  return apiFetch<Record<string, string>>('/admin/config');
}

export function setSystemConfig(key: string, value: string) {
  return apiFetch(`/admin/config/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
}

export type LlmProvider = 'gemini' | 'agent_router';

export type LlmAdminConfig = {
  provider: LlmProvider;
  geminiModel: string;
  geminiApiKey: string;
  geminiApiKeySet: boolean;
  geminiApiKeyPreview: string | null;
  openaiBaseUrl: string;
  openaiModel: string;
  openaiApiKey: string;
  openaiApiKeySet: boolean;
  openaiApiKeyPreview: string | null;
  temperature: string;
  ocrAgentRouterVisionModel: string;
  ocrGeminiFallbackModel: string;
};

export type SaveLlmAdminConfig = {
  provider: LlmProvider;
  geminiModel: string;
  geminiApiKey?: string;
  openaiBaseUrl: string;
  openaiModel: string;
  openaiApiKey?: string;
  temperature: string;
  ocrAgentRouterVisionModel: string;
  ocrGeminiFallbackModel: string;
};

export function getLlmConfig() {
  return apiFetch<LlmAdminConfig>('/admin/config/llm');
}

export function saveLlmConfig(body: SaveLlmAdminConfig) {
  return apiFetch('/admin/config/llm', { method: 'PUT', body: JSON.stringify(body) });
}

export type LlmTestDraft = {
  testProvider: LlmProvider;
  geminiModel?: string;
  geminiApiKey?: string;
  openaiBaseUrl?: string;
  openaiModel?: string;
  openaiApiKey?: string;
  temperature?: string;
};

export type LlmTestResult = {
  ok: boolean;
  provider: string;
  model: string;
  latencyMs: number;
  reply: string | null;
  error: string | null;
};

export function testLlmConfig(body: LlmTestDraft) {
  return apiFetch<LlmTestResult>('/admin/config/llm/test', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type SepayAuthMode = 'api_key' | 'hmac' | 'none';

export type SepayAdminConfig = {
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

export type SaveSepayAdminConfig = {
  authMode: SepayAuthMode;
  apiKey?: string;
  webhookSecret?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankBin: string;
  paymentCodePrefix: string;
  orderExpiryMinutes: string;
};

export function getSepayConfig() {
  return apiFetch<SepayAdminConfig>('/admin/config/sepay');
}

export function saveSepayConfig(body: SaveSepayAdminConfig) {
  return apiFetch<SepayAdminConfig>('/admin/config/sepay', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getAnalytics() {
  return apiFetch('/admin/analytics/dau');
}
