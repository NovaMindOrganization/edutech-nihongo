import { paths } from '@/router/paths';

import type { AuthUser } from '../store/authStore';

export type StaffRole = 'admin' | 'instructor';

const INSTRUCTOR_SEGMENTS = new Set([
  'kanji',
  'radicals',
  'vocabulary',
  'grammar',
  'courses',
  'conversations',
  'mock-exams',
  'questions',
  'study-sets',
]);

const ADMIN_SEGMENTS = new Set(['users', 'config', 'pricing', 'reports', 'analytics']);

function staffPathSegment(pathname: string): string | null {
  if (!pathname.startsWith(paths.admin.dashboard)) return null;
  const rest = pathname.slice(paths.admin.dashboard.length).replace(/^\//, '');
  if (!rest) return null;
  return rest.split('/')[0] ?? null;
}

export function isInstructorRole(role: string): role is 'instructor' {
  return role === 'instructor';
}

export function isAdminRole(role: string): role is 'admin' {
  return role === 'admin';
}

/** Instructor: nội dung học (kanji, khóa học, ngữ pháp, …). */
export function isInstructorStaffPath(pathname: string): boolean {
  const segment = staffPathSegment(pathname);
  if (!segment) return true;
  return INSTRUCTOR_SEGMENTS.has(segment);
}

/** Admin: tài khoản, cấu hình, gói giá, thống kê. */
export function isAdminStaffPath(pathname: string): boolean {
  const segment = staffPathSegment(pathname);
  if (!segment) return true;
  return ADMIN_SEGMENTS.has(segment);
}

export function canAccessStaffPath(user: Pick<AuthUser, 'role'>, pathname: string): boolean {
  if (user.role === 'instructor') return isInstructorStaffPath(pathname);
  if (user.role === 'admin') return isAdminStaffPath(pathname);
  return false;
}

export function staffHomePath(_role: string): string {
  return paths.admin.dashboard;
}
