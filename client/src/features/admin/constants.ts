export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export const JLPT_ALL = '';

export const USER_ROLES = ['student', 'instructor', 'admin'] as const;

export type UserStatusFilter = '' | 'active' | 'banned' | 'suspended';

export type PublishedFilter = '' | 'published' | 'draft';
