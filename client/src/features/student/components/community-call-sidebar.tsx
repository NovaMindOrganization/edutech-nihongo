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
import { cn } from '@/utils/cn';

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
    <aside className="flex h-full w-full flex-col border-l border-white/10 bg-zinc-900/95">
      <div className="flex border-b border-white/10">
        {PANELS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            disabled={disabled && id !== 'stt'}
            onClick={() => onPanelChange(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors',
              activePanel === id
                ? 'border-b-2 border-primary bg-white/5 text-white'
                : 'text-zinc-400 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        {activePanel === 'stt' && (
          <>
            <div
              className={cn(
                'mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs',
                sttListening ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-800 text-zinc-400',
              )}
            >
              <Radio className={cn('h-3 w-3', sttListening && 'animate-pulse')} />
              {sttListening
                ? 'Đang phiên âm tự động (mic bạn → bạn học thấy qua sync)'
                : disabled
                  ? 'Chờ kết nối để bật phiên âm'
                  : 'Bật mic để nhận dạng giọng nói'}
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg bg-zinc-950/60 p-2">
              {sttEntries.length === 0 && !sttLiveLine && (
                <p className="py-8 text-center text-xs text-zinc-500">
                  Lời nói của hai người sẽ hiện dạng tin nhắn khi bắt đầu nói.
                </p>
              )}
              {sttEntries.map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    'max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                    e.from === 'me'
                      ? 'ml-auto rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-zinc-800 text-zinc-100',
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
                      className="mt-1 text-[10px] underline opacity-80 hover:opacity-100"
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
                <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-md border border-dashed border-primary/40 bg-primary/10 px-3 py-2 text-sm text-zinc-200">
                  <span className="text-[10px] text-zinc-400">đang nghe…</span>
                  <p className="mt-0.5 italic">{sttLiveLine}</p>
                </div>
              )}
              <div ref={sttEndRef} />
            </div>
          </>
        )}

        {activePanel === 'chat' && (
          <>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg bg-zinc-950/60 p-2">
              {chatMessages.length === 0 && (
                <p className="text-center text-xs text-zinc-500">Chưa có tin nhắn</p>
              )}
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[90%] rounded-lg px-2 py-1.5 text-sm',
                    m.from === 'me'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-zinc-800 text-zinc-100',
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
                className="border-white/15 bg-zinc-950 text-white"
              />
              <Button type="submit" size="icon" disabled={disabled || !chatDraft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}

        {activePanel === 'translate' && (
          <>
            <p className="text-xs text-zinc-400">
              Dịch tiếng Nhật → Việt (tab riêng, dùng AI — không dùng cho phiên âm).
            </p>
            <textarea
              value={translateSource}
              onChange={(e) => setTranslateSource(e.target.value)}
              placeholder="Dán câu từ tab Phiên nói…"
              disabled={disabled}
              className="mt-3 min-h-[100px] w-full resize-none rounded-lg border border-white/15 bg-zinc-950 p-2 text-sm text-white"
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
              <div className="mt-3 rounded-lg border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100">
                {translateResult}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
