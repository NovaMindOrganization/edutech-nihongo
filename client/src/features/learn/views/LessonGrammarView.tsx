import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Lightbulb,
  Volume2,
} from 'lucide-react';

import { EmptyState, emptyStatePresets } from '@/components/usable/states';
import { Button } from '@/components/ui/button';
import type { JapaneseSegment } from '@/features/student/services/studentApi';
import { AddToNotebookButton } from '@/features/student/notebook/AddToNotebookButton';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';
import { useLessonData } from '../context/lesson-context';
import { GrammarDrillPanel } from '../components/grammar-drill-panel';
import { isIntroCourseLevel, speakingPassScoreForCourse } from '../utils/jpd1-speaking';

const PAGE_BG = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const WARNING_BG = '#FFF8E8';
const DIVIDER = '#EAECEF';

function FuriganaText({
  segments = [],
  className,
}: {
  segments?: JapaneseSegment[];
  className?: string;
}) {
  return (
    <span className={cn('font-jp leading-relaxed', className)}>
      {segments.map((segment, index) => {
        if ('kanji' in segment) {
          return (
            <ruby key={index} className="mx-[1px]">
              {segment.kanji}
              <rt className="text-[0.52em] font-normal text-muted-foreground">{segment.reading}</rt>
            </ruby>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </span>
  );
}

function segmentsToText(segments: JapaneseSegment[] = []) {
  return segments.map((segment) => ('kanji' in segment ? segment.kanji : segment.text)).join('');
}

type ParsedDialogueLine = {
  speaker: 'A' | 'B';
  segments: JapaneseSegment[];
};

const SPEAKER_LINE_RE = /^([ABＡＢ])\s*[：:]\s*(.*)$/s;

function parseDialogueExample(segments: JapaneseSegment[] = []): ParsedDialogueLine[] | null {
  const lines: ParsedDialogueLine[] = [];

  for (const segment of segments) {
    const raw = ('kanji' in segment ? segment.kanji : segment.text).trim();
    const match = raw.match(SPEAKER_LINE_RE);
    if (!match) return null;

    const speaker = match[1] === 'B' || match[1] === 'Ｂ' ? 'B' : 'A';
    const text = match[2].trim();
    if (!text) return null;

    lines.push({ speaker, segments: [{ text }] });
  }

  return lines.length >= 2 ? lines : null;
}

function GrammarDialogueExample({
  lines,
  exampleIndex,
  playingKey,
  speaking,
  onPlay,
}: {
  lines: ParsedDialogueLine[];
  exampleIndex: number;
  playingKey: string | null;
  speaking: boolean;
  onPlay: (segments: JapaneseSegment[], key: string) => void;
}) {
  return (
    <div className="space-y-4">
      {lines.map((line, lineIndex) => {
        const isLeft = line.speaker === 'A';
        const playKey = `${exampleIndex}-${lineIndex}`;

        return (
          <div
            key={playKey}
            className={cn('flex items-end gap-3', isLeft ? 'justify-start' : 'justify-end')}
          >
            {isLeft ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-tertiary font-display text-sm font-extrabold text-foreground shadow-sm">
                {line.speaker}
              </div>
            ) : null}

            <div
              className={cn(
                'max-w-[82%] rounded-xl border border-border bg-surface-paper px-4 py-3 shadow-sm',
                isLeft ? 'rounded-bl-md' : 'rounded-br-md bg-primary/10',
              )}
            >
              <div className="flex items-start gap-3">
                <p className="min-w-0 flex-1 font-jp text-[1.375rem] font-medium leading-[1.65] text-foreground">
                  <FuriganaText segments={line.segments} />
                </p>
                <AudioButton
                  disabled={speaking}
                  playing={playingKey === playKey}
                  label={`Nghe lời ${line.speaker}`}
                  onClick={() => onPlay(line.segments, playKey)}
                />
              </div>
            </div>

            {!isLeft ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary font-display text-sm font-extrabold text-foreground shadow-sm">
                {line.speaker}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function shuffleChoices(choices: string[], correctAnswer: number) {
  const items = choices.map((choice, index) => ({ choice, isCorrect: index === correctAnswer }));
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    choices: shuffled.map((item) => item.choice),
    correctIndex: shuffled.findIndex((item) => item.isCorrect),
  };
}

function buildCorrectFeedback(choice: string, usage: string | null, notes: string | null) {
  if (notes?.includes(choice)) {
    return `Chính xác rồi! ${notes} bạn nhé`;
  }
  if (notes?.trim()) {
    return `Chính xác rồi! ${choice} — ${notes} bạn nhé`;
  }
  if (usage?.trim()) {
    return `Chính xác rồi! ${choice} — ${usage} bạn nhé`;
  }
  return `Chính xác rồi! ${choice} bạn nhé`;
}

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

function ProgressBlocks({ percent, total }: { percent: number; total: number }) {
  const blocks = 8;
  const filled = Math.round((percent / 100) * blocks);

  return (
    <div className="flex gap-1" aria-hidden>
      {Array.from({ length: blocks }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 flex-1 rounded-sm transition-colors duration-500',
            i < filled ? 'bg-primary' : 'bg-[#E2E8F0]',
          )}
        />
      ))}
      <span className="sr-only">
        {percent}% of {total} grammar points
      </span>
    </div>
  );
}

function AudioButton({
  disabled,
  playing,
  onClick,
  label,
}: {
  disabled?: boolean;
  playing?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'group flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-foreground shadow-sm transition-all duration-200',
        'hover:scale-105 hover:bg-primary/10 hover:text-primary hover:shadow-md',
        'active:scale-95 disabled:opacity-40',
        playing && 'animate-pulse bg-primary/15 text-primary',
      )}
    >
      <Volume2 className="size-[18px]" strokeWidth={2} />
    </button>
  );
}

export function LessonGrammarView() {
  const { grammar, lesson } = useLessonData();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const isIntroCourse = isIntroCourseLevel(lesson.course.jlptLevel);
  const passScore = speakingPassScoreForCourse(lesson.course.jlptLevel);
  const { playTts, speaking } = useSpeech();
  const [grammarIndex, setGrammarIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [playingExampleKey, setPlayingExampleKey] = useState<string | null>(null);
  const [drillScores, setDrillScores] = useState<Record<number, number | null>>({});

  const currentGrammar = grammar[grammarIndex];

  useEffect(() => {
    if (!focusId || grammar.length === 0) return;
    const index = grammar.findIndex((g) => g.id === focusId);
    if (index >= 0) {
      setGrammarIndex(index);
      setAnswers({});
      setSubmitted(false);
      setDrillScores({});
      const next = new URLSearchParams(searchParams);
      next.delete('focus');
      setSearchParams(next, { replace: true });
    }
  }, [focusId, grammar, searchParams, setSearchParams]);

  const shuffledQuiz = useMemo(() => {
    const g = grammar[grammarIndex];
    if (!g?.quiz?.length) return [];
    return g.quiz.map((question) => shuffleChoices(question.choices, question.answer));
  }, [grammar, grammarIndex]);

  const score = useMemo(() => {
    if (!currentGrammar?.quiz) return 0;
    return shuffledQuiz.reduce(
      (total, question, index) => total + (answers[index] === question.correctIndex ? 1 : 0),
      0,
    );
  }, [answers, currentGrammar, shuffledQuiz]);

  const progressPercent = grammar.length
    ? Math.round(((grammarIndex + 1) / grammar.length) * 100)
    : 0;

  const hasQuiz = Boolean(currentGrammar?.quiz?.length);
  const drills = currentGrammar?.drills ?? [];
  const drillsRequired = isIntroCourse && drills.length > 0;
  const allDrillsPassed =
    !drillsRequired ||
    drills.every((_, i) => (drillScores[i] ?? 0) >= passScore);
  const canContinue = allDrillsPassed && (!hasQuiz || submitted);
  const quizPerfect = hasQuiz && submitted && score === currentGrammar?.quiz?.length;

  if (!currentGrammar) {
    return <EmptyState {...emptyStatePresets.grammar} />;
  }

  function resetQuizState() {
    setAnswers({});
    setSubmitted(false);
  }

  function goToGrammar(index: number) {
    setGrammarIndex(index);
    resetQuizState();
    setDrillScores({});
    setPlayingExampleKey(null);
  }

  function handleDrillScore(index: number, score: number) {
    setDrillScores((prev) => ({ ...prev, [index]: score }));
  }

  function handleSelectAnswer(questionIndex: number, choiceIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: choiceIndex }));
  }

  function handleContinue() {
    if (!canContinue || grammarIndex >= grammar.length - 1) return;
    goToGrammar(grammarIndex + 1);
  }

  async function handlePlayExample(segments: JapaneseSegment[], key: string) {
    const text = segmentsToText(segments);
    if (!text.trim()) return;
    setPlayingExampleKey(key);
    try {
      await playTts(text);
    } finally {
      setPlayingExampleKey(null);
    }
  }

  return (
    <div
      className="-mx-4 -mt-2 px-4 pb-10 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="mx-auto w-full max-w-[61.25rem]">
        {/* Progress */}
        <header className="mb-6 space-y-3 px-1">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              {grammarIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => goToGrammar(grammarIndex - 1)}
                  className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="size-4" strokeWidth={2} />
                  Grammar trước
                </button>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Grammar Progress
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AddToNotebookButton
                itemId={currentGrammar.id}
                itemType="grammar"
                lessonId={lesson.id}
                itemLabel={currentGrammar.pattern}
                compact
              />
              <p className="text-sm tabular-nums text-muted-foreground">
                <span className="font-semibold text-foreground">{progressPercent}%</span> Completed
              </p>
            </div>
          </div>
          <ProgressBlocks percent={progressPercent} total={grammar.length} />
          <p className="text-sm font-medium text-foreground">
            <span className="font-semibold tabular-nums">
              {grammarIndex + 1} / {grammar.length}
            </span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-muted-foreground">{currentGrammar.jlpt}</span>
          </p>
        </header>

        <AnimatePresence mode="wait">
          <motion.article
            key={currentGrammar.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden rounded-[1.25rem] border border-[#E8ECF0] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)]"
            style={{ backgroundColor: CARD_BG }}
          >
            {/* Grammar hero */}
            <section className="px-6 py-10 text-center sm:px-10 sm:py-12">
              <div className="mb-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="size-3.5" strokeWidth={2} />
                  {currentGrammar.title}
                </span>
              </div>

              <p className="font-jp text-[2.625rem] font-bold leading-[1.2] tracking-[0.04em] text-foreground sm:text-[3rem]">
                {currentGrammar.pattern}
              </p>

              <p className="mx-auto mt-6 max-w-xl text-xl font-medium leading-relaxed text-foreground/90">
                &ldquo;{currentGrammar.meaningVi}&rdquo;
              </p>

              {currentGrammar.usage ? (
                <p className="mx-auto mt-8 max-w-2xl text-base leading-[1.75] text-muted-foreground sm:text-[17px]">
                  {currentGrammar.usage}
                </p>
              ) : null}

              {currentGrammar.notes ? (
                <div
                  className="mx-auto mt-8 flex max-w-2xl gap-3 rounded-xl px-4 py-3 text-left"
                  style={{ backgroundColor: WARNING_BG }}
                >
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={2} />
                  <p className="text-sm leading-relaxed text-amber-950/90">{currentGrammar.notes}</p>
                </div>
              ) : null}
            </section>

            {/* Examples */}
            {currentGrammar.examples?.length ? (
              <>
                <div className="h-px" style={{ backgroundColor: DIVIDER }} />
                <section className="px-6 py-8 sm:px-10 sm:py-10">
                  <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <BookOpen className="size-3.5" strokeWidth={2} />
                    Ví dụ
                  </p>
                  <ul className="space-y-0">
                    {currentGrammar.examples.map((example, index) => {
                      const dialogueLines = parseDialogueExample(example.segments);
                      const playKey = String(index);

                      return (
                      <li key={index}>
                        {index > 0 ? (
                          <div className="my-6 h-px" style={{ backgroundColor: DIVIDER }} />
                        ) : null}
                        <div className="flex gap-4">
                          <span className="pt-1 text-base font-medium text-muted-foreground/70">
                            {CIRCLED[index] ?? `${index + 1}.`}
                          </span>
                          <div className="min-w-0 flex-1">
                            {dialogueLines ? (
                              <GrammarDialogueExample
                                lines={dialogueLines}
                                exampleIndex={index}
                                playingKey={playingExampleKey}
                                speaking={speaking}
                                onPlay={handlePlayExample}
                              />
                            ) : (
                              <>
                                <div className="flex items-start gap-3">
                                  <p className="min-w-0 flex-1 font-jp text-[1.625rem] font-medium leading-[1.65] text-foreground">
                                    <FuriganaText segments={example.segments} />
                                  </p>
                                  <AudioButton
                                    disabled={speaking}
                                    playing={playingExampleKey === playKey}
                                    label="Nghe câu ví dụ"
                                    onClick={() => void handlePlayExample(example.segments, playKey)}
                                  />
                                </div>
                                {example.vi ? (
                                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                    {example.vi}
                                  </p>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                    })}
                  </ul>
                </section>
              </>
            ) : null}

            {drills.length > 0 ? (
              <>
                <div className="h-px" style={{ backgroundColor: DIVIDER }} />
                <GrammarDrillPanel
                  drills={drills}
                  scores={drillScores}
                  onScore={handleDrillScore}
                  jlptLevel={lesson.course.jlptLevel}
                />
              </>
            ) : null}

            {/* Practice */}
            {hasQuiz ? (
              <>
                <div className="h-px" style={{ backgroundColor: DIVIDER }} />
                <section className="px-6 py-8 sm:px-10 sm:py-10">
                  <p className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <ClipboardCheck className="size-3.5" strokeWidth={2} />
                    Luyện tập nhanh
                  </p>

                  <div className="space-y-10">
                    {currentGrammar.quiz!.map((question, questionIndex) => {
                      const shuffled = shuffledQuiz[questionIndex];
                      const selected = answers[questionIndex];
                      const isCorrect = selected === shuffled?.correctIndex;
                      const showCorrectFeedback = selected !== undefined && isCorrect;
                      const correctChoice = shuffled?.choices[shuffled.correctIndex] ?? '';

                      return (
                        <div key={questionIndex}>
                          <p className="mb-4 font-jp text-[1.375rem] font-medium leading-relaxed text-foreground sm:text-[1.5rem]">
                            <FuriganaText segments={question.question.segments} />
                          </p>

                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {shuffled?.choices.map((choice, choiceIndex) => {
                              const isSelected = selected === choiceIndex;
                              const isCorrectChoice = shuffled.correctIndex === choiceIndex;
                              const showResult = submitted;

                              return (
                                <button
                                  key={choiceIndex}
                                  type="button"
                                  onClick={() => handleSelectAnswer(questionIndex, choiceIndex)}
                                  disabled={submitted}
                                  className={cn(
                                    'group flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200',
                                    'bg-[#F8FAFC] hover:-translate-y-0.5 hover:bg-[#EEF2FF] hover:shadow-sm',
                                    'active:scale-[0.98]',
                                    isSelected &&
                                      !submitted &&
                                      'bg-primary/10 ring-2 ring-primary/30',
                                    showResult &&
                                      isCorrectChoice &&
                                      'bg-emerald-50 ring-2 ring-emerald-400/50',
                                    showResult &&
                                      isSelected &&
                                      !isCorrectChoice &&
                                      'bg-red-50 ring-2 ring-red-300/50',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors',
                                      isSelected && !submitted
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-[#CBD5E1] text-transparent group-hover:border-primary/40',
                                      showResult &&
                                        isCorrectChoice &&
                                        'border-emerald-500 bg-emerald-500 text-white',
                                      showResult &&
                                        isSelected &&
                                        !isCorrectChoice &&
                                        'border-red-400 bg-red-400 text-white',
                                    )}
                                  >
                                    ○
                                  </span>
                                  <span className="font-jp text-base font-medium text-foreground">
                                    {choice}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {showCorrectFeedback ? (
                            <motion.p
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-emerald-800"
                            >
                              <CheckCircle2
                                className="mt-0.5 size-4 shrink-0 text-emerald-600"
                                strokeWidth={2}
                              />
                              <span>
                                {buildCorrectFeedback(
                                  correctChoice,
                                  currentGrammar.usage,
                                  currentGrammar.notes,
                                )}
                              </span>
                            </motion.p>
                          ) : null}

                          {submitted && selected !== undefined && !isCorrect ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                              Đáp án đúng:{' '}
                              <span className="font-semibold text-foreground">{correctChoice}</span>
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {!submitted ? (
                    <Button
                      className="mt-8 transition-transform active:scale-[0.98]"
                      disabled={Object.keys(answers).length < currentGrammar.quiz!.length}
                      onClick={() => setSubmitted(true)}
                    >
                      Kiểm tra đáp án
                    </Button>
                  ) : (
                    <p className="mt-8 text-sm font-medium text-foreground">
                      Kết quả:{' '}
                      <span className={cn('font-semibold', quizPerfect ? 'text-emerald-600' : 'text-primary')}>
                        {score}/{currentGrammar.quiz!.length} câu đúng
                      </span>
                    </p>
                  )}
                </section>
              </>
            ) : null}
          </motion.article>
        </AnimatePresence>

        {/* Continue */}
        <div className="mt-10 flex flex-col items-center gap-2">
          {grammarIndex < grammar.length - 1 ? (
            <>
              <Button
                disabled={!canContinue}
                onClick={handleContinue}
                className={cn(
                  'h-11 w-[220px] gap-2 font-semibold shadow-sm transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]',
                  canContinue &&
                    'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700',
                )}
              >
                Hoàn thành &amp; Tiếp tục
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Button>
              {!canContinue ? (
                <p className="text-xs text-muted-foreground">
                  {drillsRequired && !allDrillsPassed
                    ? `Nhại đủ các câu (≥${passScore} điểm) để tiếp tục.`
                    : 'Làm xong luyện tập để tiếp tục.'}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">
              Bạn đã xem hết ngữ pháp trong bài này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
