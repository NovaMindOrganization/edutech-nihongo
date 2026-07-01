import { apiFetch } from '@/services/httpClient';

import type { FeedbackCategory, FeedbackStatus } from '../constants';

export type FeedbackAuthor = {
  id: string;
  displayName: string | null;
  email: string;
  role?: string;
};

export type FeedbackMessage = {
  id: string;
  feedbackId: string;
  authorId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: FeedbackAuthor;
};

export type FeedbackRow = {
  id: string;
  userId: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  status: FeedbackStatus;
  courseId: string | null;
  lessonId: string | null;
  pageUrl: string | null;
  assigneeId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: FeedbackAuthor;
  assignee?: FeedbackAuthor | null;
  course?: { id: string; title: string } | null;
  lesson?: { id: string; title: string } | null;
  messages?: FeedbackMessage[];
};

export type FeedbackListResponse = {
  items: FeedbackRow[];
  total: number;
  page: number;
  limit: number;
};

export type CreateFeedbackBody = {
  category: FeedbackCategory;
  title: string;
  description: string;
  courseId?: string;
  lessonId?: string;
  pageUrl?: string;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') q.set(key, String(value));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

// --- Student ---

export function createFeedback(body: CreateFeedbackBody) {
  return apiFetch<FeedbackRow>('/student/feedbacks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listStudentFeedbacks(params?: {
  status?: FeedbackStatus;
  page?: number;
  limit?: number;
}) {
  return apiFetch<FeedbackListResponse>(
    `/student/feedbacks${buildQuery(params ?? {})}`,
  );
}

export function getStudentFeedback(id: string) {
  return apiFetch<FeedbackRow>(`/student/feedbacks/${id}`);
}

export function postStudentMessage(feedbackId: string, body: string) {
  return apiFetch<FeedbackRow>(`/student/feedbacks/${feedbackId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export function closeStudentFeedback(feedbackId: string) {
  return apiFetch<FeedbackRow>(`/student/feedbacks/${feedbackId}/close`, {
    method: 'PATCH',
  });
}

// --- Staff ---

export type StaffFeedbackScope = 'admin' | 'instructor';

function staffBase(scope: StaffFeedbackScope) {
  return scope === 'admin' ? '/admin/feedbacks' : '/instructor/feedbacks';
}

export function listStaffFeedbacks(
  scope: StaffFeedbackScope,
  params?: {
    status?: FeedbackStatus;
    category?: FeedbackCategory;
    search?: string;
    page?: number;
    limit?: number;
  },
) {
  return apiFetch<FeedbackListResponse>(
    `${staffBase(scope)}${buildQuery(params ?? {})}`,
  );
}

export function getStaffFeedback(scope: StaffFeedbackScope, id: string) {
  return apiFetch<FeedbackRow>(`${staffBase(scope)}/${id}`);
}

export function postStaffMessage(
  scope: StaffFeedbackScope,
  feedbackId: string,
  body: string,
  isInternal?: boolean,
) {
  return apiFetch<FeedbackRow>(`${staffBase(scope)}/${feedbackId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, isInternal }),
  });
}

export function patchFeedbackStatus(
  scope: StaffFeedbackScope,
  feedbackId: string,
  status: FeedbackStatus,
) {
  return apiFetch<FeedbackRow>(`${staffBase(scope)}/${feedbackId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getFeedbackStats() {
  return apiFetch<{
    totalPending: number;
    pendingByCategory: Record<string, number>;
  }>('/admin/feedbacks/stats');
}
