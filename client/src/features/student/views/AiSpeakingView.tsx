import { motion } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Play,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { AppIcon } from '@/components/usable/app-icon';
import { PageHero } from '@/components/usable/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAiSpeakingSession } from '@/features/student/hooks/use-ai-speaking-session';

export function AiSpeakingView() {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const {
    phase,
    messages,
    liveTranscript,
    sttConfig,
    hasBrowserStt,
    speaking,
    recording,
    startSession,
    sendText,
    toggleListening,
    replayLastAssistant,
    isBusy,
  } = useAiSpeakingSession();

  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  async function sendTyped() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendText(text);
    scrollToEnd();
  }

  const showLive = phase === 'listening' && (liveTranscript || recording);
  const phaseLabel =
    phase === 'idle'
      ? 'Ready'
      : phase === 'listening'
        ? 'Listening'
        : phase === 'thinking'
          ? 'Thinking'
          : phase === 'speaking'
            ? 'Speaking'
            : 'Active';

  return (
    <div className="flex w-full flex-col">
      <PageHero
        animate={false}
        className="mb-0"
        badge="AI Speaking Coach"
        title="Nói như với bạn bè"
        description={`Luyện hội thoại tiếng Nhật với AI, nhận phản hồi phát âm/ngữ pháp và nghe lại câu trả lời bằng TTS.${
          sttConfig?.geminiFallback ? ' Gemini STT fallback đang bật.' : ''
        }`}
        icon={Bot}
        iconClassName="bg-quaternary"
        tone="quaternary"
        chips={['STT', 'TTS', 'Phản hồi ngữ pháp']}
        footer="Nhấn Bắt đầu để AI chào bạn bằng tiếng Nhật — nói hoặc gõ tin nhắn, nghe lại câu trả lời bất cứ lúc nào."
        aside={
          <div className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
              Session Status
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`size-3 rounded-full border border-border ${
                  recording ? 'bg-secondary' : phase === 'active' ? 'bg-quaternary' : 'bg-tertiary'
                }`}
              />
              <p className="font-display text-2xl font-extrabold">{phaseLabel}</p>
            </div>
          </div>
        }
      />

      {phase === 'idle' && (
        <Button className="mt-6 w-full sm:w-auto" size="lg" onClick={startSession}>
          <Play className="mr-2 size-4" />
          Bắt đầu hội thoại
        </Button>
      )}

      <div className="mt-6 max-h-[58vh] min-h-[380px] flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
        {phase === 'idle' && (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-surface-paper p-6 text-center shadow-premium card-lift">
            <AppIcon icon={MessageCircle} size="lg" className="mx-auto mb-4 bg-tertiary" />
            <p className="font-display text-xl font-extrabold">Sẵn sàng luyện nói?</p>
            <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
              Nhấn &quot;Bắt đầu&quot; để AI chào bạn bằng tiếng Nhật và phát TTS.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && <AppIcon icon={Bot} size="md" className="bg-quaternary" />}
            <div
              className={`max-w-[85%] rounded-xl border border-border px-4 py-3 text-sm shadow-premium card-lift ${
                msg.role === 'user'
                  ? 'rounded-br-md bg-primary/10 text-foreground'
                  : 'rounded-bl-md bg-surface-paper'
              }`}
            >
              <p className="mb-1 font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                {msg.role === 'user' ? 'Bạn' : 'Sensei AI'}
              </p>
              <p className={msg.role === 'assistant' ? 'font-jp text-base leading-8' : 'font-medium leading-7'}>
                {msg.text}
              </p>
              {msg.correction && (
                <div className="mt-3 rounded-2xl border border-dashed border-border bg-tertiary/20 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <AppIcon icon={CheckCircle2} size="sm" className="bg-tertiary" />
                    <span className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                      Grammar / Pronunciation Feedback
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-5 text-foreground">修正: {msg.correction}</p>
                </div>
              )}
            </div>
            {msg.role === 'user' && <AppIcon icon={Sparkles} size="md" className="bg-secondary" />}
          </motion.div>
        ))}

        {showLive && (
          <div className="rounded-3xl border border-dashed border-border bg-secondary/15 px-4 py-3 shadow-premium card-lift">
            <div className="mb-2 flex items-center gap-2">
              <AppIcon icon={Mic} size="sm" className="bg-secondary" />
              <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">Đang nghe…</p>
            </div>
            <p className="mt-1 min-h-[1.5rem] font-jp text-sm font-semibold leading-7">
              {liveTranscript || '…'}
            </p>
            {!hasBrowserStt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Trình duyệt không hỗ trợ STT live — vẫn ghi âm và gửi server khi dừng.
              </p>
            )}
          </div>
        )}

        {(phase === 'thinking' || phase === 'speaking') && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-paper px-3 py-2 text-sm font-medium text-muted-foreground shadow-premium card-lift">
            <Loader2 className="size-4 animate-spin" />
            {phase === 'thinking' ? 'Gemini đang trả lời…' : 'Đang phát âm thanh…'}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {phase !== 'idle' && (
        <div className="mt-4 rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
          <Button
            type="button"
            size="lg"
            variant={recording ? 'destructive' : 'default'}
            className="w-full gap-2"
            disabled={isBusy}
            onClick={toggleListening}
          >
            {recording ? (
              <>
                <MicOff className="mr-2 size-5" />
                Dừng & gửi
              </>
            ) : (
              <>
                <Mic className="mr-2 size-5" />
                Nhấn để nói
              </>
            )}
          </Button>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendTyped();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hoặc nhập tiếng Nhật…"
              disabled={isBusy || recording}
            />
            <Button type="submit" size="icon" disabled={isBusy || recording}>
              <Send className="size-4" />
            </Button>
          </form>

          {messages.some((m) => m.role === 'assistant') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 self-start"
              disabled={speaking || isBusy}
              onClick={replayLastAssistant}
            >
              <Volume2 className="mr-1 size-4" />
              Phát lại câu cuối
            </Button>
          )}
        </div>
      )}

      {sttConfig && phase !== 'idle' && (
        <p className="mt-3 text-xs text-muted-foreground">
          STT: lang={sttConfig.defaultLanguage}, beam={sttConfig.beamSize}, min=
          {sttConfig.minAudioBytes}B, max={sttConfig.maxDurationSec}s
        </p>
      )}
    </div>
  );
}
