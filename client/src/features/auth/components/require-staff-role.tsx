import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { paths } from '@/router/paths';

import { canAccessStaffPath, staffHomePath } from '../utils/role-permissions';
import { useAuthStore } from '../store/authStore';

type Props = {
  children: React.ReactNode;
};

/** Chặn instructor/admin truy cập trang ngoài phạm vi role. */
export function RequireStaffRole({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin' && user.role !== 'instructor') {
      navigate(paths.student.dashboard, { replace: true });
      return;
    }
    if (!canAccessStaffPath(user, location.pathname)) {
      navigate(staffHomePath(user.role), { replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return null;
  }
  if (!canAccessStaffPath(user, location.pathname)) {
    return null;
  }

  return children;
}
