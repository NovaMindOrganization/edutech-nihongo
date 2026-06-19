import { useEffect, useRef, useState } from 'react';
import {
  Languages,
  Loader2,
  MessageSquare,
  Mic,
  Radio,
  Send,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CallChatMessage, CallSidebarPanel, CallSttEntry } from '@/features/student/types/webrtc-call.types';
import { postCommunityTranslate } from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';

const PANELS: { id: CallSidebarPanel; label: string; icon: typeof MessageSquare }[] = [
  { id: 'stt', label: 'Phiên nói', icon: Mic },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'translate', label: 'Dịch', icon: Languages },
];

type CommunityCallSidebarProps = {
  activePanel: CallSidebarPanel;
  onPanelChange: (panel: CallSidebarPanel) => void;
  chatMessages: CallChatMessage[];
  sttEntries: CallSttEntry[];
  sttLiveLine?: string;
  sttListening?: boolean;
  onSendChat: (text: string) => void;
  onPickTranslate?: (text: string) => void;
  translateSource?: string;
  onTranslateSourceChange?: (text: string) => void;
  disabled?: boolean;
};

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function CommunityCallSidebar({
  activePanel,
  onPanelChange,
  chatMessages,
  sttEntries,
  sttLiveLine = '',
  sttListening = false,
  onSendChat,
  onPickTranslate,
  translateSource: translateSourceProp,
  onTranslateSourceChange,
  disabled = false,
}: CommunityCallSidebarProps) {
  const [chatDraft, setChatDraft] = useState('');
  const [translateLocal, setTranslateLocal] = useState('');
  const translateSource = translateSourceProp ?? translateLocal;
  const setTranslateSource = onTranslateSourceChange ?? setTranslateLocal;
  const [translateResult, setTranslateResult] = useState('');
  const [translating, setTranslating] = useState(false);
  const sttEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePanel === 'stt') {
      sttEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activePanel, sttEntries, sttLiveLine]);

  async function handleTranslate() {
    const source = translateSource.trim();
    if (!source) {
      toast.error('Chọn câu trong phiên nói hoặc nhập tiếng Nhật');
      return;
    }
    setTranslating(true);
    try {
      const res = await postCommunityTranslate(source, 'vi');
      const out = res.translation?.trim();
      if (out) {
        setTranslateResult(out);
      } else {
        setTranslateResult(
          res.error?.trim() ||
            'Không nhận được bản dịch từ LLM (response rỗng). Kiểm tra ai-server :8000 và cấu hình LLM trong admin.',
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi dịch');
    } finally {
      setTranslating(false);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col border-l border-background/10 bg-ink/95">
      <div className="flex border-b border-background/10" role="tablist" aria-label="Công cụ cuộc gọi">
        {PANELS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activePanel === id}
            aria-controls={`call-panel-${id}`}
            disabled={disabled && id !== 'stt'}
            onClick={() => onPanelChange(id)}
            className={cn(
              'flex min-h-11 flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors',
              activePanel === id
                ? 'border-b-2 border-primary bg-background/5 text-background'
                : 'text-background/60 hover:text-background',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        {activePanel === 'stt' && (
          <div id="call-panel-stt" role="tabpanel" className="flex min-h-0 flex-1 flex-col">
            <div
              className={cn(
                'mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs',
                sttListening ? 'bg-quaternary/15 text-quaternary' : 'bg-background/10 text-background/60',
              )}
            >
              <Radio className={cn('h-3 w-3', sttListening && 'animate-pulse')} />
              {sttListening
                ? 'Đang phiên âm tự động (mic bạn → bạn học thấy qua sync)'
                : disabled
                  ? 'Chờ kết nối để bật phiên âm'
                  : 'Bật mic để nhận dạng giọng nói'}
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg bg-ink/60 p-2">
              {sttEntries.length === 0 && !sttLiveLine && (
                <p className="py-8 text-center text-xs text-background/50">
                  Lời nói của hai người sẽ hiện dạng tin nhắn khi bắt đầu nói.
                </p>
              )}
              {sttEntries.map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    'max-w-[92%] break-words rounded-2xl px-3 py-2 text-sm shadow-premium card-lift [overflow-wrap:anywhere]',
                    e.from === 'me'
                      ? 'ml-auto rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-background/10 text-background',
                  )}
                >
                  <div
                    className={cn(
                      'mb-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80',
                      e.from === 'me' ? 'text-right' : 'text-left',
                    )}
                  >
                    {e.from === 'me' ? 'Bạn' : 'Bạn học'} · {formatTime(e.at)}
                  </div>
                  <p className="leading-snug">{e.text}</p>
                  {onPickTranslate && (
                    <button
                      type="button"
                      className="mt-1 inline-flex min-h-8 items-center text-[10px] underline opacity-80 hover:opacity-100"
                      onClick={() => {
                        setTranslateSource(e.text);
                        onPickTranslate?.(e.text);
                        onPanelChange('translate');
                      }}
                    >
                      Dịch →
                    </button>
                  )}
                </div>
              ))}
              {sttLiveLine && (
                <div className="ml-auto max-w-[92%] break-words rounded-2xl rounded-br-md border border-dashed border-primary/40 bg-primary/10 px-3 py-2 text-sm text-background/80 [overflow-wrap:anywhere]">
                  <span className="text-[10px] text-background/60">đang nghe…</span>
                  <p className="mt-0.5 italic">{sttLiveLine}</p>
                </div>
              )}
              <div ref={sttEndRef} />
            </div>
          </div>
        )}

        {activePanel === 'chat' && (
          <>
            <div id="call-panel-chat" role="tabpanel" className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg bg-ink/60 p-2">
              {chatMessages.length === 0 && (
                <p className="text-center text-xs text-background/50">Chưa có tin nhắn</p>
              )}
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[90%] break-words rounded-lg px-2 py-1.5 text-sm [overflow-wrap:anywhere]',
                    m.from === 'me'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-background/10 text-background',
                  )}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onSendChat(chatDraft);
                setChatDraft('');
              }}
            >
              <Input
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                placeholder="Nhắn bạn học…"
                disabled={disabled}
                className="border-background/15 bg-ink text-background"
              />
              <Button type="submit" size="icon" disabled={disabled || !chatDraft.trim()} aria-label="Gửi tin nhắn">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}

        {activePanel === 'translate' && (
          <>
            <div id="call-panel-translate" role="tabpanel">
            <p className="text-xs text-background/60">
              Dịch tiếng Nhật → Việt (tab riêng, dùng AI — không dùng cho phiên âm).
            </p>
            <textarea
              value={translateSource}
              onChange={(e) => setTranslateSource(e.target.value)}
              placeholder="Dán câu từ tab Phiên nói…"
              disabled={disabled}
              className="mt-3 min-h-[100px] w-full resize-none rounded-lg border border-background/15 bg-ink p-2 text-sm text-background"
            />
            <Button
              type="button"
              className="mt-2 w-full"
              disabled={disabled || translating}
              onClick={() => void handleTranslate()}
            >
              {translating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Dịch sang Việt
                </>
              )}
            </Button>
            {translateResult && (
              <div className="mt-3 rounded-lg border border-background/10 bg-ink p-3 text-sm text-background">
                {translateResult}
              </div>
            )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
