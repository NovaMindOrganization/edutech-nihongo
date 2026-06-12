import { randomUUID } from "node:crypto";

import { redis } from "../config/redis.js";
import type { GeneratedMiniTestQuestion } from "../utils/minitest-generator.js";

const SESSION_TTL_SECONDS = 2 * 60 * 60;

export type MiniTestSessionPayload = {
  userId: string;
  lessonId: string;
  questions: GeneratedMiniTestQuestion[];
};

const devSessions = new Map<string, { payload: MiniTestSessionPayload; exp: number }>();

function sessionKey(sessionId: string) {
  return `minitest:session:${sessionId}`;
}

function pruneDevSessions() {
  const now = Date.now();
  for (const [id, row] of devSessions) {
    if (row.exp <= now) devSessions.delete(id);
  }
}

async function storeSession(sessionId: string, payload: MiniTestSessionPayload) {
  const json = JSON.stringify(payload);
  await redis.setex(sessionKey(sessionId), SESSION_TTL_SECONDS, json);
  devSessions.set(sessionId, {
    payload,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
}

async function readSession(sessionId: string): Promise<MiniTestSessionPayload | null> {
  const fromRedis = await redis.get(sessionKey(sessionId));
  if (fromRedis) {
    try {
      return JSON.parse(fromRedis) as MiniTestSessionPayload;
    } catch {
      return null;
    }
  }

  pruneDevSessions();
  const dev = devSessions.get(sessionId);
  if (!dev || dev.exp <= Date.now()) {
    devSessions.delete(sessionId);
    return null;
  }
  return dev.payload;
}

async function deleteSession(sessionId: string) {
  await redis.del(sessionKey(sessionId));
  devSessions.delete(sessionId);
}

export async function createMiniTestSession(
  payload: MiniTestSessionPayload,
): Promise<string> {
  const sessionId = randomUUID();
  await storeSession(sessionId, payload);
  return sessionId;
}

export async function consumeMiniTestSession(
  sessionId: string,
  userId: string,
  lessonId: string,
): Promise<GeneratedMiniTestQuestion[] | null> {
  const payload = await readSession(sessionId);
  if (!payload) return null;
  if (payload.userId !== userId || payload.lessonId !== lessonId) return null;
  await deleteSession(sessionId);
  return payload.questions;
}
