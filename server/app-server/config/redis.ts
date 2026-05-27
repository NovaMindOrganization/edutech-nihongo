import Redis from 'ioredis';

import { env } from './env.js';

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (env.nodeEnv !== 'production') {
  globalForRedis.redis = redis;
}

export async function getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;
  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

export async function incrRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  return count <= limit;
}
