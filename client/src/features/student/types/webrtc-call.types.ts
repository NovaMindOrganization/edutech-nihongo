export type CallPhase =
  | 'idle'
  | 'searching'
  | 'connecting'
  | 'connected'
  | 'peer-left'
  | 'ended';

export type WebRtcSignalPayload =
  | { kind: 'offer'; sdp: RTCSessionDescriptionInit }
  | { kind: 'answer'; sdp: RTCSessionDescriptionInit }
  | { kind: 'ice'; candidate: RTCIceCandidateInit };

export type RoomChatPayload = {
  kind: 'chat';
  id: string;
  text: string;
  at: number;
};

export type RoomSttPayload = {
  kind: 'stt';
  id: string;
  text: string;
  at: number;
};

export type RoomPayload = WebRtcSignalPayload | RoomChatPayload | RoomSttPayload;

export type CallChatMessage = {
  id: string;
  from: 'me' | 'peer';
  text: string;
  at: number;
};

export type CallSttEntry = {
  id: string;
  from: 'me' | 'peer';
  text: string;
  at: number;
};

export type CallSidebarPanel = 'chat' | 'stt' | 'translate';
