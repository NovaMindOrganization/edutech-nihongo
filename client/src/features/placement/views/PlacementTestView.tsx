import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useAuthStore } from '@/features/auth';
import { isStaffRole } from '@/features/auth/utils/auth-routes';
import { examChrome } from '@/features/student/components/exam-shell-theme';
import {
  McqExamShell,
  type McqExamQuestion,
} from '@/features/student/components/mcq-exam-shell';
import {
  startPlacementTest,
  submitPlacementTest,
} from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

export function PlacementTestView() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [questions, setQuestions] = useState<McqExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitPlacementTest>> | null>(
    null,
  );

  useEffect(() => {
    startPlacementTest()
      .then(setQuestions)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải placement test'));
  }, []);

  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  async function handleSubmit() {
    if (!allAnswered) {
      toast.error(`Còn ${questions.length - answeredCount} câu chưa trả lời`);
      return;
    }
    if (!confirm('Xác nhận nộp bài kiểm tra trình độ?')) return;

    setLoading(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      }));
      const data = await submitPlacementTest(payload);
      setResult(data);
      setResultOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nộp bài thất bại');
    } finally {
      setLoading(false);
    }
  }

  if (questions.length === 0) {
    return <p className="text-muted-foreground">Đang tải câu hỏi…</p>;
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to={user ? paths.learn.hub : paths.home}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          {user ? 'Về khóa học' : 'Về trang chủ'}
        </Link>
      </div>

      <McqExamShell
        variant="embedded"
        idPrefix="placement"
        eyebrow="Placement Test · Kiểm tra trình độ"
        title="Xác định trình độ JLPT"
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
            <p>{questions.length} câu hỏi</p>
            <p className="mt-1 font-mono tabular-nums">
              {answeredCount}/{questions.length} đã trả lời
            </p>
            {user ? (
              <p className="mt-1 truncate max-w-[12rem]">{user.email}</p>
            ) : (
              <p className="mt-1">Không cần đăng nhập</p>
            )}
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
              {user ? (
                isStaffRole(user.role) ? (
                  <Link
                    to={paths.admin.dashboard}
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider hover:opacity-90',
                      examChrome.fgMuted,
                    )}
                  >
                    Quản trị
                  </Link>
                ) : null
              ) : (
                <Link
                  to={paths.login}
                  state={{ returnTo: paths.placementTest }}
                  className={cn(
                    'text-xs font-medium uppercase tracking-wider hover:opacity-90',
                    examChrome.fgMuted,
                  )}
                >
                  Đăng nhập
                </Link>
              )}
              <button
                type="button"
                disabled={loading || !allAnswered}
                onClick={handleSubmit}
                className={cn(
                  'min-w-[10rem] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider',
                  allAnswered ? examChrome.btnOnChrome : examChrome.btnOnChromeDisabled,
                )}
              >
                {loading ? 'Đang chấm…' : 'Nộp bài'}
              </button>
            </div>
          </div>
        }
      />

      <Dialog open={resultOpen} onOpenChange={setResultOpen} title="Kết quả Placement">
        {result && (
          <div className="space-y-4">
            <p className="font-display text-2xl font-bold text-primary">
              {result.recommendedLevel}
            </p>
            {result.roadmap ? (
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
                <p className="font-medium">{result.roadmap.courseTitle}</p>
                {result.roadmap.startLessonTitle && (
                  <p className="mt-1 text-muted-foreground">
                    Bắt đầu: {result.roadmap.startLessonTitle}
                  </p>
                )}
                {user && result.enrolled && (
                  <p className="mt-2 text-emerald-600">Đã ghi danh khóa phù hợp.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có khóa {result.recommendedLevel} — xem danh sách khóa hiện có.
              </p>
            )}
            <Button
              className="w-full"
              onClick={() => {
                setResultOpen(false);
                if (result.roadmap?.startLessonId) {
                  navigate(paths.learn.lesson(result.roadmap.startLessonId));
                } else if (result.roadmap?.courseId) {
                  navigate(paths.learn.course(result.roadmap.courseId));
                } else {
                  navigate(paths.learn.hub);
                }
              }}
            >
              {result.roadmap?.startLessonId ? 'Bắt đầu học' : 'Xem khóa học'}
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
