import { paths } from '@/router/paths';

import type { AuthUser } from '../store/authStore';
import { isAdminRole, isInstructorRole } from './role-permissions';

export function isStaffRole(role: string) {
  return isAdminRole(role) || isInstructorRole(role);
}

export function defaultAppPath(user: AuthUser) {
  if (isStaffRole(user.role)) return paths.admin.dashboard;
  return paths.student.dashboard;
}
