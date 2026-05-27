import { motion } from 'framer-motion';
import { Loader2, Mic, MicOff, Play, Send, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';

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

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <p className="font-display text-sm tracking-widest text-primary uppercase">Luyện nói với AI</p>
      <h1 className="font-display mt-2 text-3xl font-bold">Nói như với bạn bè</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Luồng: giọng bạn → STT (live + server) → Gemini → TTS phản hồi.
        {sttConfig?.geminiFallback && ' Gemini STT fallback bật.'}
      </p>

      {phase === 'idle' && (
        <Button className="mt-6 w-full sm:w-auto" size="lg" onClick={startSession}>
          <Play className="mr-2 size-4" />
          Bắt đầu hội thoại
        </Button>
      )}

      <div className="mt-6 max-h-[50vh] min-h-[320px] flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-card/50 p-4">
        {phase === 'idle' && (
          <p className="text-center text-sm text-muted-foreground">
            Nhấn &quot;Bắt đầu&quot; — AI chào bạn bằng tiếng Nhật và phát TTS.
          </p>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/60 bg-background'
              }`}
            >
              <p className={msg.role === 'assistant' ? 'font-jp' : ''}>{msg.text}</p>
              {msg.correction && (
                <p className="mt-1 text-xs text-destructive">修正: {msg.correction}</p>
              )}
            </div>
          </motion.div>
        ))}

        {showLive && (
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
            <p className="text-xs font-medium text-primary">Đang nghe…</p>
            <p className="font-jp mt-1 min-h-[1.5rem] text-sm">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {phase === 'thinking' ? 'Gemini đang trả lời…' : 'Đang phát âm thanh…'}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {phase !== 'idle' && (
        <div className="mt-4 flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            variant={recording ? 'destructive' : 'default'}
            className="w-full"
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
            className="flex gap-2"
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
              className="self-start"
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
