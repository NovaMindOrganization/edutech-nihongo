import bcrypt from 'bcrypt';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import type { UserRole } from '@prisma/client';

export async function listUsers(params: {
  page?: number;
  limit?: number;
  role?: UserRole;
  q?: string;
  status?: 'active' | 'banned' | 'suspended';
} = {}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 30, 100);
  const skip = (page - 1) * limit;
  const q = params.q?.trim();

  const where = {
    ...(params.role ? { role: params.role } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' as const } },
            { displayName: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(params.status === 'banned' ? { isBanned: true } : {}),
    ...(params.status === 'suspended' ? { isSuspended: true } : {}),
    ...(params.status === 'active' ? { isBanned: false, isSuspended: false } : {}),
  };

  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        displayName: true,
        isBanned: true,
        isSuspended: true,
        createdAt: true,
      },
    }),
    db.user.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function updateUserRole(id: string, role: UserRole) {
  return db.user.update({ where: { id }, data: { role } });
}

export async function setUserBanned(id: string, isBanned: boolean) {
  return db.user.update({ where: { id }, data: { isBanned } });
}

export async function setUserSuspended(id: string, isSuspended: boolean) {
  return db.user.update({ where: { id }, data: { isSuspended } });
}

export async function resetUserPassword(id: string, password: string) {
  const hash = await bcrypt.hash(password, 12);
  return db.user.update({ where: { id }, data: { passwordHash: hash } });
}

export async function listReports() {
  return db.abuseReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      reporter: { select: { email: true } },
      reported: { select: { email: true } },
    },
  });
}

export async function resolveReport(id: string, status: 'resolved' | 'dismissed') {
  return db.abuseReport.update({ where: { id }, data: { status } });
}

export async function getAnalytics() {
  const [users, enrollments, sessions] = await Promise.all([
    db.user.count(),
    db.courseEnrollment.count(),
    db.examSession.count({ where: { submittedAt: { not: null } } }),
  ]);
  return { dau: users, enrollments, examSessionsCompleted: sessions };
}
