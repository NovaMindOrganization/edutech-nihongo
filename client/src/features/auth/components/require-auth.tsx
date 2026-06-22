import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '@/components/usable/loading-state';
import { getAccessToken } from '@/services/httpClient';
import { paths } from '@/router/paths';

import { useAuthStore } from '../store/authStore';

/** Blocks student/learn API routes until session is ready; avoids 401 noise in console. */
export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const token = getAccessToken();

  if (token && !user) {
    return (
      <LoadingState
        label="Đang tải phiên đăng nhập…"
        variant="page"
        className="border-0 bg-transparent"
      />
    );
  }

  if (!user) {
    return <Navigate to={paths.login} state={{ returnTo: location.pathname }} replace />;
  }

  return <Outlet />;
}
