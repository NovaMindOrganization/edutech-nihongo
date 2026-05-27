import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '../store/authStore';
import { defaultAppPath } from '../utils/auth-routes';

export function RedirectIfAuthenticated() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    const dest = returnTo ?? defaultAppPath(user);
    toast.message(
      user.role === 'admin' || user.role === 'instructor'
        ? 'Đã đăng nhập — dùng chế độ học để test (không cần đăng ký mới)'
        : 'Bạn đã đăng nhập',
    );
    navigate(dest, { replace: true });
  }, [user, navigate, location.state]);

  if (user) return null;

  return <Outlet />;
}
