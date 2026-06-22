import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import {
  EXAM_ROOT,
  groupQuestionsBySection,
  questionDomId,
  type McqExamQuestion,
} from './mcq-exam-utils';

export type { McqExamQuestion } from './mcq-exam-utils';

type McqExamShellProps = {
  idPrefix: string;
  eyebrow: string;
  title: string;
  questions: McqExamQuestion[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, value: string) => void;
  highlightIndex: number;
  onHighlightIndex: (index: number) => void;
  headerExtra?: React.ReactNode;
  footer: React.ReactNode;
  disabled?: boolean;
  topBanner?: React.ReactNode;
  /** embedded = trong layout học; fullscreen = phòng thi JLPT */
  variant?: 'fullscreen' | 'embedded';
};

export function McqExamShell({
  idPrefix,
  eyebrow,
  title,
  questions,
  answers,
  onSelectAnswer,
  highlightIndex,
  onHighlightIndex,
  headerExtra,
  footer,
  disabled = false,
  topBanner,
  variant = 'fullscreen',
}: McqExamShellProps) {
  const embedded = variant === 'embedded';
  const sections = useMemo(() => groupQuestionsBySection(questions), [questions]);
  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;

  const questionIndexById = useMemo(() => {
    const map = new Map<string, number>();
    questions.forEach((q, i) => map.set(q.id, i));
    return map;
  }, [questions]);

  function scrollToQuestion(index: number) {
    onHighlightIndex(index);
    document.getElementById(questionDomId(idPrefix, index))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <div
      className={cn(
        embedded
          ? 'flex flex-col overflow-hidden rounded-xl border border-border bg-muted/30 shadow-premium card-lift'
          : cn(EXAM_ROOT, 'bg-background'),
      )}
    >
      <header
        className={cn(
          'shrink-0',
          embedded
            ? 'border-b border-primary/20 bg-primary text-primary-foreground'
            : 'border-b border-border bg-surface-paper text-foreground',
        )}
      >
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 md:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-[10px] font-semibold uppercase tracking-[0.18em]',
                embedded ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              {eyebrow}
            </p>
            <h1 className="truncate font-display text-sm font-semibold md:text-base">{title}</h1>
          </div>
          {headerExtra}
        </div>
      </header>

      <div className={cn('flex', embedded ? 'min-h-[28rem]' : 'min-h-0 flex-1')}>
        <aside
          className={cn(
            'hidden w-52 shrink-0 flex-col border-r lg:flex xl:w-56',
            embedded ? 'border-border bg-[var(--surface-sidebar)]' : 'border-border bg-surface-paper',
            embedded ? 'max-h-[70vh] overflow-y-auto' : 'min-h-0',
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto py-4 pl-3 pr-2">
            <div className="mb-4 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Điều hướng câu hỏi
              </p>
              <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                {answeredCount}/{questions.length} đã trả lời
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-ink" />
                  Đã chọn
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm border border-border bg-surface-paper" />
                  Trống
                </span>
              </div>
            </div>
            {sections.map(([sectionName, sectionQs], sectionIdx) => (
              <div key={sectionName} className="mb-4">
                <p className="mb-2 truncate px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
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
                          'flex h-11 w-11 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors lg:h-8 lg:w-8',
                          isHighlight &&
                            (embedded
                              ? 'ring-2 ring-primary ring-offset-1'
                              : 'ring-2 ring-ink ring-offset-1'),
                          answered
                            ? embedded
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-ink text-background'
                            : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground',
                        )}
                        aria-label={`Đi tới câu ${idx + 1}`}
                        title={`Câu ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                {sectionIdx < sections.length - 1 && (
                  <div className="mt-3 border-b border-border" />
                )}
              </div>
            ))}
          </div>
        </aside>

        <main
          className={cn(
            'min-w-0 flex-1 scroll-smooth',
            embedded ? 'bg-background' : 'bg-surface-paper',
            embedded ? 'max-h-[70vh] overflow-y-auto' : 'min-h-0 overflow-y-auto',
          )}
        >
          {topBanner}
          <div
            className={cn(
              'border-b px-4 py-2 lg:hidden',
              embedded ? 'border-border bg-muted/40' : 'border-border bg-surface-paper',
            )}
          >
            <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => scrollToQuestion(idx)}
                  className={cn(
                    'flex h-11 min-w-11 items-center justify-center rounded border text-[10px] font-semibold tabular-nums sm:h-10 sm:min-w-10',
                    answers[q.id]
                      ? embedded
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-ink text-background'
                      : 'border-border bg-card text-muted-foreground',
                  )}
                  aria-label={`Đi tới câu ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              'px-4 py-6 md:px-8 md:py-8 lg:px-10',
              !embedded && 'mx-auto w-full max-w-5xl',
            )}
          >
            {sections.map(([sectionName, sectionQs]) => (
              <section key={sectionName} className="mb-10">
                <div
                  className={cn(
                    'rounded-t-md border px-4 py-3',
                    embedded
                      ? 'border-l-4 border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-foreground',
                  )}
                >
                  <h2 className="font-jp text-sm font-semibold leading-snug md:text-base">
                    {sectionName}
                  </h2>
                </div>

                <div
                  className={cn(
                    'rounded-b-md border border-t-0 bg-card',
                    embedded ? 'border-border' : 'border-border',
                  )}
                >
                  {sectionQs.map((q, qIdx) => {
                    const idx = questionIndexById.get(q.id) ?? 0;
                    const opts = q.options ?? [];
                    const selected = answers[q.id];

                    return (
                      <article
                        key={q.id}
                        id={questionDomId(idPrefix, idx)}
                        className={cn(
                          'scroll-mt-28 border-b px-4 py-5 last:border-b-0 md:px-6',
                          embedded ? 'border-border' : 'border-border',
                          qIdx % 2 === 1 && (embedded ? 'bg-muted/30' : 'bg-muted/60'),
                        )}
                      >
                        <div className="mb-4 flex gap-3">
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded border text-[11px] font-bold',
                              embedded
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-surface-paper text-foreground',
                            )}
                          >
                            {idx + 1}
                          </span>
                          <p className="min-w-0 flex-1 font-jp text-[15px] leading-relaxed text-foreground md:text-base">
                            {q.questionText}
                          </p>
                        </div>

                        <div className="ml-9 space-y-1">
                          {opts.map((opt) => (
                            <label
                              key={opt.label}
                              className={cn(
                                'flex items-start gap-3 rounded-md border px-3 py-2.5 transition-colors',
                                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                                selected === opt.text
                                  ? embedded
                                    ? 'border-primary/40 bg-primary/10'
                                    : 'border-border bg-muted'
                                  : 'border-transparent hover:border-border hover:bg-muted/50',
                              )}
                            >
                              <input
                                type="radio"
                                name={`${idPrefix}-q-${q.id}`}
                                disabled={disabled}
                                className="mt-1 h-3.5 w-3.5 shrink-0 accent-primary"
                                checked={selected === opt.text}
                                onChange={() => onSelectAnswer(q.id, opt.text)}
                              />
                              <span className="font-jp text-sm leading-relaxed text-foreground">
                                <span className="mr-2 inline-block min-w-[1.25rem] font-mono text-xs font-bold text-muted-foreground">
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

      <footer
        className={cn(
          'shrink-0',
          embedded
            ? 'border-t border-primary/20 bg-primary text-primary-foreground'
            : 'border-t border-border bg-surface-paper text-foreground',
        )}
      >
        {footer}
      </footer>
    </div>
  );
}
