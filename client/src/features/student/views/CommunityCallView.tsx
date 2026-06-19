import { useEffect, useState } from 'react';
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
  VideoOff,
  Flag,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHero } from '@/components/usable/page-hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CommunityCallSidebar } from '@/features/student/components/community-call-sidebar';
import { CommunityCallVideo } from '@/features/student/components/community-call-video';
import { useWebRtcCall } from '@/features/student/hooks/use-webrtc-call';
import type { CallSidebarPanel } from '@/features/student/types/webrtc-call.types';
import { webrtcReport } from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';

type CallMediaControlsProps = {
  micOn: boolean;
  camOn: boolean;
  disabled?: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  className?: string;
};

function CallMediaControls({
  micOn,
  camOn,
  disabled,
  onToggleMic,
  onToggleCam,
  className,
}: CallMediaControlsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <Button
        type="button"
        size="icon"
        variant={micOn ? 'secondary' : 'destructive'}
        className="h-12 w-12 rounded-full"
        disabled={disabled}
        onClick={onToggleMic}
        aria-label={micOn ? 'Tắt mic' : 'Bật mic'}
      >
        {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant={camOn ? 'secondary' : 'destructive'}
        className="h-12 w-12 rounded-full"
        disabled={disabled}
        onClick={onToggleCam}
        aria-label={camOn ? 'Tắt camera' : 'Bật camera'}
      >
        {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
    </div>
  );
}

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
      queueMicrotask(() => {
        setSidebarPanel('stt');
      });
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
    const previewReady = Boolean(localStream);
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 py-6">
      <PageHero
        animate={false}
        className="mb-0"
        badge="Peer Matching"
          title="Tìm bạn luyện nói ngay"
          description="Kiểm tra camera và mic, rồi ghép cặp với học viên khác để luyện hội thoại tiếng Nhật."
          icon={MessageCircle}
          iconClassName="bg-secondary"
          tone="brand"
          chips={['Video · Voice', 'Ghép ngẫu nhiên', 'Báo cáo nhanh']}
          aside={
            <div className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
              <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                Thiết bị
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    'size-3 rounded-full border border-border',
                    previewReady ? 'bg-quaternary' : 'bg-tertiary',
                  )}
                />
                <p className="font-display text-2xl font-extrabold">
                  {previewReady ? 'Sẵn sàng' : 'Đang chờ'}
                </p>
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                {previewReady ? 'Mic và camera đã bật' : 'Cần quyền camera & mic'}
              </p>
            </div>
          }
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-ink shadow-premium-hover">
              <CommunityCallVideo
                stream={localStream}
                muted
                mirror
                label="Bạn"
                className="aspect-video w-full min-h-[min(50vw,480px)] lg:min-h-[420px]"
                placeholder={error ? 'Không mở được camera' : 'Đang bật camera…'}
              />

              <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-ink/95 via-ink/70 to-transparent px-4 pb-5 pt-16">
                <CallMediaControls
                  micOn={micOn}
                  camOn={camOn}
                  disabled={!previewReady}
                  onToggleMic={toggleMic}
                  onToggleCam={toggleCam}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
              <p className="text-sm font-medium leading-6 text-muted-foreground">
                {previewReady
                  ? 'Kiểm tra khung hình phía trên, chỉnh mic/camera nếu cần, rồi bắt đầu ghép cặp.'
                  : 'Cho phép quyền camera và microphone trong trình duyệt để hiện preview.'}
              </p>

              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

              <Button
                className="mt-4 w-full gap-2"
                size="lg"
                disabled={!previewReady}
                onClick={() => void startMatching()}
              >
                <Users className="h-5 w-5" />
                Tìm bạn luyện nói
              </Button>

              {phase === 'ended' && (
                <Button className="mt-2 w-full" variant="outline" onClick={resetToIdle}>
                  Quay lại
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
              <Card className="bg-quaternary/15">
                <CardContent className="flex items-start gap-3 p-4 text-sm">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-display font-extrabold">Ngẫu nhiên</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Hệ thống ghép bạn với peer phù hợp.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-tertiary/20">
                <CardContent className="flex items-start gap-3 p-4 text-sm">
                  <Mic className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-display font-extrabold">Luyện nói</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Tập phản xạ giao tiếp qua video hoặc voice.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-surface-paper">
                <CardContent className="flex items-start gap-3 p-4 text-sm">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-display font-extrabold">An toàn</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Báo cáo nhanh nếu gặp hành vi không phù hợp.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
        </section>
      </div>
    );
  }

  if (phase === 'peer-left') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink px-4 text-background">
        <h2 className="text-xl font-semibold">{peerLeftNotice ?? 'Cuộc gọi đã kết thúc'}</h2>
        <p className="mt-2 max-w-sm text-center text-sm text-background/60">
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
    <div className="fixed inset-0 z-40 flex flex-col bg-ink text-background">
      <header className="flex shrink-0 items-center justify-between border-b border-background/10 px-4 py-3">
        <button
          type="button"
          className="text-sm text-background/70 hover:text-background"
          onClick={() => void cancelMatching()}
        >
          ← Thoát
        </button>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-background/60">NihongoCoach · Community</p>
          <p className="text-sm font-medium">
            {searching && 'Đang tìm bạn học…'}
            {phase === 'connecting' && 'Đang kết nối…'}
            {phase === 'connected' && 'Đang trong cuộc gọi'}
          </p>
        </div>
        <span className="w-16 text-right text-xs text-background/50">
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
              'absolute z-10 rounded-xl border border-background/20 shadow-premium card-lift',
              showSidebar
                ? 'bottom-28 left-4 h-32 w-24 sm:h-36 sm:w-28'
                : 'bottom-24 right-4 h-36 w-28 sm:h-40 sm:w-52',
            )}
            placeholder="Camera"
          />

          {searching && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/80 backdrop-blur-sm">
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
              'absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-2 border-t border-background/10',
              'bg-ink/90 px-4 py-3 backdrop-blur-md',
              showSidebar && 'right-0',
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <CallMediaControls
                micOn={micOn}
                camOn={camOn}
                disabled={!localStream}
                onToggleMic={toggleMic}
                onToggleCam={toggleCam}
              />
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
                  className="min-h-11 border-background/20 bg-ink text-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
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
        <div className="flex max-h-[40dvh] min-h-0 overflow-hidden border-t border-background/10 md:hidden">
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
