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

const RATE_LIMIT_MESSAGE =
  'Quá nhiều request. Vui lòng đợi vài phút rồi thử lại.';

/** Parse JSON an toàn — tránh lỗi khi server trả plain text (vd. 429). */
export async function parseFetchJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const fallback =
      res.status === 429
        ? RATE_LIMIT_MESSAGE
        : text.length > 200
          ? `${text.slice(0, 200)}…`
          : text;

    throw new ApiRequestError(
      fallback || `HTTP ${res.status}`,
      res.status,
      res.status === 429 ? 'RATE_LIMITED' : undefined,
    );
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

function kanjiImageCacheBustValue(
  cacheBust?: string | number | null,
): string | undefined {
  if (cacheBust === undefined || cacheBust === null || cacheBust === "") {
    return undefined;
  }
  return String(cacheBust);
}

/** Public route accepts kanji UUID or slug (e.g. kanji-4e00). */
export function kanjiMemoryImageAssetUrl(
  kanjiIdOrSlug: string,
  cacheBust?: string | number | null,
): string {
  const base = apiAssetUrl(
    `/api/public/kanji/${encodeURIComponent(kanjiIdOrSlug)}/memory-image`,
  );
  const version = kanjiImageCacheBustValue(cacheBust);
  return version ? `${base}?v=${encodeURIComponent(version)}` : base;
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
  memoryImageUpdatedAt?: string | Date | null;
}): string {
  const cacheBust =
    kanji.memoryImageUpdatedAt != null
      ? typeof kanji.memoryImageUpdatedAt === "string"
        ? kanji.memoryImageUpdatedAt
        : kanji.memoryImageUpdatedAt.toISOString()
      : kanji.id;

  return kanjiMemoryImageAssetUrl(
    kanji.slug?.trim() || kanji.id,
    cacheBust,
  );
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
      const json = await parseFetchJson<
        ApiResponse<{ accessToken: string }> & {
          error?: { code: string; message: string };
        }
      >(res);
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
  const json = await parseFetchJson<
    ApiResponse<T> & { error?: { code: string; message: string } }
  >(res);

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
    const message =
      json.error?.message ??
      (res.status === 429 ? RATE_LIMIT_MESSAGE : `HTTP ${res.status}`);
    throw new ApiRequestError(message, res.status, json.error?.code);
  }
  return json.data;
}
