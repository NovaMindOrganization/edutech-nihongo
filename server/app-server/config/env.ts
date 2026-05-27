/** Central env accessors */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/app',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
  jwtAccessExpires:
    process.env.JWT_ACCESS_EXPIRES ??
    (process.env.NODE_ENV === 'production' ? '15m' : '8h'),
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  aiServerUrl: process.env.AI_SERVER_URL ?? 'http://localhost:8000',
} as const;
