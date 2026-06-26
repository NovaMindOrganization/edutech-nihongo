import { useEffect, useState } from 'react';

import { LoadingState } from '@/components/usable/loading-state';
import { getAccessToken, refreshAccessToken, setAccessToken } from '@/services/httpClient';

import { fetchMe } from '../services/authApi';
import { useAuthStore } from '../store/authStore';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);
  const logout = useAuthStore((s) => s.logout);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionReady(false);
    const token = getAccessToken();
    if (!token) {
      setSessionReady(true);
      setReady(true);
      return;
    }

    refreshAccessToken()
      .catch(() => false)
      .then(() => fetchMe())
      .then(({ user, accessToken }) => {
        setSession(user, accessToken ?? getAccessToken() ?? token);
      })
      .catch(() => {
        setAccessToken(null);
        logout();
      })
      .finally(() => {
        setSessionReady(true);
        setReady(true);
      });
  }, [setSession, setSessionReady, logout]);

  if (!ready) {
    return (
      <LoadingState
        label="Đang tải phiên đăng nhập…"
        variant="page"
        tone="default"
        className="border-0 bg-transparent"
      />
    );
  }

  return children;
}
