import type { IncomingMessage } from 'node:http';
import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';

import { loadActiveAuthUser } from '../services/session.service.js';
import { verifyAccessToken } from '../utils/jwt.js';
import * as webrtcService from '../services/webrtc.service.js';

type SignalMessage = {
  type: 'join' | 'signal' | 'leave';
  roomId?: string;
  payload?: unknown;
};

const roomSockets = new Map<string, Map<string, WebSocket>>();

function parseToken(req: IncomingMessage): string | null {
  const url = new URL(req.url ?? '/', 'http://localhost');
  return url.searchParams.get('token');
}

async function authenticate(req: IncomingMessage): Promise<string | null> {
  const token = parseToken(req);
  if (!token) return null;
  try {
    const payload = await verifyAccessToken(token);
    const user = await loadActiveAuthUser(payload.sub);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

function broadcast(roomId: string, fromUserId: string, data: unknown) {
  const peers = roomSockets.get(roomId);
  if (!peers) return;
  const msg = JSON.stringify({ from: fromUserId, data });
  for (const [userId, ws] of peers) {
    if (userId !== fromUserId && ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}

function notifyPeerLeft(roomId: string, leftUserId: string) {
  const peers = roomSockets.get(roomId);
  if (!peers) return;
  const payload = JSON.stringify({ type: 'peer-left', userId: leftUserId });
  for (const [peerUserId, peerWs] of peers) {
    if (peerUserId !== leftUserId && peerWs.readyState === peerWs.OPEN) {
      peerWs.send(payload);
    }
  }
}

function removePeerFromRoom(roomId: string, userId: string) {
  const peers = roomSockets.get(roomId);
  if (!peers) return;
  peers.delete(userId);
  if (peers.size === 0) roomSockets.delete(roomId);
}

export function attachWebRtcSignaling(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/webrtc/signal' });

  wss.on('connection', async (ws, req) => {
    const userId = await authenticate(req);
    if (!userId) {
      ws.close(4401, 'Unauthorized');
      return;
    }

    let roomId: string | null = null;

    ws.on('message', async (raw) => {
      let msg: SignalMessage;
      try {
        msg = JSON.parse(String(raw)) as SignalMessage;
      } catch {
        return;
      }

      if (msg.type === 'join' && msg.roomId) {
        const room = await webrtcService.getRoom(msg.roomId);
        if (!room || (room.peerA !== userId && room.peerB !== userId)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid room' }));
          return;
        }
        roomId = msg.roomId;
        if (!roomSockets.has(roomId)) roomSockets.set(roomId, new Map());
        const peers = roomSockets.get(roomId)!;
        peers.set(userId, ws);
        const peerIds = [...peers.keys()];
        ws.send(JSON.stringify({ type: 'joined', roomId, peerCount: peerIds.length }));
        for (const [peerUserId, peerWs] of peers) {
          if (peerUserId !== userId && peerWs.readyState === peerWs.OPEN) {
            peerWs.send(JSON.stringify({ type: 'peer-joined', userId, peerCount: peerIds.length }));
          }
        }
        return;
      }

      if (msg.type === 'signal' && roomId && msg.payload != null) {
        broadcast(roomId, userId, msg.payload);
        return;
      }

      if (msg.type === 'leave' && roomId) {
        notifyPeerLeft(roomId, userId);
        removePeerFromRoom(roomId, userId);
        void webrtcService.leaveMatch(userId);
        roomId = null;
      }
    });

    ws.on('close', () => {
      if (!roomId) return;
      notifyPeerLeft(roomId, userId);
      removePeerFromRoom(roomId, userId);
      void webrtcService.leaveMatch(userId);
    });
  });

  return wss;
}
