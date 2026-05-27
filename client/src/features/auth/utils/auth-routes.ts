import { paths } from '@/router/paths';

import type { AuthUser } from '../store/authStore';

export function isStaffRole(role: string) {
  return role === 'admin' || role === 'instructor';
}

export function defaultAppPath(user: AuthUser) {
  if (isStaffRole(user.role)) return paths.learn.hub;
  return paths.student.dashboard;
}
