import { useMemo } from 'react';

import { cn } from '@/lib/utils';

export type McqExamQuestion = {
  id: string;
  questionText: string;
  options?: Array<{ label: string; text: string }> | null;
  section?: string | null;
  questionCategory?: string | null;
};

const SECTION_LABELS: Record<string, string> = {
  mini_test_vocab: 'Từ vựng',
  mini_test_vocab_phrase: 'Cụm từ',
  mini_test_kanji: 'Kanji',
};

function normalizeSectionKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function sectionLabelForQuestion(q: McqExamQuestion): string {
  const raw = q.section?.trim() || q.questionCategory?.trim();
  if (!raw) return 'Tổng hợp';
  return SECTION_LABELS[normalizeSectionKey(raw)] ?? raw;
}

export function groupQuestionsBySection(questions: McqExamQuestion[]) {
  const map = new Map<string, McqExamQuestion[]>();
  for (const q of questions) {
    const key = sectionLabelForQuestion(q);
    const list = map.get(key) ?? [];
    list.push(q);
    map.set(key, list);
  }
  return [...map.entries()];
}

export function questionDomId(prefix: string, index: number) {
  return `${prefix}-q-${index + 1}`;
}

export const EXAM_ROOT = 'flex h-full min-h-0 w-full flex-col';

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

  let globalIndex = 0;

  return (
    <div
      className={cn(
        embedded
          ? 'flex flex-col overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm'
          : cn(EXAM_ROOT, 'bg-muted/50'),
      )}
    >
      <header className="shrink-0 border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 md:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
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
            'hidden w-52 shrink-0 flex-col border-r border-border bg-[var(--nc-sidebar)] lg:flex xl:w-56',
            embedded ? 'max-h-[70vh] overflow-y-auto' : 'min-h-0',
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto py-4 pl-3 pr-2">
            <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Điều hướng
            </p>
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
                          'flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors',
                          isHighlight && 'ring-2 ring-primary ring-offset-1',
                          answered
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
                        )}
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
            'min-w-0 flex-1 scroll-smooth bg-background',
            embedded ? 'max-h-[70vh] overflow-y-auto' : 'min-h-0 overflow-y-auto',
          )}
        >
          {topBanner}
          <div className="border-b border-border bg-muted/40 px-4 py-2 lg:hidden">
            <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => scrollToQuestion(idx)}
                  className={cn(
                    'flex h-7 min-w-7 items-center justify-center rounded border text-[10px] font-semibold tabular-nums',
                    answers[q.id]
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground',
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
                <div className="rounded-t-md border-l-4 border-primary bg-primary px-4 py-3 text-primary-foreground">
                  <h2 className="font-jp text-sm font-medium leading-snug md:text-base">
                    {sectionName}
                  </h2>
                </div>

                <div className="rounded-b-md border border-t-0 border-border bg-card">
                  {sectionQs.map((q, qIdx) => {
                    const idx = globalIndex;
                    globalIndex += 1;
                    const opts = q.options ?? [];
                    const selected = answers[q.id];

                    return (
                      <article
                        key={q.id}
                        id={questionDomId(idPrefix, idx)}
                        className={cn(
                          'scroll-mt-28 border-b border-border px-4 py-5 last:border-b-0',
                          qIdx % 2 === 1 && 'bg-muted/30',
                        )}
                      >
                        <div className="mb-4 flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
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
                                  ? 'border-primary/40 bg-primary/10'
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

      <footer className="shrink-0 border-t border-primary/20 bg-primary text-primary-foreground">
        {footer}
      </footer>
    </div>
  );
}
