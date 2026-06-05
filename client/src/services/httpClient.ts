const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
};

export class ApiRequestError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}

export function apiAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Public route accepts kanji UUID or slug (e.g. kanji-4e00). */
export function kanjiMemoryImageAssetUrl(kanjiIdOrSlug: string): string {
  return apiAssetUrl(
    `/api/public/kanji/${encodeURIComponent(kanjiIdOrSlug)}/memory-image`,
  );
}

export function kanjiHasMemoryImage(kanji: {
  memoryImageUrl?: string | null;
  slug?: string | null;
}): boolean {
  return Boolean(kanji.slug?.trim() || kanji.memoryImageUrl?.trim());
}

export function kanjiMemoryImageSrc(kanji: {
  id: string;
  slug?: string | null;
  memoryImageUrl?: string | null;
}): string {
  return kanjiMemoryImageAssetUrl(kanji.slug?.trim() || kanji.id);
}

const AUTH_NO_RETRY = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function shouldAttemptRefresh(path: string, status: number, code?: string): boolean {
  if (status !== 401) return false;
  if (AUTH_NO_RETRY.some((p) => path.startsWith(p))) return false;
  if (!getAccessToken()) return false;
  return code === 'INVALID_TOKEN' || code === 'TOKEN_EXPIRED' || code === 'UNAUTHORIZED';
}

let refreshInFlight: Promise<boolean> | null = null;

/** Silent renew via httpOnly refresh cookie */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const json = (await res.json()) as ApiResponse<{ accessToken: string }> & {
        error?: { code: string; message: string };
      };
      if (!res.ok || !json.data?.accessToken) return false;
      setAccessToken(json.data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    ...init,
    headers,
  });
  const json = (await res.json()) as ApiResponse<T> & { error?: { code: string; message: string } };

  if (
    !res.ok &&
    !retried &&
    shouldAttemptRefresh(path, res.status, json.error?.code)
  ) {
    const renewed = await refreshAccessToken();
    if (renewed) return apiFetch<T>(path, init, true);
    setAccessToken(null);
  }

  if (!res.ok) {
    throw new ApiRequestError(
      json.error?.message ?? `HTTP ${res.status}`,
      res.status,
      json.error?.code,
    );
  }
  return json.data;
}
