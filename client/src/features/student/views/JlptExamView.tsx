import { AlertTriangle, ArrowLeft, Clock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ApiRequestError } from '@/services/httpClient';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
import { examChrome } from '@/features/student/components/exam-shell-theme';
import {
  McqExamShell,
  EXAM_ROOT,
} from '@/features/student/components/mcq-exam-shell';
import {
  getActiveJlptSession,
  getJlptSession,
  listJlptExams,
  startJlptSim,
  submitJlptSim,
  type ApiQuestion,
  type JlptAnswerDetail,
  type JlptExamListItem,
  type JlptScore,
  type JlptSessionPayload,
} from '@/features/student/services/studentApi';

type Phase = 'intro' | 'exam' | 'results';

function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function draftStorageKey(examId: string) {
  return `jlpt-draft:${examId}`;
}

function loadDraftAnswers(examId: string, sessionId: string): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(draftStorageKey(examId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { sessionId: string; answers: Record<string, string> };
    return parsed.sessionId === sessionId ? parsed.answers : {};
  } catch {
    return {};
  }
}

function saveDraftAnswers(
  examId: string,
  sessionId: string,
  answers: Record<string, string>,
) {
  sessionStorage.setItem(
    draftStorageKey(examId),
    JSON.stringify({ sessionId, answers }),
  );
}

function clearDraftAnswers(examId: string) {
  sessionStorage.removeItem(draftStorageKey(examId));
}

