import { Bot, CheckCircle2, Gauge, Mic, Send, Sparkles, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSpeech } from '@/hooks/use-speech';
import { postLessonSpeaking, postLessonSpeakingStart } from '@/features/student/services/studentApi';
import {
  postPronunciationAssessment,
  type PronunciationAssessment,
} from '@/features/student/services/speechApi';
import {
  formatPronunciationFeedback,
  isPronunciationConfigError,
} from '../utils/pronunciation-feedback';
import { useLessonData } from '../context/lesson-context';

export function LessonSpeakingView() {
  const lesson = useLessonData();
  const { playTts, recording, startRecording, stopRecording, speaking } = useSpeech();
  const [text, setText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [lastCorrection, setLastCorrection] = useState<string | null>(null);
  const [pronunciation, setPronunciation] = useState<PronunciationAssessment | null>(null);
  const [pronunciationReference, setPronunciationReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const res = await postLessonSpeakingStart(lesson.lesson.id);
        if (cancelled) return;
        setSessionId(res.sessionId);
        setHistory([{ role: 'assistant', content: res.AI_Reply }]);
        setLastCorrection(res.Correction);
      } catch {
        if (!cancelled) toast.error('Không mở được phiên luyện nói');
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lesson.lesson.id]);

  async function send() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await postLessonSpeaking(lesson.lesson.id, {
        text,
        sessionId,
        conversationHistory: history,
      });
      setSessionId(res.sessionId);
      setHistory((h) => [
        ...h,
        { role: 'user', content: text },
        { role: 'assistant', content: res.AI_Reply },
      ]);
      setText('');
      setLastCorrection(res.Correction);
      if (res.Correction) toast.message(`Gợi ý: ${res.Correction}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi AI');
    } finally {
      setLoading(false);
    }
  }

  async function toggleMic() {
    try {
      if (!recording) {
        setPronunciation(null);
        await startRecording();
        toast.message('Đang ghi âm…');
        return;
      }
      const recorded = await stopRecording();
      const transcript = recorded.text.trim();
      const referenceText = (text.trim() || transcript).trim();
      const spokenText = transcript || referenceText;
      if (!spokenText) {
        toast.error('Không nhận dạng được');
        return;
      }
      setLoading(true);
      const lessonMessage = postLessonSpeaking(lesson.lesson.id, {
        text: spokenText,
        sessionId,
        conversationHistory: history,
      });
      const assessment =
        recorded.audioBase64 && referenceText
          ? postPronunciationAssessment({
              referenceText,
              audioBase64: recorded.audioBase64,
              language: 'ja',
              mimeType: recorded.mimeType ?? 'audio/webm',
              passThreshold: 70,
            })
          : Promise.resolve(null);

      const [res, pronunciationResult] = await Promise.all([lessonMessage, assessment]);
      setSessionId(res.sessionId);
      setHistory((h) => [
        ...h,
        { role: 'user', content: spokenText },
        { role: 'assistant', content: res.AI_Reply },
      ]);
      setLastCorrection(res.Correction);
      if (pronunciationResult) {
        setPronunciation(pronunciationResult);
        setPronunciationReference(referenceText);
        const feedback = formatPronunciationFeedback(
          pronunciationResult.error ?? pronunciationResult.feedbackVi,
        );
        if (pronunciationResult.error || isPronunciationConfigError(feedback)) {
          toast.error(feedback);
        } else {
          toast.message(`Phát âm: ${Math.round(pronunciationResult.overallScore)}/100`);
        }
      }
      if (res.Correction) toast.message(`Gợi ý: ${res.Correction}`);
    } catch {
      toast.error('Không ghi âm được');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-surface-paper">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <AppIcon icon={Bot} size="lg" className={recording ? 'bg-secondary' : 'bg-quaternary'} />
            <div>
              <Badge className="bg-tertiary text-tertiary-foreground">AI Speaking Coach</Badge>
              <CardTitle className="mt-2 font-display text-2xl">Luyện nói theo tiết</CardTitle>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Chat với Sensei AI, ghi âm câu trả lời và nhận gợi ý sửa lỗi.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-right shadow-premium card-lift">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
              Voice
            </p>
            <p className="font-bold">{recording ? 'Đang ghi âm' : 'Sẵn sàng'}</p>
          </div>
        </div>
        {lesson.lesson.speakingPrompt && (
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-background p-4 text-sm font-medium leading-7 text-muted-foreground">
            <div className="mb-2 flex items-center gap-2">
              <AppIcon icon={Sparkles} size="sm" className="bg-tertiary" />
              <span className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                Prompt
              </span>
            </div>
            {lesson.lesson.speakingPrompt}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 bg-background p-4 sm:p-6">
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-border bg-surface-paper p-4 text-sm shadow-premium card-lift">
          {starting && history.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-background/75 p-5 text-center">
              <AppIcon icon={Mic} size="lg" className="mx-auto mb-3 bg-tertiary" />
              <p className="font-display text-lg font-extrabold">Đang mở phiên luyện nói…</p>
              <p className="mt-1 font-medium text-muted-foreground">
                Sensei sẽ chào và giao nhiệm vụ đầu tiên theo bài học.
              </p>
            </div>
          )}
          {!starting && history.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-background/75 p-5 text-center">
              <AppIcon icon={Mic} size="lg" className="mx-auto mb-3 bg-tertiary" />
              <p className="font-display text-lg font-extrabold">Bắt đầu hội thoại</p>
              <p className="mt-1 font-medium text-muted-foreground">
                Hãy nói hoặc nhập câu tiếng Nhật theo hướng dẫn của Sensei.
              </p>
            </div>
          )}
          {history.map((m, i) => (
            <div
              key={i}
              className={`flex items-end gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && <AppIcon icon={Bot} size="md" className="bg-quaternary" />}
              <div
                className={`max-w-[85%] rounded-xl border border-border p-3 shadow-premium card-lift ${
                  m.role === 'user' ? 'rounded-br-md bg-primary/10 text-right' : 'rounded-bl-md bg-background'
                }`}
              >
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  {m.role === 'user' ? 'Bạn' : 'Sensei'}
                </p>
                <p className={m.role === 'assistant' ? 'mt-1 font-jp text-base leading-8' : 'mt-1 font-medium leading-7'}>
                  {m.content}
                </p>
                {m.role === 'assistant' && (
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-tertiary px-3 py-1.5 font-display text-xs font-extrabold text-foreground shadow-premium card-lift"
                    onClick={() => playTts(m.content)}
                    disabled={speaking}
                    aria-label="Nghe phản hồi của Sensei"
                  >
                    <Volume2 className="size-4" />
                    Nghe lại
                  </button>
                )}
              </div>
              {m.role === 'user' && (
                <AppIcon icon={Sparkles} size="md" className="bg-secondary" />
              )}
            </div>
          ))}
        </div>

        {lastCorrection && (
          <div className="rounded-xl border border-border bg-tertiary/20 p-4 shadow-premium card-lift">
            <div className="mb-2 flex items-center gap-2">
              <AppIcon icon={CheckCircle2} size="sm" className="bg-tertiary" />
              <p className="font-display text-sm font-extrabold">Gợi ý ngữ pháp</p>
            </div>
            <p className="text-sm font-semibold leading-6 text-foreground">{lastCorrection}</p>
          </div>
        )}

        {pronunciation && (
          <div className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-2">
                <AppIcon icon={Gauge} size="sm" className="bg-secondary" />
                <div>
                  <p className="font-display text-sm font-extrabold">Chấm phát âm</p>
                  {pronunciationReference && (
                    <p className="mt-1 font-jp text-sm font-semibold leading-6 text-muted-foreground">
                      {pronunciationReference}
                    </p>
                  )}
                </div>
              </div>
              {!isPronunciationConfigError(
                pronunciation.error ?? pronunciation.feedbackVi,
              ) && (
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-extrabold">
                    {Math.round(pronunciation.overallScore)}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">/100</span>
                  <Badge
                    className={
                      pronunciation.passed
                        ? 'bg-tertiary text-foreground'
                        : 'bg-secondary text-foreground'
                    }
                  >
                    {pronunciation.passed ? 'Đạt' : 'Luyện thêm'}
                  </Badge>
                </div>
              )}
            </div>
            <p
              className={`mt-3 text-sm font-semibold leading-6 ${
                isPronunciationConfigError(pronunciation.error ?? pronunciation.feedbackVi)
                  ? 'text-destructive'
                  : 'text-foreground'
              }`}
            >
              {formatPronunciationFeedback(pronunciation.error ?? pronunciation.feedbackVi)}
            </p>
            {pronunciation.transcript && (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                Transcript: <span className="font-jp">{pronunciation.transcript}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập tiếng Nhật…" />
          <Button onClick={send} disabled={loading} className="sm:w-24">
            <Send className="size-4 sm:hidden" />
            Gửi
          </Button>
          <Button
            variant={recording ? 'default' : 'outline'}
            onClick={toggleMic}
            disabled={loading}
            className="gap-2"
          >
            <Mic className="size-4" />
            <span className="sm:sr-only">{recording ? 'Dừng ghi âm' : 'Ghi âm'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
