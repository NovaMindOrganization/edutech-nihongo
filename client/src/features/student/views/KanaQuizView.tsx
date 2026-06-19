import { motion } from 'framer-motion';
import {
  CircleHelp,
  Home,
  Keyboard,
  RotateCcw,
  Type,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  allRowKeys,
  buildQuizCards,
  HIRAGANA_GROUPS,
  isRomajiCorrect,
  KANA_FONT_OPTIONS,
  KATAKANA_GROUPS,
  normalizeRomaji,
  type KanaGroup,
  type KanaGroupId,
  type QuizCard,
} from '@/features/student/data/kana-quiz-data';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

type Phase = 'setup' | 'quiz' | 'results';
type Script = 'hiragana' | 'katakana';

type CardProgress = {
  correct: boolean;
  wrongCount: number;
  attempted: boolean;
  lastInput: string;
};

const GROUP_LABEL_VI: Record<KanaGroupId, string> = {
  main: 'Kana cơ bản',
  dakuten: 'Kana có dấu',
  combination: 'Kana ghép',
};

function pct(correct: number, total: number): string {
  if (total === 0) return '0%';
  return `${((correct / total) * 100).toFixed(1)}%`;
}

function ScriptToggle({
  script,
  onChange,
}: {
  script: Script;
  onChange: (s: Script) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface-paper p-1 shadow-premium card-lift"
      role="group"
      aria-label="Bảng chữ"
    >
      {(
        [
          { id: 'hiragana' as const, label: 'Hiragana' },
          { id: 'katakana' as const, label: 'Katakana' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors',
            script === opt.id
              ? 'bg-brand text-white'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function RowToggle({
  checked,
  onChange,
  fontFamily,
  kanaChars,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  fontFamily: string;
  kanaChars: string[];
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'flex w-full flex-col items-stretch rounded-xl border px-2 py-2.5 text-center transition-all',
        checked
          ? 'border-primary bg-primary/10 shadow-premium card-lift'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <div
        className={cn(
          'flex w-full overflow-hidden rounded-2xl border-2',
          checked ? 'border-primary/25 bg-background/60' : 'border-border/80 bg-muted/30',
        )}
        aria-hidden
      >
        {kanaChars.map((kana, i) => (
          <span
            key={`${kana}-${i}`}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center py-2 font-jp text-lg leading-none sm:text-xl',
              i > 0 && 'border-l border-border/70',
              checked && i > 0 && 'border-primary/20',
            )}
            style={{ fontFamily }}
          >
            {kana}
          </span>
        ))}
      </div>
      <span className="mt-2 text-xs text-muted-foreground">{label}</span>
    </button>
  );
}

function SetupPhase({
  script,
  setScript,
  fontKey,
  setFontKey,
  selectedRows,
  toggleRow,
  toggleGroup,
  toggleAll,
  groups,
  onStart,
}: {
  script: Script;
  setScript: (s: Script) => void;
  fontKey: string;
  setFontKey: (k: string) => void;
  selectedRows: Set<string>;
  toggleRow: (key: string) => void;
  toggleGroup: (group: KanaGroup, on: boolean) => void;
  toggleAll: (on: boolean) => void;
  groups: KanaGroup[];
  onStart: () => void;
}) {
  const fontFamily =
    KANA_FONT_OPTIONS.find((f) => f.value === fontKey)?.family ??
    KANA_FONT_OPTIONS[0].family;

  const allKeys = allRowKeys(groups);
  const allChecked = allKeys.every((k) => selectedRows.has(k));
  const selectedCount = selectedRows.size;
  const charEstimate = useMemo(() => {
    let n = 0;
    for (const g of groups) {
      for (const r of g.rows) {
        if (selectedRows.has(`${g.id}:${r.key}`)) n += r.chars.length;
      }
    }
    return n;
  }, [groups, selectedRows]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/15 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-transparent to-accent/5">
          <CardTitle className="font-display text-lg">Cài đặt</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-2">
            <p className="text-sm font-medium">Bảng chữ</p>
            <ScriptToggle script={script} onChange={setScript} />
          </div>
          <div className="min-w-[200px] flex-1 space-y-2">
            <label htmlFor="kana-font" className="text-sm font-medium">
              Font hiển thị kana
            </label>
            <select
              id="kana-font"
              value={fontKey}
              onChange={(e) => setFontKey(e.target.value)}
              className={cn(
                'flex min-h-11 w-full max-w-xs rounded-2xl border border-input bg-surface-paper px-3 text-sm font-semibold shadow-premium card-lift',
                'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
              )}
            >
              {KANA_FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant={allChecked ? 'secondary' : 'outline'}
            onClick={() => toggleAll(!allChecked)}
          >
            {allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {groups.map((group, gi) => {
          const groupAll = group.rows.every((r) =>
            selectedRows.has(`${group.id}:${r.key}`),
          );
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
            >
              <Card className="h-full border-primary/10">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-base">
                      {GROUP_LABEL_VI[group.id]}
                    </CardTitle>
                    <Badge variant="secondary">{group.rows.length} hàng</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => toggleGroup(group, !groupAll)}
                  >
                    {groupAll ? 'Bỏ chọn nhóm' : 'Chọn cả nhóm'}
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {group.rows.map((r) => {
                    const key = `${group.id}:${r.key}`;
                    return (
                      <RowToggle
                        key={key}
                        checked={selectedRows.has(key)}
                        onChange={() => toggleRow(key)}
                        fontFamily={fontFamily}
                        kanaChars={r.chars.map((ch) => ch.kana)}
                        label={r.label}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-surface-paper/95 p-4 shadow-premium card-lift backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <span className="font-medium text-foreground">
            Đã chọn {selectedCount} hàng
          </span>
          {selectedCount > 0 && (
            <span className="text-muted-foreground">
              {' '}
              · khoảng {charEstimate} ký tự trong bài
            </span>
          )}
        </div>
        <Button type="button" size="lg" className="sm:min-w-[200px]" onClick={onStart}>
          Bắt đầu quiz
        </Button>
      </div>
    </div>
  );
}

function QuizPhase({
  cards,
  fontFamily,
  progress,
  onSubmit,
  onClearWrongInput,
  onFinish,
}: {
  cards: QuizCard[];
  fontFamily: string;
  progress: Record<string, CardProgress>;
  onSubmit: (cardId: string, value: string, opts?: { draftOnly?: boolean }) => void;
  onClearWrongInput: (cardId: string) => void;
  onFinish: () => void;
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusedId, setFocusedId] = useState(cards[0]?.id ?? '');

  const correctCount = cards.filter((c) => progress[c.id]?.correct).length;
  const progressPct = cards.length ? (correctCount / cards.length) * 100 : 0;

  // Chỉ focus ô đầu khi bắt đầu quiz mới — không chạy lại sau mỗi lần gửi (tránh kéo focus về ô sai cũ)
  useEffect(() => {
    if (cards.length === 0) return;
    const id = cards[0].id;
    setFocusedId(id);
    const frame = requestAnimationFrame(() => inputRefs.current[id]?.focus());
    return () => cancelAnimationFrame(frame);
  }, [cards]);

  const focusCard = useCallback((id: string) => {
    setFocusedId(id);
    requestAnimationFrame(() => {
      const el = inputRefs.current[id];
      el?.focus();
      el?.select();
    });
  }, []);

  const advanceFocus = useCallback(
    (fromId: string) => {
      const idx = cards.findIndex((c) => c.id === fromId);
      if (idx < 0 || cards.length === 0) return;

      for (let step = 1; step <= cards.length; step++) {
        const next = cards[(idx + step) % cards.length];
        if (!progress[next.id]?.correct) {
          focusCard(next.id);
          return;
        }
      }
    },
    [cards, progress, focusCard],
  );

  const handleKeyDown = (card: QuizCard, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const fromId = card.id;
    onSubmit(fromId, e.currentTarget.value);
    requestAnimationFrame(() => advanceFocus(fromId));
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/15">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Tiến độ</span>
              <span className="text-muted-foreground">
                {correctCount}/{cards.length} đúng
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Keyboard className="size-3.5" />
              Enter để gửi
            </li>
            <li className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Type className="size-3.5" />
              Gõ romaji
            </li>
            <li className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <CircleHelp className="size-3.5" />
              Thử lại được
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {cards.map((card) => {
          const p = progress[card.id];
          const isCorrect = p?.correct;
          const showWrong = p?.attempted && !p.correct && p.lastInput;
          const isFocused = focusedId === card.id && !isCorrect;

          return (
            <div
              key={card.id}
              className={cn(
                'flex min-h-[112px] flex-col rounded-xl border p-2 transition-all',
                isCorrect &&
                  'border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/25',
                !isCorrect &&
                  showWrong &&
                  'border-destructive/50 bg-destructive/5',
                !isCorrect &&
                  !showWrong &&
                  'border-border bg-card shadow-premium card-lift',
                isFocused && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
              )}
            >
              <span
                className="flex flex-1 items-center justify-center font-jp text-4xl font-medium text-foreground"
                style={{ fontFamily }}
              >
                {card.kana}
              </span>
              <Input
                ref={(el) => {
                  inputRefs.current[card.id] = el;
                }}
                type="text"
                disabled={isCorrect}
                aria-label={`Romaji cho ${card.kana}`}
                className={cn(
                  'min-h-10 text-center text-xs sm:min-h-11',
                  showWrong && 'border-destructive/50 text-destructive',
                  isCorrect && 'border-emerald-500/30 bg-background/80',
                )}
                value={
                  isCorrect
                    ? normalizeRomaji(p?.lastInput || card.romaji[0])
                    : (progress[card.id]?.lastInput ?? '')
                }
                onChange={(e) => {
                  if (isCorrect) return;
                  onSubmit(card.id, e.target.value, { draftOnly: true });
                }}
                onFocus={() => {
                  setFocusedId(card.id);
                  if (showWrong) {
                    onClearWrongInput(card.id);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(card, e)}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pb-8">
        <Button type="button" size="lg" variant="secondary" onClick={onFinish}>
          Kết thúc quiz
        </Button>
      </div>
    </div>
  );
}

function ResultCell({
  card,
  status,
  fontFamily,
}: {
  card: QuizCard;
  status: string;
  fontFamily: string;
}) {
  const isOk = status === '◯';
  const isNa = status.startsWith('X: N/A');

  return (
    <div
      className={cn(
        'flex min-w-[3.5rem] flex-1 flex-col items-center rounded-2xl border px-1 py-2 shadow-premium card-lift',
        isOk && 'border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/20',
        !isOk && !isNa && 'border-destructive/30 bg-destructive/5',
        isNa && 'border-border bg-muted/30',
      )}
    >
      <span className="font-jp text-2xl" style={{ fontFamily }}>
        {card.kana}
      </span>
      <span
        className={cn(
          'mt-1 text-[10px] font-medium uppercase tracking-wide',
          isOk && 'text-emerald-700 dark:text-emerald-400',
          !isOk && !isNa && 'text-destructive',
          isNa && 'text-muted-foreground',
        )}
      >
        {isOk ? 'Đúng' : isNa ? '—' : status.replace('X: ', 'Sai ')}
      </span>
    </div>
  );
}

function ResultsPhase({
  groups,
  cards,
  progress,
  fontFamily,
  onQuizAgain,
  onHome,
}: {
  groups: KanaGroup[];
  cards: QuizCard[];
  progress: Record<string, CardProgress>;
  fontFamily: string;
  onQuizAgain: () => void;
  onHome: () => void;
}) {
  const total = cards.length;
  const correctCount = cards.filter((c) => progress[c.id]?.correct).length;

  const cardsByGroup = useMemo(() => {
    const map = new Map<KanaGroupId, QuizCard[]>();
    for (const card of cards) {
      const list = map.get(card.groupId) ?? [];
      list.push(card);
      map.set(card.groupId, list);
    }
    return map;
  }, [cards]);

  const statusFor = (cardId: string): string => {
    const p = progress[cardId];
    if (!p?.attempted) return 'X: N/A';
    if (p.correct) return '◯';
    return `X: ${p.wrongCount}`;
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 text-center">
          <p className="text-sm text-muted-foreground">Tổng kết</p>
          <CardTitle className="font-display text-4xl font-bold tabular-nums">
            {pct(correctCount, total)}
          </CardTitle>
          <p className="text-muted-foreground">
            {correctCount} / {total} ký tự đúng
          </p>
        </CardHeader>
      </Card>

      {groups.map((group) => {
        const groupCards = cardsByGroup.get(group.id) ?? [];
        if (groupCards.length === 0) return null;

        const groupCorrect = groupCards.filter((c) => progress[c.id]?.correct).length;
        const rowKeysUsed = new Set(groupCards.map((c) => c.rowKey));

        return (
          <Card key={group.id} className="border-primary/10">
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 pb-2">
              <CardTitle className="font-display text-lg">
                {GROUP_LABEL_VI[group.id]}
              </CardTitle>
              <Badge>
                {groupCorrect}/{groupCards.length} · {pct(groupCorrect, groupCards.length)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.rows
                .filter((r) => rowKeysUsed.has(r.key))
                .map((r) => {
                  const rowCards = groupCards.filter((c) => c.rowKey === r.key);
                  return (
                    <div key={r.key}>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {r.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rowCards.map((card) => (
                          <ResultCell
                            key={card.id}
                            card={card}
                            status={statusFor(card.id)}
                            fontFamily={fontFamily}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex flex-wrap justify-center gap-3 pb-8">
        <Button type="button" variant="outline" onClick={onHome}>
          <Home className="size-4" />
          Về trang học
        </Button>
        <Button type="button" onClick={onQuizAgain}>
          <RotateCcw className="size-4" />
          Quiz lại
        </Button>
      </div>
    </div>
  );
}

export function KanaQuizView() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('setup');
  const [script, setScript] = useState<Script>('hiragana');
  const [fontKey, setFontKey] = useState<string>(KANA_FONT_OPTIONS[0].value);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [quizCards, setQuizCards] = useState<QuizCard[]>([]);
  const [progress, setProgress] = useState<Record<string, CardProgress>>({});
  /** Bumps each new quiz so grid remounts with a fresh shuffled order */
  const [quizSession, setQuizSession] = useState(0);

  const groups = script === 'hiragana' ? HIRAGANA_GROUPS : KATAKANA_GROUPS;
  const fontFamily =
    KANA_FONT_OPTIONS.find((f) => f.value === fontKey)?.family ??
    KANA_FONT_OPTIONS[0].family;

  const headerDescription = useMemo(() => {
    if (phase === 'quiz') {
      return 'Gõ romaji cho từng ký tự, nhấn Enter để kiểm tra và chuyển ô tiếp theo.';
    }
    if (phase === 'results') {
      return 'Xem chi tiết từng ký tự và luyện lại các hàng còn yếu.';
    }
    return 'Chọn hàng kana cần ôn, rồi gõ romaji tương ứng trong bài quiz. Hỗ trợ hiragana và katakana.';
  }, [phase]);

  const toggleRow = (key: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleGroup = (group: KanaGroup, on: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      for (const r of group.rows) {
        const k = `${group.id}:${r.key}`;
        if (on) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  };

  const toggleAll = (on: boolean) => {
    setSelectedRows(on ? new Set(allRowKeys(groups)) : new Set());
  };

  const beginQuiz = () => {
    if (selectedRows.size === 0) {
      toast.error('Hãy chọn ít nhất một hàng kana');
      return false;
    }
    setQuizCards(buildQuizCards(groups, selectedRows));
    setProgress({});
    setQuizSession((n) => n + 1);
    setPhase('quiz');
    return true;
  };

  const handleStart = () => {
    beginQuiz();
  };

  const handleClearWrongInput = (cardId: string) => {
    setProgress((prev) => {
      const was = prev[cardId];
      if (!was?.attempted || was.correct || !was.lastInput) return prev;
      return {
        ...prev,
        [cardId]: { ...was, lastInput: '' },
      };
    });
  };

  const handleSubmit = (
    cardId: string,
    value: string,
    opts?: { draftOnly?: boolean },
  ) => {
    const card = quizCards.find((c) => c.id === cardId);
    if (!card) return;

    if (opts?.draftOnly) {
      setProgress((prev) => ({
        ...prev,
        [cardId]: {
          correct: prev[cardId]?.correct ?? false,
          wrongCount: prev[cardId]?.wrongCount ?? 0,
          attempted: prev[cardId]?.attempted ?? false,
          lastInput: value,
        },
      }));
      return;
    }

    const ok = isRomajiCorrect(value, card.romaji);
    setProgress((prev) => {
      const was = prev[cardId];
      if (was?.correct) return prev;
      return {
        ...prev,
        [cardId]: {
          correct: ok,
          wrongCount: (was?.wrongCount ?? 0) + (ok ? 0 : 1),
          attempted: true,
          lastInput: value,
        },
      };
    });
  };

  const handleFinish = () => {
    const pending = quizCards.filter((c) => !progress[c.id]?.correct);
    if (pending.length > 0) {
      const ok = window.confirm(
        `Còn ${pending.length} ký tự chưa đúng. Kết thúc quiz?`,
      );
      if (!ok) return;
    }
    setPhase('results');
  };

  const handleQuizAgain = () => {
    if (selectedRows.size > 0) {
      beginQuiz();
      return;
    }
    setPhase('setup');
    setQuizCards([]);
    setProgress({});
  };

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Học"
      title="Luyện kana"
      description={headerDescription}
      icon={Keyboard}
      iconClassName="bg-tertiary"
      tone="secondary"
      chips={['Hiragana', 'Katakana', 'Romaji']}
      footer="Chọn hàng kana, gõ romaji và nhấn Enter để kiểm tra từng ký tự."
    >
      <div className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
          {phase === 'setup' && (
            <SetupPhase
              script={script}
              setScript={setScript}
              fontKey={fontKey}
              setFontKey={setFontKey}
              selectedRows={selectedRows}
              toggleRow={toggleRow}
              toggleGroup={toggleGroup}
              toggleAll={toggleAll}
              groups={groups}
              onStart={handleStart}
            />
          )}

          {phase === 'quiz' && (
            <QuizPhase
              key={quizSession}
              cards={quizCards}
              fontFamily={fontFamily}
              progress={progress}
              onSubmit={handleSubmit}
              onClearWrongInput={handleClearWrongInput}
              onFinish={handleFinish}
            />
          )}

          {phase === 'results' && (
            <ResultsPhase
              groups={groups}
              cards={quizCards}
              progress={progress}
              fontFamily={fontFamily}
              onQuizAgain={handleQuizAgain}
              onHome={() => navigate(paths.learn.hub)}
            />
          )}
      </div>
    </PageShell>
  );
}