export function JlptExamView() {
  const { examId = '' } = useParams();
  const location = useLocation();
  const stateExam = (location.state as { exam?: JlptExamListItem } | null)?.exam;

  const [examMeta, setExamMeta] = useState<JlptExamListItem | null>(stateExam ?? null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  const [score, setScore] = useState<JlptScore | null>(null);
  const [details, setDetails] = useState<JlptAnswerDetail[]>([]);
  const [activeSession, setActiveSession] = useState<JlptSessionPayload | null>(null);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    if (!examId || phase !== 'intro') return;
    listJlptExams()
      .then((list) => {
        const found = list.find((e) => e.id === examId);
        if (found) setExamMeta(found);
        else if (!examMeta) toast.error('Không tìm thấy đề thi');
      })
      .catch(() => {
        if (!examMeta) toast.error('Không tải được đề thi');
      });
  }, [examId, phase]);

  useEffect(() => {
    if (!examId || phase !== 'intro') return;
    getActiveJlptSession(examId)
      .then((data) => setActiveSession(data))
      .catch(() => setActiveSession(null));
  }, [examId, phase]);

  const applySession = useCallback(
    (data: JlptSessionPayload, enterExam: boolean) => {
      setSessionId(data.sessionId);
      setExpiresAt(new Date(data.expiresAt));
      setRemainingMs(data.remainingMs);
      setQuestions(data.questions);
      setExamTitle(data.examTitle);
      setDurationMinutes(data.durationMinutes);
      setAnswers(loadDraftAnswers(examId, data.sessionId));
      setHighlightIndex(0);
      autoSubmittedRef.current = false;

      if (data.resumed) {
        toast.info('Tiếp tục phiên thi — thời gian tính từ lúc bắt đầu');
      }

      if (enterExam) setPhase('exam');
    },
    [examId],
  );

  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const isTimeUp = remainingMs <= 0;
  const timerUrgent = remainingMs > 0 && remainingMs < 5 * 60 * 1000;

  const submitExam = useCallback(
    async (autoSubmit = false) => {
      if (!sessionId) return;
      setLoading(true);
      try {
        const payload = questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] ?? '',
        }));
        const data = await submitJlptSim(sessionId, payload, autoSubmit);
        setScore(data.score);
        setDetails(data.details ?? []);
        setPhase('results');
        clearDraftAnswers(examId);
        if (autoSubmit) toast.info('Hết giờ — hệ thống đã nộp bài tự động');
      } catch (e) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.includes('expired') || msg.includes('SESSION_EXPIRED')) {
          toast.error('Đã hết giờ làm bài');
          setPhase('intro');
          setActiveSession(null);
        } else {
          toast.error(msg || 'Nộp bài thất bại');
        }
      } finally {
        setLoading(false);
      }
    },
    [sessionId, questions, answers, examId],
  );

  useEffect(() => {
    if (phase !== 'exam' || !expiresAt) return;
    const tick = () => {
      const ms = expiresAt.getTime() - Date.now();
      setRemainingMs(ms);
      if (ms <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitExam(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, expiresAt, submitExam]);

  useEffect(() => {
    if (phase !== 'exam' || !sessionId) return;

    const syncWithServer = async () => {
      try {
        const data = await getJlptSession(sessionId);
        setExpiresAt(new Date(data.expiresAt));
        setRemainingMs(data.remainingMs);
      } catch {
        /* timer tick / submit will handle expiry */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncWithServer();
    };

    document.addEventListener('visibilitychange', onVisible);
    const intervalId = window.setInterval(syncWithServer, 30_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(intervalId);
    };
  }, [phase, sessionId]);

  useEffect(() => {
    if (phase !== 'exam' || !sessionId) return;
    saveDraftAnswers(examId, sessionId, answers);
  }, [phase, sessionId, examId, answers]);

  async function handleStart() {
    if (!examMeta) return;
    setLoading(true);
    try {
      const data = await startJlptSim(examMeta.jlptLevel, examMeta.id);
      if (data.questions.length === 0) {
        toast.error('Đề chưa có câu hỏi');
        return;
      }
      if (data.remainingMs <= 0) {
        toast.error('Phiên thi đã hết giờ');
        setActiveSession(null);
        return;
      }
      applySession(data, true);
      setActiveSession(null);
    } catch (e) {
      if (e instanceof ApiRequestError && e.code === 'ATTEMPT_LIMIT_REACHED') {
        toast.error(e.message);
        const list = await listJlptExams();
        const found = list.find((item) => item.id === examId);
        if (found) setExamMeta(found);
        return;
      }
      toast.error(e instanceof Error ? e.message : 'Không bắt đầu được');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmitClick() {
    if (isTimeUp) {
      toast.error('Đã hết giờ làm bài');
      return;
    }
    if (!allAnswered) {
      toast.error(`Còn ${questions.length - answeredCount} câu chưa trả lời`);
      return;
    }
    if (!confirm('Xác nhận nộp bài? Sau khi nộp bạn không thể chỉnh sửa đáp án.')) return;
    submitExam(false);
  }

  function selectAnswer(questionId: string, value: string) {
    if (isTimeUp || loading) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  if (!examMeta) {
    return (
      <div className={cn(EXAM_ROOT, 'items-center justify-center bg-background')}>
        <p className="text-sm tracking-wide text-muted-foreground">Đang tải đề thi…</p>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className={cn(EXAM_ROOT, 'overflow-y-auto bg-muted/40')}>
        <div className={cn('px-4 py-3 md:px-8', examChrome.header)}>
          <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', examChrome.eyebrow)}>
            Thi thử JLPT
          </p>
          <h1 className="mt-1 font-display text-lg font-semibold tracking-tight md:text-xl">
            {examMeta.title}
          </h1>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-6">
          <Link
            to={paths.student.jlptSim}
            className="mb-8 inline-flex items-center text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Thoát — danh sách đề
          </Link>

          <div className="border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/50 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Thông tin đề thi
              </p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Cấp độ</dt>
                  <dd className="font-semibold text-foreground">
                    {examMeta.jlptLevel}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Thời gian</dt>
                  <dd className="font-semibold text-foreground">
                    {examMeta.durationMinutes} phút
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Số câu</dt>
                  <dd className="font-semibold text-foreground">
                    {examMeta.questionCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Lượt thi</dt>
                  <dd className="font-semibold text-foreground">
                    {examMeta.myAttemptCount}/{examMeta.maxAttempts}
                    {examMeta.attemptsRemaining > 0
                      ? ` (còn ${examMeta.attemptsRemaining})`
                      : ' (đã hết)'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4 px-6 py-6 text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Quy chế làm bài</p>
              <ul className="list-inside list-decimal space-y-2 marker:text-muted-foreground">
                <li>Toàn bộ câu hỏi hiển thị trên một trang — cuộn để làm bài.</li>
                <li>Đồng hồ đếm ngược; hết giờ hệ thống tự nộp bài.</li>
                <li>Chọn một đáp án cho mỗi câu; dùng bảng số bên trái để nhảy nhanh.</li>
                <li>Kiểm tra lại trước khi bấm «Nộp bài» — không sửa được sau khi nộp.</li>
                <li>Mỗi đề chỉ một phiên đang mở — thoát trang vẫn trừ thời gian cho đến khi hết giờ.</li>
                <li>
                  Tối đa {examMeta.maxAttempts} lượt thi / học viên — mỗi lần nộp bài (kể cả hết giờ tự
                  nộp) tính một lượt.
                </li>
              </ul>
            </div>

            {activeSession && activeSession.remainingMs > 0 && (
              <div className="mx-6 mb-0 border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-medium">Bạn có bài đang làm dở</p>
                <p className="mt-1 font-mono tabular-nums">
                  Còn {formatCountdown(activeSession.remainingMs)} — bấm bên dưới để tiếp tục (không reset
                  đồng hồ).
                </p>
              </div>
            )}

            {!examMeta.canStart && !(activeSession && activeSession.remainingMs > 0) && (
              <div className="mx-6 border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                Bạn đã dùng hết {examMeta.maxAttempts} lượt thi cho đề này.
              </div>
            )}

            <div className="border-t border-border bg-muted/50 px-6 py-5">
              <button
                type="button"
                disabled={
                  loading ||
                  examMeta.questionCount === 0 ||
                  (!examMeta.canStart && !(activeSession && activeSession.remainingMs > 0))
                }
                onClick={handleStart}
                className={cn(
                  'w-full py-3.5 text-sm font-semibold uppercase tracking-wider',
                  examChrome.btnSolid,
                  'disabled:cursor-not-allowed disabled:opacity-40',
                )}
              >
                {activeSession && activeSession.remainingMs > 0
                  ? 'Tiếp tục làm bài'
                  : 'Bắt đầu làm bài'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results' && score) {
    return (
      <div className={cn(EXAM_ROOT, 'overflow-y-auto bg-muted/40')}>
        <div className={cn('px-4 py-4 text-center md:px-8', examChrome.header)}>
          <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', examChrome.eyebrow)}>
            Kết quả bài thi
          </p>
          <p className="mt-3 font-mono text-5xl font-bold tabular-nums">{score.total}</p>
          <p className={cn('mt-1 text-sm', examChrome.fgMuted)}>điểm tổng (thang 100)</p>
          <p className="mt-2 text-base font-medium">{examTitle}</p>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 pb-12 md:px-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setPhase('intro');
                setScore(null);
                setDetails([]);
                setSessionId(null);
                autoSubmittedRef.current = false;
              }}
              className={cn('px-5 py-2.5 text-sm font-semibold', examChrome.btnSolid)}
            >
              Thi lại
            </button>
            <Link
              to={paths.student.jlptSim}
              className="inline-flex items-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Danh sách đề
            </Link>
          </div>

          <div className="border border-border bg-card">
            <div className="border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Phân tích theo phần
            </div>
            <div className="divide-y divide-border">
              {Object.entries(score.bySection).map(([section, pct]) => (
                <div key={section} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span className="font-medium text-foreground">{section}</span>
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {details.length > 0 && (
            <div className="border border-border bg-card">
              <div className="border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Chi tiết từng câu
              </div>
              <div className="divide-y divide-border">
                {details.map((d, i) => (
                  <div key={d.questionId} className="px-4 py-3 text-sm">
                    <span className="font-mono text-muted-foreground">#{i + 1}</span>
                    <span
                      className={cn(
                        'ml-3 font-semibold uppercase tracking-wide',
                        d.isCorrect ? 'text-emerald-700' : 'text-destructive',
                      )}
                    >
                      {d.isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                    {!d.isCorrect && d.explanation && (
                      <p className="mt-2 border-l-2 border-primary/30 pl-3 text-muted-foreground">
                        {d.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <McqExamShell
      idPrefix="jlpt"
      eyebrow={`Đang làm bài · ${examMeta.jlptLevel}`}
      title={examTitle}
      questions={questions}
      answers={answers}
      onSelectAnswer={selectAnswer}
      highlightIndex={highlightIndex}
      onHighlightIndex={setHighlightIndex}
      disabled={isTimeUp || loading}
      topBanner={
        isTimeUp ? (
          <div className="border-b border-amber-600 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950">
            Đã hết giờ — đang nộp bài…
          </div>
        ) : undefined
      }
      headerExtra={
        <>
          <div
            className={cn(
              'flex items-center gap-2 rounded-md border px-4 py-2 font-mono text-lg font-bold tabular-nums tracking-wider',
              timerUrgent
                ? 'border-amber-300 bg-amber-600 text-white'
                : examChrome.timer,
            )}
          >
            <Clock className="h-4 w-4 shrink-0 opacity-80" />
            {formatCountdown(remainingMs)}
          </div>
          <div className={cn('text-right text-xs', examChrome.fgMuted)}>
            <p>{durationMinutes} phút</p>
            <p className="mt-0.5 font-mono tabular-nums">
              {answeredCount}/{questions.length} đã trả lời
            </p>
          </div>
        </>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-start gap-2 text-sm">
            {!allAnswered && (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
            )}
            <p className={examChrome.fgSoft}>
              <span className={cn('font-mono font-semibold', examChrome.fg)}>
                {answeredCount}
              </span>
              <span className={examChrome.fgMuted}> / </span>
              <span className="font-mono">{questions.length}</span>
              <span className="ml-1">câu đã chọn</span>
              {!allAnswered && (
                <span className="ml-2 text-amber-200">
                  — còn {questions.length - answeredCount} câu
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            disabled={loading || !allAnswered || isTimeUp}
            onClick={handleSubmitClick}
            className={cn(
              'min-w-[10rem] rounded-md border px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors',
              allAnswered ? examChrome.btnOnChrome : examChrome.btnOnChromeDisabled,
            )}
          >
            Nộp bài
          </button>
        </div>
      }
    />
  );
}
