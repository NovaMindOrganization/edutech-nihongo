import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
  VideoOff,
  Flag,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CommunityCallSidebar } from '@/features/student/components/community-call-sidebar';
import { CommunityCallVideo } from '@/features/student/components/community-call-video';
import { useWebRtcCall } from '@/features/student/hooks/use-webrtc-call';
import type { CallSidebarPanel } from '@/features/student/types/webrtc-call.types';
import { webrtcReport } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

export function CommunityCallView() {
  const {
    phase,
    roomId,
    localStream,
    remoteStream,
    micOn,
    camOn,
    error,
    peerLeftNotice,
    chatMessages,
    sttEntries,
    startMatching,
    cancelMatching,
    endCall,
    toggleMic,
    toggleCam,
    resetToIdle,
    sendChat,
    sttLiveLine,
    sttListening,
  } = useWebRtcCall();

  const [reportReason, setReportReason] = useState('');
  const [sidebarPanel, setSidebarPanel] = useState<CallSidebarPanel>('stt');
  const [translateDraft, setTranslateDraft] = useState('');

  useEffect(() => {
    if (phase === 'connected') {
      setSidebarPanel('stt');
    }
  }, [phase]);

  const inCall = phase === 'connecting' || phase === 'connected';
  const inRoom = inCall || phase === 'peer-left';
  const searching = phase === 'searching';
  const showSidebar = inRoom && !searching;

  async function handleReport() {
    if (!reportReason.trim()) {
      toast.error('Nhập lý do báo cáo');
      return;
    }
    try {
      await webrtcReport({ roomId: roomId ?? undefined, reason: reportReason.trim() });
      toast.success('Đã gửi báo cáo');
      setReportReason('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  async function handleEndCall() {
    await endCall();
    toast.message('Đã kết thúc cuộc gọi');
  }

  if (phase === 'idle' || phase === 'ended') {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4">
        <Link to={paths.student.community} className="text-sm text-primary hover:underline">
          ← Cộng đồng
        </Link>
        <div className="mt-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display mt-6 text-2xl font-bold">Luyện nói ngẫu nhiên</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Video/voice WebRTC + chat, STT, dịch — giao diện kiểu Google Meet.
          </p>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <Button className="mt-8 w-full" size="lg" onClick={() => void startMatching()}>
            Tìm bạn luyện nói
          </Button>
          {phase === 'ended' && (
            <Button className="mt-3 w-full" variant="outline" onClick={resetToIdle}>
              Quay lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'peer-left') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950 px-4 text-white">
        <h2 className="text-xl font-semibold">{peerLeftNotice ?? 'Cuộc gọi đã kết thúc'}</h2>
        <p className="mt-2 max-w-sm text-center text-sm text-zinc-400">
          Bạn có thể tìm bạn luyện nói mới hoặc quay lại cộng đồng.
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={() => void startMatching()}>Tìm bạn mới</Button>
          <Button variant="outline" onClick={resetToIdle}>
            Thoát
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-zinc-950 text-white">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <Link
          to={paths.student.community}
          className="text-sm text-zinc-300 hover:text-white"
          onClick={() => void cancelMatching()}
        >
          ← Thoát
        </Link>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-zinc-400">NihongoCoach · Community</p>
          <p className="text-sm font-medium">
            {searching && 'Đang tìm bạn học…'}
            {phase === 'connecting' && 'Đang kết nối…'}
            {phase === 'connected' && 'Đang trong cuộc gọi'}
          </p>
        </div>
        <span className="w-16 text-right text-xs text-zinc-500">
          {roomId ? roomId.slice(0, 8) : '—'}
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="relative flex min-w-0 flex-1 flex-col">
          <CommunityCallVideo
            stream={remoteStream}
            className="absolute inset-0 h-full w-full"
            placeholder={
              searching ? 'Đang ghép cặp ngẫu nhiên…' : 'Chờ bạn học bật camera…'
            }
            label="Bạn học"
          />

          <CommunityCallVideo
            stream={localStream}
            muted
            mirror
            label="Bạn"
            className={cn(
              'absolute z-10 rounded-xl border-2 border-white/20 shadow-lg',
              showSidebar
                ? 'bottom-28 left-4 h-32 w-24 sm:h-36 sm:w-28'
                : 'bottom-24 right-4 h-36 w-28 sm:h-40 sm:w-52',
            )}
            placeholder="Camera"
          />

          {searching && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">Đang tìm bạn luyện nói…</p>
              <Button className="mt-8" variant="outline" onClick={() => void cancelMatching()}>
                Hủy tìm
              </Button>
            </div>
          )}

          {error && (
            <div className="absolute left-4 right-4 top-4 z-20 rounded-lg bg-destructive/90 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <footer
            className={cn(
              'absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-2 border-t border-white/10',
              'bg-zinc-950/90 px-4 py-3 backdrop-blur-md',
              showSidebar && 'right-0',
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                size="icon"
                variant={micOn ? 'secondary' : 'destructive'}
                className="h-12 w-12 rounded-full"
                disabled={!inRoom}
                onClick={toggleMic}
                aria-label={micOn ? 'Tắt mic' : 'Bật mic'}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant={camOn ? 'secondary' : 'destructive'}
                className="h-12 w-12 rounded-full"
                disabled={!inRoom}
                onClick={toggleCam}
                aria-label={camOn ? 'Tắt camera' : 'Bật camera'}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-14 w-14 rounded-full"
                onClick={() => void (inRoom ? handleEndCall() : cancelMatching())}
                aria-label="Kết thúc"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>

            {inRoom && (
              <div className="mx-auto flex w-full max-w-md gap-2">
                <Input
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Báo cáo (nếu cần)"
                  className="h-9 border-white/20 bg-zinc-900 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => void handleReport()}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            )}
          </footer>
        </section>

        {showSidebar && (
          <div className="hidden w-80 shrink-0 md:flex lg:w-96">
            <CommunityCallSidebar
              activePanel={sidebarPanel}
              onPanelChange={setSidebarPanel}
              chatMessages={chatMessages}
              sttEntries={sttEntries}
              sttLiveLine={sttLiveLine}
              sttListening={sttListening}
              onSendChat={sendChat}
              onPickTranslate={setTranslateDraft}
              translateSource={translateDraft}
              onTranslateSourceChange={setTranslateDraft}
              disabled={phase !== 'connected'}
            />
          </div>
        )}
      </div>

      {showSidebar && (
        <div className="flex border-t border-white/10 md:hidden">
          <CommunityCallSidebar
            activePanel={sidebarPanel}
            onPanelChange={setSidebarPanel}
            chatMessages={chatMessages}
            sttEntries={sttEntries}
            sttLiveLine={sttLiveLine}
            sttListening={sttListening}
            onSendChat={sendChat}
            onPickTranslate={setTranslateDraft}
            translateSource={translateDraft}
            onTranslateSourceChange={setTranslateDraft}
            disabled={phase !== 'connected'}
          />
        </div>
      )}
    </div>
  );
}
