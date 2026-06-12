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

export function banUser(id: string) {
  return apiFetch(`/admin/users/${id}/ban`, { method: 'POST' });
}

export function unbanUser(id: string) {
  return apiFetch(`/admin/users/${id}/unban`, { method: 'POST' });
}

export function suspendUser(id: string) {
  return apiFetch(`/admin/users/${id}/suspend`, { method: 'POST' });
}

export function unsuspendUser(id: string) {
  return apiFetch(`/admin/users/${id}/unsuspend`, { method: 'POST' });
}

export function resetUserPassword(id: string, password: string) {
  return apiFetch(`/admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function updateUserRole(id: string, role: string) {
  return apiFetch(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export type AbuseReportRow = {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { email: string } | null;
  reported: { email: string } | null;
};

export function listReports() {
  return apiFetch<AbuseReportRow[]>('/admin/reports');
}

export function resolveReport(id: string, status: 'resolved' | 'dismissed') {
  return apiFetch(`/admin/reports/${id}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export type AdminAnalytics = {
  dau: number;
  enrollments: number;
  examSessionsCompleted: number;
  revenue: { totalPaid: number; orderCount: number; last30Days: number };
  completionRates: Array<{
    courseId: string;
    title: string;
    jlptLevel: string;
    completionPercent: number;
    enrolled?: number;
  }>;
  difficultLessons: Array<{
    lessonId: string;
    avgMiniTestScore: number | null;
    stuckCount: number;
    lesson: {
      id: string;
      title: string;
      orderIndex: number;
      course: { jlptLevel: string };
    } | null;
  }>;
};

export function getAnalytics() {
  return apiFetch<AdminAnalytics>('/admin/analytics/dau');
}

export type CourseRef = {
  id: string;
  title: string;
  jlptLevel: string;
  isPublished: boolean;
};

export function listCoursesForPricing() {
  return apiFetch<CourseRef[]>('/admin/courses');
}

export type PricingPlanCourseRef = {
  id: string;
  title: string;
  jlptLevel: string;
  isPublished: boolean;
};

export type PricingPlanItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number | null;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  courses: PricingPlanCourseRef[];
};

export function listPricingPlans() {
  return apiFetch<PricingPlanItem[]>('/admin/pricing-plans');
}

export function getPricingPlan(id: string) {
  return apiFetch<PricingPlanItem>(`/admin/pricing-plans/${id}`);
}

export function createPricingPlan(body: {
  name: string;
  description?: string | null;
  price: number;
  durationDays?: number | null;
  features: string[];
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  courseIds: string[];
}) {
  return apiFetch<PricingPlanItem>('/admin/pricing-plans', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePricingPlan(
  id: string,
  body: Partial<{
    name: string;
    description: string | null;
    price: number;
    durationDays: number | null;
    features: string[];
    isActive: boolean;
    isPopular: boolean;
    sortOrder: number;
    courseIds: string[];
  }>,
) {
  return apiFetch<PricingPlanItem>(`/admin/pricing-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deletePricingPlan(id: string) {
  return apiFetch<null>(`/admin/pricing-plans/${id}`, { method: 'DELETE' });
}
