import { PrismaClient } from '@prisma/client';

import { env } from './env.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = db;
}
