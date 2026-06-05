import Redis from "ioredis";

import { env } from "./env.js";

type RedisLike = {
  get(key: string): Promise<string | null>;
  setex(key: string, ttlSeconds: number, value: string): Promise<unknown>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<number>;
  smembers(key: string): Promise<string[]>;
  srem(key: string, member: string): Promise<number>;
  sadd(key: string, member: string): Promise<number>;
  del(key: string): Promise<number>;
};

const globalForRedis = globalThis as unknown as { redis?: RedisLike };

function createRedisFallback(): RedisLike {
  return {
    async get() {
      return null;
    },
    async setex() {
      return "OK";
    },
    async incr() {
      return 0;
    },
    async expire() {
      return 0;
    },
    async smembers() {
      return [];
    },
    async srem() {
      return 0;
    },
    async sadd() {
      return 0;
    },
    async del() {
      return 0;
    },
  };
}

function createRedisClient(): RedisLike {
  const client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  let disabled = false;
  let warned = false;

  const warnOnce = () => {
    if (warned) return;
    warned = true;
    console.warn(
      `[redis] Redis unavailable at ${env.redisUrl}; running without cache/rate-limit in dev.`,
    );
  };

  client.on("error", (error) => {
    disabled = true;
    warnOnce();
    console.warn("[redis] Connection error:", error.message);
  });

  const wrap = <T>(action: () => Promise<T>, fallbackValue: T) => {
    if (disabled) return Promise.resolve(fallbackValue);
    return action().catch(() => {
      disabled = true;
      warnOnce();
      return fallbackValue;
    });
  };

  return {
    get: (key) => wrap(() => client.get(key), null),
    setex: (key, ttlSeconds, value) =>
      wrap(() => client.setex(key, ttlSeconds, value), "OK"),
    incr: (key) => wrap(() => client.incr(key), 0),
    expire: (key, ttlSeconds) => wrap(() => client.expire(key, ttlSeconds), 0),
    smembers: (key) => wrap(() => client.smembers(key), []),
    srem: (key, member) => wrap(() => client.srem(key, member), 0),
    sadd: (key, member) => wrap(() => client.sadd(key, member), 0),
    del: (key) => wrap(() => client.del(key), 0),
  };
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (env.nodeEnv !== "production") {
  globalForRedis.redis = redis;
}

export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 3600,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;
  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

export async function incrRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  return count <= limit;
}
