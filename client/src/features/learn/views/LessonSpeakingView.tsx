import { Bot, CheckCircle2, Gauge, Mic, Play, Send, Sparkles, Volume2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';
import {
  postLessonSpeaking,
  postLessonSpeakingStart,
  type LessonSpeakingResponse,
} from '@/features/student/services/studentApi';
import {
  postPronunciationAssessment,
  type PronunciationAssessment,
} from '@/features/student/services/speechApi';
import {
  allowsJpd1PronunciationFallback,
  speakingPassScoreForCourse,
} from '../utils/jpd1-speaking';
import {
  formatPronunciationFeedback,
  isPronunciationConfigError,
} from '../utils/pronunciation-feedback';
import {
  speakingScoreSegmentClass,
} from '../utils/speaking-progress';
import { useLessonData } from '../context/lesson-context';

type SpeakingHistoryItem = {
  role: string;
  content: string;
  guideVi?: string | null;
  modelAnswer?: string | null;
};

function applySpeakingMeta(res: LessonSpeakingResponse) {
  return {
    stepIndex: res.stepIndex,
    stepTotal: res.stepTotal,
    sessionMode: res.sessionMode,
    completed: res.completed,
    modelAnswer: res.Model_Answer,
  };
}

function SpeakingProgressBar({
  total,
  scores,
  currentIndex,
  active,
}: {
  total: number;
  scores: (number | null)[];
  currentIndex: number;
  active: boolean;
}) {
  if (total <= 0) return null;

  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={total}>
      {Array.from({ length: total }, (_, index) => {
        const score = scores[index];
        const isCurrent = active && index === currentIndex && score == null;
        return (
          <div
            key={index}
            className={cn(
              'h-2 min-w-0 flex-1 rounded-full transition-colors duration-300',
              speakingScoreSegmentClass(score),
              isCurrent && 'ring-2 ring-primary/50 ring-offset-1',
            )}
          />
        );
      })}
    </div>
  );
}

