import { AlertTriangle, ArrowLeft, Clock } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ApiRequestError } from '@/services/httpClient';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';
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

const EXAM_ROOT = 'flex h-full min-h-0 w-full flex-col';

function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function groupBySection(questions: ApiQuestion[]) {
  const map = new Map<string, ApiQuestion[]>();
  for (const q of questions) {
    const key = q.section?.trim() || 'Tổng hợp';
    const list = map.get(key) ?? [];
    list.push(q);
    map.set(key, list);
  }
  return [...map.entries()];
}

function questionDomId(index: number) {
  return `jlpt-q-${index + 1}`;
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

  const questionIndexById = useMemo(() => {
    const map = new Map<string, number>();
    questions.forEach((q, i) => map.set(q.id, i));
    return map;
  }, [questions]);

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

  const sections = useMemo(() => groupBySection(questions), [questions]);
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

  function scrollToQuestion(index: number) {
    setHighlightIndex(index);
    document.getElementById(questionDomId(index))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  if (!examMeta) {
    return (
      <div className={cn(EXAM_ROOT, 'items-center justify-center bg-slate-100 dark:bg-zinc-950')}>
        <p className="text-sm tracking-wide text-slate-500">Đang tải đề thi…</p>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className={cn(EXAM_ROOT, 'overflow-y-auto bg-slate-100 dark:bg-zinc-950')}>
        <div className="border-b border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 md:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Thi thử JLPT
          </p>
          <h1 className="mt-1 font-display text-lg font-semibold tracking-tight md:text-xl">
            {examMeta.title}
          </h1>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-6">
          <Link
            to={paths.student.jlptSim}
            className="mb-8 inline-flex items-center text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Thoát — danh sách đề
          </Link>

          <div className="border border-slate-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800/80">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Thông tin đề thi
              </p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Cấp độ</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {examMeta.jlptLevel}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Thời gian</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {examMeta.durationMinutes} phút
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Số câu</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {examMeta.questionCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Lượt thi</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {examMeta.myAttemptCount}/{examMeta.maxAttempts}
                    {examMeta.attemptsRemaining > 0
                      ? ` (còn ${examMeta.attemptsRemaining})`
                      : ' (đã hết)'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4 px-6 py-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-800 dark:text-slate-200">Quy chế làm bài</p>
              <ul className="list-inside list-decimal space-y-2 marker:text-slate-400">
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
              <div className="mx-6 border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-300">
                Bạn đã dùng hết {examMeta.maxAttempts} lượt thi cho đề này.
              </div>
            )}

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 dark:border-zinc-700 dark:bg-zinc-800/50">
              <button
                type="button"
                disabled={
                  loading ||
                  examMeta.questionCount === 0 ||
                  (!examMeta.canStart && !(activeSession && activeSession.remainingMs > 0))
                }
                onClick={handleStart}
                className={cn(
                  'w-full border border-slate-900 bg-slate-900 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors',
                  'hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40',
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
      <div className={cn(EXAM_ROOT, 'overflow-y-auto bg-slate-100 dark:bg-zinc-950')}>
        <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 text-center text-slate-100 md:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Kết quả bài thi
          </p>
          <p className="mt-3 font-mono text-5xl font-bold tabular-nums">{score.total}</p>
          <p className="mt-1 text-sm text-slate-400">điểm tổng (thang 100)</p>
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
              className="border border-slate-800 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Thi lại
            </button>
            <Link
              to={paths.student.jlptSim}
              className="inline-flex items-center border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-slate-300"
            >
              Danh sách đề
            </Link>
          </div>

          <div className="border border-slate-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:border-zinc-700 dark:bg-zinc-800">
              Phân tích theo phần
            </div>
            <div className="divide-y divide-slate-200 dark:divide-zinc-700">
              {Object.entries(score.bySection).map(([section, pct]) => (
                <div key={section} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{section}</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {details.length > 0 && (
            <div className="border border-slate-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:border-zinc-700 dark:bg-zinc-800">
                Chi tiết từng câu
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {details.map((d, i) => (
                  <div key={d.questionId} className="px-4 py-3 text-sm">
                    <span className="font-mono text-slate-500">#{i + 1}</span>
                    <span
                      className={cn(
                        'ml-3 font-semibold uppercase tracking-wide',
                        d.isCorrect ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {d.isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                    {!d.isCorrect && d.explanation && (
                      <p className="mt-2 border-l-2 border-slate-300 pl-3 text-slate-600 dark:text-slate-400">
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

  let globalIndex = 0;

  return (
    <div className={cn(EXAM_ROOT, 'bg-slate-200 dark:bg-zinc-900')}>
      {/* Top exam bar */}
      <header className="shrink-0 border-b border-slate-700 bg-slate-900 text-slate-100">
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 md:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Đang làm bài · {examMeta.jlptLevel}
            </p>
            <h1 className="truncate font-display text-sm font-semibold md:text-base">{examTitle}</h1>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 border px-4 py-2 font-mono text-lg font-bold tabular-nums tracking-wider',
              timerUrgent
                ? 'border-amber-500 bg-amber-950 text-amber-300'
                : 'border-slate-600 bg-slate-950 text-slate-100',
            )}
          >
            <Clock className="h-4 w-4 shrink-0 opacity-80" />
            {formatCountdown(remainingMs)}
          </div>

          <div className="text-right text-xs text-slate-400">
            <p>{durationMinutes} phút</p>
            <p className="mt-0.5 font-mono tabular-nums">
              {answeredCount}/{questions.length} đã trả lời
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="hidden min-h-0 w-52 shrink-0 flex-col border-r border-slate-300 bg-slate-100 lg:flex xl:w-56 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="min-h-0 flex-1 overflow-y-auto py-4 pl-3 pr-2">
            <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Điều hướng
            </p>
            {sections.map(([sectionName, sectionQs], sectionIdx) => (
              <div key={sectionName} className="mb-4">
                <p className="mb-2 truncate px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {sectionName}
                </p>
                <div className="flex flex-wrap gap-1">
                  {sectionQs.map((q) => {
                    const idx = questionIndexById.get(q.id) ?? 0;
                    const answered = Boolean(answers[q.id]);
                    const isHighlight = idx === highlightIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => scrollToQuestion(idx)}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center border text-xs font-semibold tabular-nums transition-colors',
                          isHighlight && 'ring-2 ring-slate-900 ring-offset-1 dark:ring-slate-300',
                          answered
                            ? 'border-slate-800 bg-slate-800 text-white'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-300',
                        )}
                        title={`Câu ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                {sectionIdx < sections.length - 1 && (
                  <div className="mt-3 border-b border-slate-200 dark:border-zinc-700" />
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Question paper */}
        <main className="min-w-0 flex-1 overflow-y-auto scroll-smooth bg-white dark:bg-zinc-950">
          {isTimeUp && (
            <div className="border-b border-amber-600 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950">
              Đã hết giờ — đang nộp bài…
            </div>
          )}
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => scrollToQuestion(idx)}
                  className={cn(
                    'flex h-7 min-w-7 items-center justify-center border text-[10px] font-semibold tabular-nums',
                    answers[q.id]
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-300 bg-white text-slate-600',
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-6 md:px-8 md:py-8 lg:px-10">
            {sections.map(([sectionName, sectionQs]) => (
              <section key={sectionName} className="mb-10">
                <div className="border-l-4 border-slate-700 bg-slate-700 px-4 py-3 text-slate-100">
                  <h2 className="font-jp text-sm font-medium leading-snug md:text-base">
                    {sectionName}
                  </h2>
                </div>

                <div className="border border-t-0 border-slate-200 dark:border-zinc-700">
                  {sectionQs.map((q, qIdx) => {
                    const idx = globalIndex;
                    globalIndex += 1;
                    const opts = (q.options as Array<{ label: string; text: string }>) ?? [];
                    const selected = answers[q.id];

                    return (
                      <article
                        key={q.id}
                        id={questionDomId(idx)}
                        className={cn(
                          'scroll-mt-28 border-b border-slate-200 px-4 py-5 last:border-b-0 dark:border-zinc-800',
                          qIdx % 2 === 1 && 'bg-slate-50/80 dark:bg-zinc-900/50',
                        )}
                      >
                        <div className="mb-4 flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-slate-800 text-[11px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <p className="min-w-0 flex-1 font-jp text-[15px] leading-relaxed text-slate-900 md:text-base dark:text-slate-100">
                            {q.questionText}
                          </p>
                        </div>

                        <div className="ml-9 space-y-1">
                          {opts.map((opt) => (
                            <label
                              key={opt.label}
                              className={cn(
                                'flex items-start gap-3 border px-3 py-2.5 transition-colors',
                                isTimeUp || loading
                                  ? 'cursor-not-allowed opacity-60'
                                  : 'cursor-pointer',
                                selected === opt.text
                                  ? 'border-slate-800 bg-slate-100 dark:border-slate-400 dark:bg-zinc-800'
                                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900',
                              )}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                disabled={isTimeUp || loading}
                                className="mt-1 h-3.5 w-3.5 shrink-0 border-slate-400 accent-slate-800"
                                checked={selected === opt.text}
                                onChange={() => selectAnswer(q.id, opt.text)}
                              />
                              <span className="font-jp text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                                <span className="mr-2 inline-block min-w-[1.25rem] font-mono text-xs font-bold text-slate-500">
                                  {opt.label}
                                </span>
                                {opt.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="h-20" aria-hidden />
        </main>
      </div>

      {/* Submit bar */}
      <footer className="shrink-0 border-t border-slate-700 bg-slate-900 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-start gap-2 text-sm">
            {!allAnswered && (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            )}
            <p className="text-slate-300">
              <span className="font-mono font-semibold text-white">{answeredCount}</span>
              <span className="text-slate-500"> / </span>
              <span className="font-mono">{questions.length}</span>
              <span className="ml-1">câu đã chọn</span>
              {!allAnswered && (
                <span className="ml-2 text-amber-400/90">
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
              'min-w-[10rem] border px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors',
              allAnswered
                ? 'border-white bg-white text-slate-900 hover:bg-slate-100'
                : 'cursor-not-allowed border-slate-600 bg-slate-800 text-slate-500',
            )}
          >
            Nộp bài
          </button>
        </div>
      </footer>
    </div>
  );
}
