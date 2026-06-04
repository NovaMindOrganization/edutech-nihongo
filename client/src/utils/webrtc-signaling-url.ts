import { getAccessToken } from '@/services/httpClient';

export function getWebRtcSignalingUrl(): string {
  const token = getAccessToken() ?? '';
  const apiBase = import.meta.env.VITE_API_BASE_URL?.trim();

  if (apiBase) {
    const url = new URL(apiBase);
    const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${url.host}/ws/webrtc/signal?token=${encodeURIComponent(token)}`;
  }

  const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProto}//${window.location.host}/ws/webrtc/signal?token=${encodeURIComponent(token)}`;
}