export function LessonSpeakingView() {
  const { lesson } = useLessonData();
  const { playTts, recording, startRecording, stopRecording, speaking } = useSpeech();
  const stepTotal = lesson.speakingStepCount ?? 0;
  const isScripted = stepTotal > 0;
  const passScore = speakingPassScoreForCourse(lesson.course.jlptLevel);
  const jpd1PronunciationFallback = allowsJpd1PronunciationFallback(
    lesson.course.jlptLevel,
    isScripted,
  );

  const [text, setText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [history, setHistory] = useState<SpeakingHistoryItem[]>([]);
  const [lastCorrection, setLastCorrection] = useState<string | null>(null);
  const [pronunciation, setPronunciation] = useState<PronunciationAssessment | null>(null);
  const [pronunciationReference, setPronunciationReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionMode, setSessionMode] = useState<'scripted' | 'llm' | undefined>();
  const [stepIndex, setStepIndex] = useState(0);
  const [stepScores, setStepScores] = useState<(number | null)[]>([]);
  const [completed, setCompleted] = useState(false);
  const [modelAnswer, setModelAnswer] = useState<string | null>(null);

  const speakModel = useCallback(
    async (phrase: string | null | undefined) => {
      const target = phrase?.trim();
      if (!target || speaking) return;
      await playTts(target);
    },
    [playTts, speaking],
  );

  const recordStepScore = useCallback((index: number, score: number) => {
    setStepScores((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(null);
      next[index] = score;
      return next;
    });
  }, []);

  const handleSpeakingResponse = useCallback((res: LessonSpeakingResponse, userText: string) => {
      setSessionId(res.sessionId);
      setLastCorrection(res.Correction);
      const meta = applySpeakingMeta(res);
      if (meta.sessionMode) setSessionMode(meta.sessionMode);
      if (meta.stepIndex !== undefined) setStepIndex(meta.stepIndex);
      if (meta.completed !== undefined) setCompleted(meta.completed);
      if (meta.modelAnswer) setModelAnswer(meta.modelAnswer);

      if (userText) {
        setHistory((h) => [
          ...h,
          { role: 'user', content: userText },
          {
            role: 'assistant',
            content: res.AI_Reply,
            guideVi: res.Guide_Vi,
            modelAnswer: res.Model_Answer,
          },
        ]);
      }

      if (res.Correction && meta.sessionMode !== 'scripted') {
        toast.message(`Gợi ý: ${res.Correction}`);
      }
    }, []);

  async function beginSession() {
    setStarting(true);
    try {
      const res = await postLessonSpeakingStart(lesson.id);
      const meta = applySpeakingMeta(res);
      if (meta.sessionMode) setSessionMode(meta.sessionMode);
      if (meta.stepIndex !== undefined) setStepIndex(meta.stepIndex);
      if (meta.modelAnswer) setModelAnswer(meta.modelAnswer);
      setSessionId(res.sessionId);
      setStepScores(Array.from({ length: stepTotal || meta.stepTotal || 0 }, () => null));
      setHistory([
        {
          role: 'assistant',
          content: res.AI_Reply,
          guideVi: res.Guide_Vi,
          modelAnswer: res.Model_Answer,
        },
      ]);
      setLastCorrection(res.Correction);
      setSessionStarted(true);
      if (res.Model_Answer) await speakModel(res.Model_Answer);
    } catch {
      toast.error('Không mở được phiên luyện nói');
    } finally {
      setStarting(false);
    }
  }

  async function send() {
    if (!text.trim() || completed || !sessionStarted) return;
    setLoading(true);
    const currentStep = stepIndex;
    try {
      const res = await postLessonSpeaking(lesson.id, {
        text,
        sessionId,
        conversationHistory: history.map(({ role, content }) => ({ role, content })),
      });
      if (isScripted && !res.Correction) {
        recordStepScore(currentStep, passScore);
      }
      handleSpeakingResponse(res, text);
      setText('');
      if (res.Model_Answer) await speakModel(res.Model_Answer);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi AI');
    } finally {
      setLoading(false);
    }
  }

  async function toggleMic() {
    if (!sessionStarted) return;
    try {
      if (!recording) {
        setPronunciation(null);
        await startRecording();
        return;
      }
      const recorded = await stopRecording();
      const transcript = recorded.text.trim();
      const referenceText = (modelAnswer ?? (text.trim() || transcript)).trim();
      const spokenText = transcript || referenceText;
      if (!spokenText) {
        toast.error('Không nhận dạng được');
        return;
      }
      if (completed) return;

      setLoading(true);
      let pronunciationResult: PronunciationAssessment | null = null;
      let pronunciationSkipped = false;

      if (recorded.audioBase64 && referenceText) {
        pronunciationResult = await postPronunciationAssessment({
          referenceText,
          audioBase64: recorded.audioBase64,
          language: 'ja',
          mimeType: recorded.mimeType ?? 'audio/webm',
          passThreshold: passScore,
        });
        setPronunciation(pronunciationResult);
        setPronunciationReference(referenceText);

        const feedback = formatPronunciationFeedback(
          pronunciationResult.error ?? pronunciationResult.feedbackVi,
        );
        if (pronunciationResult.error || isPronunciationConfigError(feedback)) {
          if (jpd1PronunciationFallback) {
            toast.message('Chưa chấm phát âm — kiểm tra nội dung câu theo mẫu.');
            pronunciationSkipped = true;
          } else {
            toast.error(feedback);
            setLoading(false);
            return;
          }
        } else {
          const score = pronunciationResult.overallScore;
          recordStepScore(stepIndex, score);

          if (isScripted && score < passScore) {
            toast.message(
              `Điểm ${Math.round(score)}/100 — cần ít nhất ${passScore} để qua bước này`,
            );
            setLoading(false);
            return;
          }
        }
      }

      const res = await postLessonSpeaking(lesson.id, {
        text: spokenText,
        sessionId,
        conversationHistory: history.map(({ role, content }) => ({ role, content })),
      });

      handleSpeakingResponse(res, spokenText);

      if (isScripted && pronunciationSkipped && !res.Correction) {
        recordStepScore(stepIndex, passScore);
      }

      if (res.Model_Answer) await speakModel(res.Model_Answer);
    } catch {
      toast.error('Không ghi âm được');
    } finally {
      setLoading(false);
    }
  }

  const progressTotal = stepTotal || (sessionMode === 'scripted' ? history.length : 0);

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 bg-background p-4 sm:p-6">
        {(isScripted || progressTotal > 0) && (
          <div className="space-y-4">
            <SpeakingProgressBar
              total={progressTotal}
              scores={stepScores}
              currentIndex={stepIndex}
              active={sessionStarted && !completed}
            />
            {!sessionStarted && (
              <div className="flex justify-center py-6">
                <Button
                  size="lg"
                  className="gap-2 px-8 font-display"
                  onClick={beginSession}
                  disabled={starting}
                >
                  <Play className="size-5" />
                  {starting ? 'Đang mở…' : 'Bắt đầu'}
                </Button>
              </div>
            )}
          </div>
        )}

        {!isScripted && !sessionStarted && (
          <div className="flex justify-center py-6">
            <Button size="lg" className="gap-2 px-8" onClick={beginSession} disabled={starting}>
              <Play className="size-5" />
              {starting ? 'Đang mở…' : 'Bắt đầu'}
            </Button>
          </div>
        )}

        {sessionStarted && (
          <>
            {modelAnswer && !completed && (
              <div className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
                <p className="font-jp text-lg font-semibold leading-8">{modelAnswer}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 gap-2 px-0 text-primary"
                  onClick={() => speakModel(modelAnswer)}
                  disabled={speaking}
                >
                  <Volume2 className="size-4" />
                  Nghe mẫu
                </Button>
              </div>
            )}

            <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-border bg-surface-paper p-4 text-sm shadow-premium card-lift">
              {history.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <AppIcon icon={Bot} size="md" className="bg-quaternary" />
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl border border-border p-3 shadow-premium card-lift',
                      m.role === 'user'
                        ? 'rounded-br-md bg-primary/10 text-right'
                        : 'rounded-bl-md bg-background',
                    )}
                  >
                    <p
                      className={
                        m.role === 'assistant'
                          ? 'font-jp text-base leading-8'
                          : 'font-medium leading-7'
                      }
                    >
                      {m.content}
                    </p>
                    {m.role === 'assistant' && m.guideVi && (
                      <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                        {m.guideVi}
                      </p>
                    )}
                    {m.role === 'assistant' && (
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
                        onClick={() => speakModel(m.modelAnswer ?? m.content)}
                        disabled={speaking}
                        aria-label="Nghe lại"
                      >
                        <Volume2 className="size-3.5" />
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

            {completed && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <p className="font-display text-sm font-extrabold">Hoàn thành!</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bạn đã luyện xong. Thử nói lại cả đoạn một lần nữa nhé.
                </p>
              </div>
            )}

            {lastCorrection && !completed && (
              <p className="rounded-lg bg-tertiary/15 px-3 py-2 text-sm font-medium leading-6 text-foreground">
                {lastCorrection}
              </p>
            )}

            {pronunciation && (
              <div className="rounded-xl border border-border bg-surface-paper p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-muted-foreground" />
                    <span className="font-semibold">Phát âm</span>
                  </div>
                  {!isPronunciationConfigError(
                    pronunciation.error ?? pronunciation.feedbackVi,
                  ) && (
                    <span className="font-display text-lg font-extrabold">
                      {Math.round(pronunciation.overallScore)}
                      <span className="text-xs font-bold text-muted-foreground">/100</span>
                    </span>
                  )}
                </div>
                {pronunciationReference && (
                  <p className="mt-1 font-jp text-xs text-muted-foreground">{pronunciationReference}</p>
                )}
                <p className="mt-2 text-sm leading-6">
                  {formatPronunciationFeedback(pronunciation.error ?? pronunciation.feedbackVi)}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={completed ? 'Đã hoàn thành' : 'Nhập tiếng Nhật…'}
                disabled={completed}
              />
              <Button onClick={send} disabled={loading || completed} className="sm:w-24">
                <Send className="size-4 sm:hidden" />
                Gửi
              </Button>
              <Button
                variant={recording ? 'default' : 'outline'}
                onClick={toggleMic}
                disabled={loading || completed}
                className="gap-2"
                aria-label={recording ? 'Dừng ghi âm' : 'Ghi âm'}
              >
                <Mic className="size-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
