import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { getStudySet } from '../services/studySetApi';
import type { StudySetQuizPayload, StudySetQuizQuestion } from '../types/study-set.types';

export function StudySetQuiz({
  studySetId,
  initialQuiz,
  quizGeneratedAt,
  onClose,
}: {
  studySetId: string;
  initialQuiz: StudySetQuizPayload | null;
  quizGeneratedAt: string | null;
  onClose: () => void;
}) {
  const [quiz, setQuiz] = useState<StudySetQuizPayload | null>(initialQuiz);
  const [loading, setLoading] = useState(
    !initialQuiz?.questions?.length && !quizGeneratedAt,
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialQuiz?.questions?.length) return;
    if (quizGeneratedAt && !initialQuiz?.questions?.length) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const poll = async () => {
      for (let i = 0; i < 12 && !cancelled; i += 1) {
        await new Promise((r) => setTimeout(r, 2500));
        try {
          const detail = await getStudySet(studySetId);
          if (detail.quiz?.questions?.length) {
            setQuiz(detail.quiz);
            setLoading(false);
            return;
          }
          if (detail.quizGeneratedAt) {
            setLoading(false);
            return;
          }
        } catch {
          /* retry */
        }
      }
      if (!cancelled) setLoading(false);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [studySetId, initialQuiz, quizGeneratedAt]);

  const questions: StudySetQuizQuestion[] = quiz?.questions ?? [];
  const q = questions[index];

  function submitChoice(choice: number) {
    if (picked !== null || !q) return;
    setPicked(choice);
    if (choice === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index >= questions.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/95 p-6">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tạo quiz bằng AI…</p>
        <Button variant="ghost" onClick={onClose}>
          Đóng
        </Button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/95 p-6 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          Quiz chưa sẵn sàng. Bộ học cần được duyệt và có đủ nội dung — thử lại sau vài phút.
        </p>
        <Button onClick={onClose}>Đóng</Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-6">
        <p className="font-display text-2xl font-bold">Kết quả</p>
        <p className="mt-2 text-lg">
          {score}/{questions.length} đúng
        </p>
        <Button className="mt-6" onClick={onClose}>
          Đóng
        </Button>
      </div>
    );
  }

  if (!q) return null;

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">
          Quiz {index + 1}/{questions.length} · Đúng: {score}
        </p>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">
          <X className="size-5" />
        </Button>
      </div>
      <div className="h-1 shrink-0 bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          <p className="shrink-0 text-base font-medium leading-snug sm:text-lg">{q.prompt}</p>
          <div className="grid shrink-0 gap-2 pb-4">
            {q.choices.map((choice, i) => (
              <button
                key={`${q.id}-${i}`}
                type="button"
                disabled={picked !== null}
                onClick={() => submitChoice(i)}
                className={cn(
                  'rounded-lg border border-border px-4 py-3 text-left text-sm font-medium shadow-premium card-lift transition-all',
                  'whitespace-normal break-words',
                  picked === null && 'hover:-translate-y-0.5 hover:border-primary hover:bg-muted/50 hover:shadow-premium card-lift',
                  picked !== null && i === q.answer && 'border-emerald-500 bg-emerald-50',
                  picked !== null &&
                    picked === i &&
                    i !== q.answer &&
                    'border-destructive bg-destructive/10',
                )}
              >
                <span className="mr-2 font-semibold text-muted-foreground">
                  {String.fromCharCode(65 + i)}.
                </span>
                {choice}
              </button>
            ))}
          </div>
          {picked !== null && q.explanation && (
            <p className="shrink-0 rounded-lg border border-border bg-muted/60 p-3 text-sm font-medium text-muted-foreground shadow-premium card-lift">
              {q.explanation}
            </p>
          )}
        </div>
        {picked !== null && (
          <div className="shrink-0 border-t p-4">
            <Button className="w-full max-w-lg mx-auto block" onClick={next}>
              {index >= questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
