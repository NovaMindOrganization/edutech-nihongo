import { randomUUID } from 'node:crypto';

import { redis } from '../config/redis.js';
import { db } from '../config/db.js';

const WAITING_KEY = 'nihongocoach:webrtc:waiting';
const ROOM_PREFIX = 'nihongocoach:webrtc:room:';
const USER_ROOM_PREFIX = 'nihongocoach:webrtc:user:';

const ROOM_TTL_SEC = 3600;

type RoomRecord = { id: string; peerA: string; peerB: string; createdAt: number };

async function assignUserRoom(userId: string, roomId: string) {
  await redis.setex(`${USER_ROOM_PREFIX}${userId}`, ROOM_TTL_SEC, roomId);
}

async function clearUserRoom(userId: string) {
  await redis.del(`${USER_ROOM_PREFIX}${userId}`);
}

export async function matchPeer(userId: string) {
  const existingRoomId = await redis.get(`${USER_ROOM_PREFIX}${userId}`);
  if (existingRoomId) {
    const room = await getRoom(existingRoomId);
    if (room) {
      const peerId = room.peerA === userId ? room.peerB : room.peerA;
      return {
        matched: true,
        roomId: existingRoomId,
        peerId,
        isInitiator: room.peerA === userId,
      };
    }
    await clearUserRoom(userId);
  }

  const waiting = await redis.smembers(WAITING_KEY);
  const other = waiting.find((id) => id !== userId);

  if (other) {
    await redis.srem(WAITING_KEY, other);
    await redis.srem(WAITING_KEY, userId);
    const roomId = randomUUID();
    const room: RoomRecord = { id: roomId, peerA: other, peerB: userId, createdAt: Date.now() };
    await redis.setex(`${ROOM_PREFIX}${roomId}`, ROOM_TTL_SEC, JSON.stringify(room));
    await assignUserRoom(other, roomId);
    await assignUserRoom(userId, roomId);
    return { matched: true, roomId, peerId: other, isInitiator: false };
  }

  await redis.sadd(WAITING_KEY, userId);
  await redis.expire(WAITING_KEY, 300);
  return { matched: false, roomId: null, isInitiator: false };
}

export async function leaveMatch(userId: string) {
  await redis.srem(WAITING_KEY, userId);
  const roomId = await redis.get(`${USER_ROOM_PREFIX}${userId}`);
  if (!roomId) return { left: true };

  await clearUserRoom(userId);

  const room = await getRoom(roomId);
  if (!room) return { left: true };

  const otherId = room.peerA === userId ? room.peerB : room.peerA;
  const otherStillActive = await redis.get(`${USER_ROOM_PREFIX}${otherId}`);

  if (!otherStillActive) {
    await redis.del(`${ROOM_PREFIX}${roomId}`);
    await clearUserRoom(room.peerA);
    await clearUserRoom(room.peerB);
  }

  return { left: true };
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
