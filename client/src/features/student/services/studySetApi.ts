import {
  apiAssetUrl,
  apiFetch,
  ApiRequestError,
  getAccessToken,
} from '@/services/httpClient';

import type {
  StudySetDetail,
  StudySetItemInput,
  StudySetListRow,
  StudySetPublicList,
  StudySetContentType,
} from '../types/study-set.types';

export function studySetAssetUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/api/')) return apiAssetUrl(path);
  if (path.startsWith('study-sets/')) {
    const key = path.slice('study-sets/'.length);
    return apiAssetUrl(`/api/public/study-sets/asset?key=${encodeURIComponent(key)}`);
  }
  return apiAssetUrl(path);
}

export function listPublicStudySets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  contentType?: StudySetContentType;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search);
  if (params?.contentType) q.set('contentType', params.contentType);
  const qs = q.toString();
  return apiFetch<StudySetPublicList>(
    `/student/studysets/public${qs ? `?${qs}` : ''}`,
  );
}

export function listMyStudySets() {
  return apiFetch<StudySetListRow[]>('/student/studysets/mine');
}

export function getStudySet(id: string) {
  return apiFetch<StudySetDetail>(`/student/studysets/${id}`);
}

export function createStudySet(body: {
  title: string;
  description?: string;
  coverImageUrl?: string;
  tags?: string[];
  isPublic?: boolean;
  items?: StudySetItemInput[];
}) {
  return apiFetch<StudySetDetail>('/student/studysets', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateStudySet(
  id: string,
  body: {
    title?: string;
    description?: string | null;
    coverImageUrl?: string | null;
    tags?: string[];
    isPublic?: boolean;
    items?: StudySetItemInput[];
  },
) {
  return apiFetch<StudySetDetail>(`/student/studysets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteStudySet(id: string) {
  return apiFetch<null>(`/student/studysets/${id}`, { method: 'DELETE' });
}

export function cloneStudySet(id: string) {
  return apiFetch<StudySetDetail>(`/student/studysets/${id}/clone`, {
    method: 'POST',
  });
}

export function addStudySetItems(id: string, items: StudySetItemInput[]) {
  return apiFetch<StudySetDetail>(`/student/studysets/${id}/items`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function uploadStudySetFile(file: File) {
  const token = getAccessToken();
  const headers = new Headers({ 'Content-Type': file.type || 'application/octet-stream' });
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(apiAssetUrl('/api/student/studysets/upload'), {
    method: 'POST',
    credentials: 'include',
    headers,
    body: file,
  });
  const json = (await res.json()) as {
    success: boolean;
    data?: { storagePath: string; assetUrl: string };
    error?: { code: string; message: string };
  };

  if (!res.ok || !json.data) {
    throw new ApiRequestError(
      json.error?.message ?? `HTTP ${res.status}`,
      res.status,
      json.error?.code,
    );
  }
  return json.data;
}
