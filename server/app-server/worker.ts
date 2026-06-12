import { assertProductionEnv, env } from './config/env.js';

assertProductionEnv();
import { db } from './config/db.js';
import * as webrtcService from './services/webrtc.service.js';

async function expireExamSessions() {
  const expired = await db.examSession.findMany({
    where: { submittedAt: null, expiresAt: { lt: new Date() } },
    take: 100,
  });
  for (const session of expired) {
    await db.examSession.update({
      where: { id: session.id },
      data: { submittedAt: new Date(), isAutoSubmitted: true, score: { total: 0 } },
    });
  }
  if (expired.length > 0) {
    console.log(`[worker] Auto-submitted ${expired.length} exam sessions`);
  }
}

async function runCron() {
  await expireExamSessions();
  await webrtcService.cleanupStaleRooms();
}

console.log('[worker] Cron worker started');
runCron();
setInterval(runCron, 60_000);

if (env.nodeEnv === 'development') {
  console.log('[worker] Running expire-exam + webrtc cleanup every 60s');
}
