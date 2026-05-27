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

export function getAnalytics() {
  return apiFetch('/admin/analytics/dau');
}
