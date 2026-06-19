import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  GraduationCap,
  Languages,
  Loader2,
  NotebookPen,
  ScanText,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { PageHero } from '@/components/usable/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getOcrStatus,
  postOcr,
  postOcrGrade,
  postOcrNotebookAdd,
  postOcrQuiz,
  type OcrGradingError,
  type OcrKanjiSuggestion,
  type OcrMeta,
  type OcrQuizQuestion,
  type OcrVocabSuggestion,
} from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';

type OcrMode = 'lookup' | 'quiz' | 'grade';

type LookupResult = {
  extracted_text: string;
  suggested_vocabulary: OcrVocabSuggestion[];
  suggested_kanji: OcrKanjiSuggestion[];
  grammar_explanation: string | null;
  meta?: OcrMeta | null;
};

const MODE_LABELS: Record<OcrMode, string> = {
  lookup: 'Tra cứu',
  quiz: 'Tạo Quiz',
  grade: 'Chấm bài',
};

const MODE_HINTS: Record<OcrMode, string> = {
  lookup: 'Tìm từ vựng và kanji trong ảnh chưa có trong sổ tay — chọn để thêm.',
  quiz: 'Tạo câu hỏi trắc nghiệm từ kiến thức trong ảnh để ôn tập.',
  grade: 'Nhận xét bài làm (trắc nghiệm / tự luận), chỉ lỗi và cách sửa.',
};

