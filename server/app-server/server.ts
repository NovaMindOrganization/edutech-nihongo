import { createServer } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { attachWebRtcSignaling } from './ws/webrtc-signaling.js';

const port = env.port;
const app = createApp();
const server = createServer(app);

attachWebRtcSignaling(server);

server.listen(port, () => {
  console.log(`[app-server] listening on :${port} (WS /ws/webrtc/signal)`);
});
