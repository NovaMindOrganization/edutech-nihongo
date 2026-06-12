import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LessonContext } from '@/features/learn/context/lesson-context';
import { examChrome } from '@/features/student/components/exam-shell-theme';
import {
  McqExamShell,
  type McqExamQuestion,
} from '@/features/student/components/mcq-exam-shell';
import {
  getLesson,
  getMiniTest,
  submitMiniTest,
} from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

export function MiniTestView() {
  const { lessonId = '' } = useParams();
  const lessonData = useContext(LessonContext);
  const [title, setTitle] = useState(lessonData?.lesson.title ?? '');
  const [passThreshold, setPassThreshold] = useState(
    lessonData?.lesson.passThreshold ?? 70,
  );
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<McqExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    passThreshold: number;
  } | null>(null);

  useEffect(() => {
    if (lessonData) {
      setTitle(lessonData.lesson.title);
      setPassThreshold(lessonData.lesson.passThreshold);
      return;
    }

    getLesson(lessonId)
      .then((d) => {
        setTitle(d.lesson.title);
        setPassThreshold(d.lesson.passThreshold);
      })
      .catch(() => {});
  }, [lessonId, lessonData]);

  useEffect(() => {
    getMiniTest(lessonId)
      .then((data) => {
        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setLoadError(false);
      })
      .catch((e) => {
        setLoadError(true);
        toast.error(e instanceof Error ? e.message : 'Không tải MiniTest');
      });
  }, [lessonId]);

  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const lessonBackPath = paths.learn.lessonGrammar(lessonId);

  async function handleSubmit() {
    if (!allAnswered) {
      toast.error(`Còn ${questions.length - answeredCount} câu chưa trả lời`);
      return;
    }
    if (!confirm('Xác nhận nộp MiniTest?')) return;

    setLoading(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      }));
      if (!sessionId) {
        toast.error('Phiên MiniTest không hợp lệ — tải lại trang');
        return;
      }
      const data = await submitMiniTest(lessonId, sessionId, payload);
      setResult({
        score: data.score,
        passed: data.passed,
        passThreshold: data.passThreshold,
      });
      setResultOpen(true);
      if (data.passed) toast.success('Vượt MiniTest — bài tiếp theo đã mở');
      else toast.error(`Chưa đạt — cần ≥ ${data.passThreshold}%`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nộp bài thất bại');
    } finally {
      setLoading(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Không tải được MiniTest.</p>
        <Link
          to={lessonBackPath}
          className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Về bài học
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">Đang tải câu hỏi…</p>;
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to={lessonBackPath}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Về nội dung bài học
        </Link>
      </div>

      <McqExamShell
        variant="embedded"
        idPrefix="minitest"
        eyebrow="MiniTest · Kiểm tra bài học"
        title={title || 'Bài học'}
        questions={questions}
        answers={answers}
        onSelectAnswer={(id, value) =>
          setAnswers((prev) => ({ ...prev, [id]: value }))
        }
        highlightIndex={highlightIndex}
        onHighlightIndex={setHighlightIndex}
        disabled={loading}
        headerExtra={
          <div className={cn('text-right text-xs', examChrome.fgMuted)}>
            <p>Ngưỡng đạt</p>
            <p className={cn('mt-0.5 font-mono text-lg font-bold tabular-nums', examChrome.fg)}>
              {passThreshold}%
            </p>
            <p className="mt-1 font-mono tabular-nums">
              {answeredCount}/{questions.length} đã trả lời
            </p>
          </div>
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
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
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={lessonBackPath}
                className={cn(
                  'inline-flex items-center text-xs font-medium uppercase tracking-wider hover:opacity-90',
                  examChrome.fgMuted,
                )}
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Về bài học
              </Link>
              <button
                type="button"
                disabled={loading || !allAnswered}
                onClick={handleSubmit}
                className={cn(
                  'min-w-[10rem] rounded-md border px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors',
                  allAnswered ? examChrome.btnOnChrome : examChrome.btnOnChromeDisabled,
                )}
              >
                {loading ? 'Đang nộp…' : 'Nộp bài'}
              </button>
            </div>
          </div>
        }
      />

      <Dialog open={resultOpen} onOpenChange={setResultOpen} title="Kết quả MiniTest">
        {result && (
          <div className="space-y-3">
            <p className="font-display text-3xl font-bold text-primary">
              {result.score}%
            </p>
            <p className="text-sm text-muted-foreground">
              Ngưỡng đạt: {result.passThreshold}%
            </p>
            <p className="text-sm">
              {result.passed
                ? 'Đạt — bài tiếp theo đã được mở khóa.'
                : 'Chưa đạt — ôn lại nội dung bài và thử lại.'}
            </p>
            <Link to={lessonBackPath}>
              <Button className="w-full" variant={result.passed ? 'default' : 'outline'}>
                Về bài học
              </Button>
            </Link>
          </div>
        )}
      </Dialog>
    </>
  );
}
