import type { IncomingMessage } from 'node:http';
import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';

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
    return payload.sub;
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
        roomSockets.get(roomId)!.set(userId, ws);
        ws.send(JSON.stringify({ type: 'joined', roomId }));
        return;
      }

      if (msg.type === 'signal' && roomId && msg.payload != null) {
        broadcast(roomId, userId, msg.payload);
        return;
      }

      if (msg.type === 'leave' && roomId) {
        roomSockets.get(roomId)?.delete(userId);
      }
    });

    ws.on('close', () => {
      if (roomId) roomSockets.get(roomId)?.delete(userId);
    });
  });

  return wss;
}
