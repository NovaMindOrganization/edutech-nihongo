import { randomUUID } from 'node:crypto';

import { redis } from '../config/redis.js';
import { db } from '../config/db.js';

const WAITING_KEY = 'nihongocoach:webrtc:waiting';
const ROOM_PREFIX = 'nihongocoach:webrtc:room:';

export async function matchPeer(userId: string) {
  const waiting = await redis.smembers(WAITING_KEY);
  const other = waiting.find((id) => id !== userId);

  if (other) {
    await redis.srem(WAITING_KEY, other);
    const roomId = randomUUID();
    const room = { id: roomId, peerA: other, peerB: userId, createdAt: Date.now() };
    await redis.setex(`${ROOM_PREFIX}${roomId}`, 3600, JSON.stringify(room));
    return { matched: true, roomId, peerId: other };
  }

  await redis.sadd(WAITING_KEY, userId);
  await redis.expire(WAITING_KEY, 300);
  return { matched: false, roomId: null };
}

export async function getRoom(roomId: string) {
  const raw = await redis.get(`${ROOM_PREFIX}${roomId}`);
  return raw ? (JSON.parse(raw) as { id: string; peerA: string; peerB: string }) : null;
}

export async function reportAbuse(
  reporterId: string,
  data: { reportedUserId?: string; roomId?: string; reason: string },
) {
  return db.abuseReport.create({
    data: {
      reporterId,
      reportedUserId: data.reportedUserId,
      roomId: data.roomId,
      reason: data.reason,
    },
  });
}

export async function cleanupStaleRooms() {
  const waiting = await redis.smembers(WAITING_KEY);
  if (waiting.length > 50) await redis.del(WAITING_KEY);
}