function MetaLine({ meta }: { meta?: OcrMeta | null }) {
  if (!meta) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
      <span className="rounded-full border border-border bg-surface-paper px-3 py-1 shadow-premium card-lift">
        {meta.engine}
      </span>
      <span className="rounded-full border border-border bg-surface-paper px-3 py-1 shadow-premium card-lift">
        {meta.gpu ? 'GPU' : 'CPU'}
      </span>
      <span className="rounded-full border border-border bg-surface-paper px-3 py-1 shadow-premium card-lift">
        {meta.processing_ms}ms
      </span>
      <span className="rounded-full border border-border bg-surface-paper px-3 py-1 shadow-premium card-lift">
        {meta.line_count} dòng
      </span>
      {meta.confidence_avg != null && (
        <span className="rounded-full border border-border bg-quaternary/20 px-3 py-1 shadow-premium card-lift">
          conf {Math.round(meta.confidence_avg * 100)}%
        </span>
      )}
    </div>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
  accent = 'bg-tertiary',
}: {
  icon: typeof Upload;
  eyebrow: string;
  title: string;
  description?: string;
  accent?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <AppIcon icon={icon} size="lg" className={accent} />
      <div>
        <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function ExtractedTextCard({
  text,
  meta,
  title = 'Văn bản nhận diện',
}: {
  text: string;
  meta?: OcrMeta | null;
  title?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-surface-paper">
        <SectionHeading
          icon={ScanText}
          eyebrow="OCR Results"
          title={title}
          description="Đoạn chữ được nhận diện từ ảnh, giữ xuống dòng để dễ so lại với tài liệu gốc."
          accent="bg-quaternary"
        />
        <MetaLine meta={meta} />
      </CardHeader>
      <CardContent className="bg-background p-4 sm:p-6">
        <div className="rounded-3xl border border-dashed border-border bg-surface-paper p-4 shadow-premium card-lift">
          <p className="whitespace-pre-wrap font-jp text-base font-semibold leading-8">
            {text || '—'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type NotebookPick = { itemId: string; itemType: 'vocabulary' | 'kanji' };

function notebookPickKey(p: NotebookPick) {
  return `${p.itemType}:${p.itemId}`;
}

function OcrNotebookSuggestions({
  vocabulary,
  kanji,
  onAdded,
}: {
  vocabulary: OcrVocabSuggestion[];
  kanji: OcrKanjiSuggestion[];
  onAdded: (added: NotebookPick[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [adding, setAdding] = useState(false);

  const allKeys = useMemo<NotebookPick[]>(
    () => [
      ...vocabulary.map((v) => ({ itemId: v.id, itemType: 'vocabulary' as const })),
      ...kanji.map((k) => ({ itemId: k.id, itemType: 'kanji' as const })),
    ],
    [vocabulary, kanji],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setSelected(new Set(allKeys.map(notebookPickKey)));
    });
  }, [allKeys]);

  const toggle = (pick: NotebookPick) => {
    const k = notebookPickKey(pick);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const selectAll = (on: boolean) => {
    setSelected(on ? new Set(allKeys.map(notebookPickKey)) : new Set());
  };

  async function handleAdd() {
    const items = allKeys.filter((p) => selected.has(notebookPickKey(p)));
    if (!items.length) {
      toast.error('Chọn ít nhất một mục');
      return;
    }
    setAdding(true);
    try {
      const { added } = await postOcrNotebookAdd(items);
      toast.success(`Đã thêm ${added} mục vào sổ tay`);
      onAdded(items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thêm được');
    } finally {
      setAdding(false);
    }
  }

  if (!vocabulary.length && !kanji.length) {
    return (
      <p className="rounded-3xl border border-dashed border-border bg-surface-paper px-5 py-8 text-center text-sm font-medium text-muted-foreground shadow-premium card-lift">
        Không tìm thấy từ vựng/kanji mới trong ảnh (hoặc đã có hết trong sổ tay).
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
        <div className="flex items-center gap-3">
          <AppIcon icon={NotebookPen} size="md" className="bg-tertiary" />
          <div>
            <p className="font-display text-sm font-extrabold">Vocabulary Analysis</p>
            <p className="text-sm font-medium text-muted-foreground">
              {vocabulary.length} từ · {kanji.length} kanji chưa có trong sổ tay
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => selectAll(true)}>
            Chọn tất cả
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => selectAll(false)}>
            Bỏ chọn
          </Button>
        </div>
      </div>

      {vocabulary.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-surface-paper">
            <SectionHeading
              icon={BookOpen}
              eyebrow="Vocabulary"
              title="Từ vựng mới"
              description="Chọn các từ cần đưa vào sổ tay để ôn lại sau."
              accent="bg-quaternary"
            />
          </CardHeader>
          <CardContent className="grid gap-3 bg-background p-4 md:grid-cols-2">
            {vocabulary.map((v) => {
              const pick: NotebookPick = { itemId: v.id, itemType: 'vocabulary' };
              const k = notebookPickKey(pick);
              return (
                <label
                  key={k}
                  className={cn(
                    'cursor-pointer rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium card-lift',
                    selected.has(k) && 'bg-quaternary/15',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-5 rounded border-input accent-primary"
                      checked={selected.has(k)}
                      onChange={() => toggle(pick)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-brand-soft text-brand">{v.jlptLevel}</Badge>
                        {selected.has(k) && (
                          <Badge className="bg-quaternary text-quaternary-foreground">Đã chọn</Badge>
                        )}
                      </div>
                      <p className="mt-3 truncate font-jp text-2xl font-bold">{v.word}</p>
                      {v.reading && (
                        <p className="mt-1 truncate font-jp text-base font-medium text-primary">
                          {v.reading}
                        </p>
                      )}
                      <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">{v.meaning}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}

      {kanji.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-amber-50">
            <SectionHeading
              icon={Languages}
              eyebrow="Kanji"
              title="Kanji được nhận diện"
              description="Kanji giữ màu học tập cũ: nền amber, On/Kun rõ ràng."
              accent="bg-amber-200"
            />
          </CardHeader>
          <CardContent className="grid gap-3 bg-background p-4 md:grid-cols-2">
            {kanji.map((k) => {
              const pick: NotebookPick = { itemId: k.id, itemType: 'kanji' };
              const key = notebookPickKey(pick);
              const reading = [...k.readingsOn, ...k.readingsKun].filter(Boolean).join(', ');
              return (
                <label
                  key={key}
                  className={cn(
                    'cursor-pointer rounded-xl border border-border bg-amber-50 p-4 shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium card-lift',
                    selected.has(key) && 'bg-emerald-50/80',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-5 rounded border-input accent-primary"
                      checked={selected.has(key)}
                      onChange={() => toggle(pick)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-amber-200 text-amber-950">{k.jlptLevel}</Badge>
                        {selected.has(key) && (
                          <Badge className="bg-quaternary text-quaternary-foreground">Đã chọn</Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="font-jp text-5xl font-black text-foreground">{k.character}</span>
                        <div>
                          <p className="text-base font-bold text-foreground/80">{k.meaning}</p>
                          {reading && (
                            <p className="mt-1 font-jp text-xs font-medium text-muted-foreground">
                              {reading}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        className="w-full gap-2"
        disabled={adding || selected.size === 0}
        onClick={() => void handleAdd()}
      >
        <NotebookPen className="size-4" />
        {adding ? 'Đang thêm…' : `Thêm vào sổ tay (${selected.size})`}
      </Button>
    </div>
  );
}

function OcrQuizResults({ questions }: { questions: OcrQuizQuestion[] }) {
  const [revealed, setRevealed] = useState<Record<string, number | null>>({});

  return (
    <div className="space-y-4">
      <SectionHeading
        icon={Brain}
        eyebrow="Generated Quiz"
        title="Quiz từ ảnh"
        description="Chọn đáp án để hiện kết quả và giải thích ngay bên dưới câu hỏi."
        accent="bg-secondary"
      />
      {questions.map((q, qi) => {
        const picked = revealed[q.id] ?? null;
        return (
          <Card key={q.id} className="overflow-hidden">
            <CardHeader className="border-b border-border bg-surface-paper">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-tertiary font-display text-sm font-extrabold shadow-premium card-lift">
                  {qi + 1}
                </span>
                <CardTitle className="text-base leading-7">{q.prompt}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 bg-background p-4">
              {q.choices.map((choice, i) => (
                <button
                  key={`${q.id}-${i}`}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: i }))}
                  className={cn(
                    'rounded-lg border border-border bg-surface-paper px-3 py-3 text-left text-sm font-medium shadow-premium card-lift transition-all',
                    picked === null && 'hover:-translate-y-0.5 hover:bg-tertiary/20 hover:shadow-premium card-lift',
                    picked !== null && i === q.answer && 'bg-emerald-50',
                    picked !== null &&
                      picked === i &&
                      i !== q.answer &&
                      'bg-destructive/10',
                  )}
                >
                  <span className="mr-2 inline-flex size-7 items-center justify-center rounded-xl border border-border bg-background font-display text-xs font-extrabold text-muted-foreground">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {choice}
                </button>
              ))}
              {picked !== null && q.explanation && (
                <div className="mt-2 rounded-3xl border border-dashed border-border bg-quaternary/15 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <AppIcon icon={CheckCircle2} size="sm" className="bg-quaternary" />
                    <span className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                      Explanation
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-6 text-muted-foreground">{q.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function OcrGradeResults({
  errors,
  overallFeedback,
  scoreEstimate,
}: {
  errors: OcrGradingError[];
  overallFeedback: string;
  scoreEstimate: string | null;
}) {
  return (
    <div className="space-y-4">
      {scoreEstimate && (
        <Badge variant="secondary" className="text-sm">
          Ước lượng: {scoreEstimate}
        </Badge>
      )}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-surface-paper">
          <SectionHeading
            icon={ClipboardCheck}
            eyebrow="Grammar Analysis"
            title="Nhận xét tổng quan"
            description="AI tóm tắt chất lượng bài làm và các điểm cần cải thiện."
            accent="bg-quaternary"
          />
        </CardHeader>
        <CardContent className="bg-background p-4">
          <p className="whitespace-pre-wrap rounded-3xl border border-dashed border-border bg-surface-paper p-4 text-sm font-medium leading-7 shadow-premium card-lift">
            {overallFeedback}
          </p>
        </CardContent>
      </Card>
      {errors.length > 0 ? (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-surface-paper">
            <SectionHeading
              icon={AlertTriangle}
              eyebrow="Corrections"
              title={`Lỗi và gợi ý sửa (${errors.length})`}
              description="Mỗi lỗi được tách thành vị trí, câu trả lời của bạn, đáp án/gợi ý và giải thích."
              accent="bg-secondary"
            />
          </CardHeader>
          <CardContent className="grid gap-3 bg-background p-4">
            {errors.map((err, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-paper p-4 text-sm shadow-premium card-lift">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl border border-border bg-secondary font-display text-xs font-extrabold shadow-premium card-lift">
                    {i + 1}
                  </span>
                  <p className="font-display font-extrabold">{err.location}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-dashed border-border bg-destructive/10 p-3">
                    <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                      Bạn
                    </p>
                    <p className="mt-1 font-medium leading-6">{err.student_answer || '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-dashed border-border bg-quaternary/15 p-3">
                    <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                      Đúng / gợi ý
                    </p>
                    <p className="mt-1 font-medium leading-6">{err.correct_answer || '—'}</p>
                  </div>
                </div>
                <p className="mt-3 rounded-2xl border border-dashed border-border bg-background/75 p-3 font-medium leading-6 text-muted-foreground">
                  {err.explanation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-3xl border border-dashed border-border bg-surface-paper px-5 py-8 text-center text-sm font-medium text-muted-foreground shadow-premium card-lift">
          Không phát hiện lỗi rõ ràng trong bài làm.
        </p>
      )}
    </div>
  );
}

export function OcrView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<OcrMode>('lookup');
  const [engineInfo, setEngineInfo] = useState<string>('…');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingBase64, setPendingBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [quizCount, setQuizCount] = useState(5);
  const [gradeContext, setGradeContext] = useState('');

  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [quizResult, setQuizResult] = useState<{
    extracted_text: string;
    questions: OcrQuizQuestion[];
    meta?: OcrMeta | null;
  } | null>(null);
  const [gradeResult, setGradeResult] = useState<{
    extracted_text: string;
    errors: OcrGradingError[];
    overall_feedback: string;
    score_estimate: string | null;
    meta?: OcrMeta | null;
  } | null>(null);

  useEffect(() => {
    getOcrStatus()
      .then((s) => {
        const tier = s.paddle?.model_tier ?? 'server';
        const paddle = s.paddle?.installed
          ? `PP-OCRv5 (${tier})`
          : 'chưa cài PP-OCRv5';
        const gpu = s.use_gpu && s.paddle?.cuda_compiled ? ' · GPU' : ' · CPU';
        setEngineInfo(`${paddle}${gpu}`);
      })
      .catch(() => setEngineInfo('PP-OCRv5 (offline)'));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearResults = useCallback(() => {
    setLookupResult(null);
    setQuizResult(null);
    setGradeResult(null);
  }, []);

  const loadImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file ảnh (PNG, JPG, …)');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error('Ảnh tối đa 8MB');
        return;
      }

      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      clearResults();

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1] ?? '';
        setPendingBase64(base64);
      };
      reader.onerror = () => toast.error('Không đọc được file');
      reader.readAsDataURL(file);
    },
    [clearResults],
  );

  async function runAnalysis() {
    if (!pendingBase64) {
      toast.error('Chọn ảnh trước');
      return;
    }

    setLoading(true);
    clearResults();

    try {
      if (mode === 'lookup') {
        const data = await postOcr(pendingBase64);
        setLookupResult({
          extracted_text: data.extracted_text,
          suggested_vocabulary: data.suggested_vocabulary ?? [],
          suggested_kanji: data.suggested_kanji ?? [],
          grammar_explanation: data.grammar_explanation,
          meta: data.meta,
        });
        if (!data.extracted_text) {
          toast.message('Không nhận diện được chữ — thử ảnh rõ hơn');
        } else if (
          !data.suggested_vocabulary?.length &&
          !data.suggested_kanji?.length
        ) {
          toast.message('Không có từ/kanji mới để thêm — có thể đã có trong sổ tay');
        }
      } else if (mode === 'quiz') {
        const count = Math.min(20, Math.max(3, quizCount));
        const data = await postOcrQuiz(pendingBase64, count);
        if (data.error) {
          toast.error(data.error);
        }
        if (!data.questions?.length && !data.error) {
          toast.message('Không tạo được câu hỏi — thử ảnh rõ hơn');
        }
        setQuizResult({
          extracted_text: data.extracted_text,
          questions: data.questions ?? [],
          meta: data.meta,
        });
      } else {
        const data = await postOcrGrade(pendingBase64, gradeContext);
        if (data.error) {
          toast.error(data.error);
        }
        setGradeResult({
          extracted_text: data.extracted_text,
          errors: data.errors ?? [],
          overall_feedback: data.overall_feedback ?? '',
          score_estimate: data.score_estimate ?? null,
          meta: data.meta,
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xử lý thất bại');
    } finally {
      setLoading(false);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadImageFile(file);
    e.target.value = '';
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadImageFile(file);
  }

  const submitLabel =
    mode === 'lookup' ? 'Tra cứu' : mode === 'quiz' ? 'Tạo quiz' : 'Chấm bài';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={onInputChange}
      />

      <PageHero
        animate={false}
        className="mb-6"
        badge="OCR Analysis"
        title="Phân tích ảnh tiếng Nhật"
        description="Upload ảnh bài học, đề thi hoặc ghi chú để nhận OCR results, vocabulary analysis và grammar analysis."
        icon={ScanText}
        iconClassName="bg-quaternary"
        tone="quaternary"
        chips={['Tra cứu', 'Quiz từ ảnh', 'Chấm ngữ pháp']}
        footer="Hỗ trợ PNG, JPG, WEBP tối đa 8MB — kết quả có thể thêm thẳng vào sổ tay."
        aside={
          <div className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
              OCR Engine
            </p>
            <p className="mt-2 text-sm font-bold leading-6">{engineInfo}</p>
          </div>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-surface-paper">
            <SectionHeading
              icon={Upload}
              eyebrow="Upload"
              title="Chọn ảnh để phân tích"
              description="Kéo thả hoặc chọn file từ máy. Hỗ trợ PNG, JPG, WEBP tối đa 8MB."
              accent="bg-tertiary"
            />
          </CardHeader>
          <CardContent className="space-y-4 bg-background p-4 sm:p-6">
            <div
              role="presentation"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={cn(
                'flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-border px-6 py-10 text-center transition-all',
                isDragging
                  ? 'bg-primary/10 shadow-premium card-lift'
                  : 'bg-surface-paper hover:-translate-y-0.5 hover:bg-tertiary/15 hover:shadow-premium card-lift',
              )}
            >
              <AppIcon icon={FileImage} size="lg" className="mb-4 bg-quaternary" />
              <p className="font-display text-xl font-extrabold">Kéo thả ảnh vào đây</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">hoặc chọn file từ máy</p>
              <Button type="button" className="mt-5 gap-2" disabled={loading} onClick={openFilePicker}>
                <Upload className="size-4" />
                Chọn ảnh từ máy
              </Button>
              <p className="mt-4 text-xs font-semibold text-muted-foreground">PNG, JPG, WEBP · tối đa 8MB</p>
            </div>

            {previewUrl ? (
              <div className="rounded-xl border border-border bg-surface-paper p-3 shadow-premium card-lift">
                <img
                  src={previewUrl}
                  alt="Ảnh đã chọn"
                  className="max-h-64 w-full rounded-2xl object-contain"
                />
              </div>
            ) : (
              <p className="rounded-3xl border border-dashed border-border bg-surface-paper px-4 py-4 text-center text-sm font-medium text-muted-foreground">
                Chưa có ảnh được chọn.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-surface-paper">
            <SectionHeading
              icon={Sparkles}
              eyebrow="Analysis Mode"
              title={MODE_LABELS[mode]}
              description={MODE_HINTS[mode]}
              accent="bg-secondary"
            />
          </CardHeader>
          <CardContent className="space-y-4 bg-background p-4 sm:p-6">
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(MODE_LABELS) as OcrMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={cn(
                    'rounded-xl border border-border px-4 py-4 text-left shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium card-lift',
                    mode === m ? 'bg-brand text-white' : 'bg-surface-paper',
                  )}
                  onClick={() => {
                    setMode(m);
                    clearResults();
                  }}
                >
                  <p className="font-display text-sm font-extrabold">{MODE_LABELS[m]}</p>
                  <p className={cn('mt-1 text-xs font-medium leading-5', mode === m ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {m === 'lookup' ? 'Vocabulary + Grammar' : m === 'quiz' ? 'Questions' : 'Corrections'}
                  </p>
                </button>
              ))}
            </div>

            {mode === 'quiz' && (
              <div className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
                <label htmlFor="quiz-count" className="font-display text-sm font-extrabold">
                  Số câu quiz
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <Input
                    id="quiz-count"
                    type="number"
                    min={3}
                    max={20}
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value) || 5)}
                    className="w-24"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">3–20 câu</span>
                </div>
              </div>
            )}

            {mode === 'grade' && (
              <div className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
                <label htmlFor="grade-context" className="font-display text-sm font-extrabold">
                  Môn / bài học (tùy chọn)
                </label>
                <Input
                  id="grade-context"
                  className="mt-2"
                  value={gradeContext}
                  onChange={(e) => setGradeContext(e.target.value)}
                  placeholder="VD: N5 — bài 3, JLPT mock…"
                />
              </div>
            )}

            <Button
              type="button"
              className="w-full gap-2"
              size="lg"
              disabled={loading || !pendingBase64}
              onClick={() => void runAnalysis()}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xử lý…
                </>
              ) : (
                <>
                  <ScanText className="size-4" />
                  {submitLabel}
                </>
              )}
            </Button>

            {loading && (
              <p className="rounded-2xl border border-dashed border-border bg-tertiary/20 px-4 py-3 text-sm font-medium text-muted-foreground">
                OCR + AI có thể mất 10–60 giây…
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {lookupResult && mode === 'lookup' && (
        <div className="space-y-5">
          <ExtractedTextCard text={lookupResult.extracted_text} meta={lookupResult.meta} />
          {lookupResult.grammar_explanation && (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-surface-paper">
                <SectionHeading
                  icon={GraduationCap}
                  eyebrow="Grammar Analysis"
                  title="Giải thích ngữ pháp"
                  description="AI tóm tắt điểm ngữ pháp đáng chú ý trong đoạn OCR."
                  accent="bg-secondary"
                />
              </CardHeader>
              <CardContent className="bg-background p-4">
                <p className="rounded-3xl border border-dashed border-border bg-surface-paper p-4 text-sm font-medium leading-7 text-muted-foreground shadow-premium card-lift">
                  {lookupResult.grammar_explanation}
                </p>
              </CardContent>
            </Card>
          )}
          <OcrNotebookSuggestions
            vocabulary={lookupResult.suggested_vocabulary}
            kanji={lookupResult.suggested_kanji}
            onAdded={(added) => {
              const addedSet = new Set(added.map((p) => `${p.itemType}:${p.itemId}`));
              setLookupResult((prev) =>
                prev
                  ? {
                      ...prev,
                      suggested_vocabulary: prev.suggested_vocabulary.filter(
                        (v) => !addedSet.has(`vocabulary:${v.id}`),
                      ),
                      suggested_kanji: prev.suggested_kanji.filter(
                        (k) => !addedSet.has(`kanji:${k.id}`),
                      ),
                    }
                  : prev,
              );
            }}
          />
        </div>
      )}

      {quizResult && mode === 'quiz' && (
        <div className="space-y-5">
          {quizResult.extracted_text && (
            <ExtractedTextCard text={quizResult.extracted_text} meta={quizResult.meta} />
          )}
          {quizResult.questions.length > 0 && (
            <OcrQuizResults questions={quizResult.questions} />
          )}
        </div>
      )}

      {gradeResult && mode === 'grade' && (
        <div className="space-y-5">
          {gradeResult.extracted_text && (
            <ExtractedTextCard text={gradeResult.extracted_text} meta={gradeResult.meta} />
          )}
          <OcrGradeResults
            errors={gradeResult.errors}
            overallFeedback={gradeResult.overall_feedback}
            scoreEstimate={gradeResult.score_estimate}
          />
        </div>
      )}
    </div>
  );
}
