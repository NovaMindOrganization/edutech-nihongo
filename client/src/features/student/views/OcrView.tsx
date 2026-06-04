import { Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
    <p className="text-xs text-muted-foreground">
      {meta.engine}
      {meta.gpu ? ' · GPU' : ' · CPU'} · {meta.processing_ms}ms · {meta.line_count} dòng
      {meta.confidence_avg != null && ` · conf ${Math.round(meta.confidence_avg * 100)}%`}
    </p>
  );
}

type NotebookPick = { itemId: string; itemType: 'vocabulary' | 'kanji' };

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

  const allKeys: NotebookPick[] = [
    ...vocabulary.map((v) => ({ itemId: v.id, itemType: 'vocabulary' as const })),
    ...kanji.map((k) => ({ itemId: k.id, itemType: 'kanji' as const })),
  ];
  const keyOf = (p: NotebookPick) => `${p.itemType}:${p.itemId}`;

  useEffect(() => {
    setSelected(new Set(allKeys.map(keyOf)));
  }, [vocabulary, kanji]);

  const toggle = (pick: NotebookPick) => {
    const k = keyOf(pick);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const selectAll = (on: boolean) => {
    setSelected(on ? new Set(allKeys.map(keyOf)) : new Set());
  };

  async function handleAdd() {
    const items = allKeys.filter((p) => selected.has(keyOf(p)));
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
      <p className="text-sm text-muted-foreground">
        Không tìm thấy từ vựng/kanji mới trong ảnh (hoặc đã có hết trong sổ tay).
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {vocabulary.length} từ · {kanji.length} kanji chưa có trong sổ tay
        </p>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Từ vựng</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {vocabulary.map((v) => {
              const pick: NotebookPick = { itemId: v.id, itemType: 'vocabulary' };
              const k = keyOf(pick);
              return (
                <label
                  key={k}
                  className="flex cursor-pointer items-start gap-3 px-4 py-3 text-sm hover:bg-muted/40"
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-input"
                    checked={selected.has(k)}
                    onChange={() => toggle(pick)}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-jp font-medium">{v.word}</span>
                    {v.reading && (
                      <span className="ml-2 text-muted-foreground">{v.reading}</span>
                    )}
                    <span className="ml-2 text-xs text-muted-foreground">{v.jlptLevel}</span>
                    <p className="mt-0.5 text-muted-foreground">{v.meaning}</p>
                  </div>
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}

      {kanji.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kanji</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {kanji.map((k) => {
              const pick: NotebookPick = { itemId: k.id, itemType: 'kanji' };
              const key = keyOf(pick);
              const reading = [...k.readingsOn, ...k.readingsKun].filter(Boolean).join(', ');
              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3 px-4 py-3 text-sm hover:bg-muted/40"
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-input"
                    checked={selected.has(key)}
                    onChange={() => toggle(pick)}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-jp text-xl font-bold">{k.character}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{k.jlptLevel}</span>
                    <p className="mt-0.5">{k.meaning}</p>
                    {reading && (
                      <p className="text-xs text-muted-foreground font-jp">{reading}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={adding || selected.size === 0}
        onClick={() => void handleAdd()}
      >
        {adding ? 'Đang thêm…' : `Thêm vào sổ tay (${selected.size})`}
      </Button>
    </div>
  );
}

function OcrQuizResults({ questions }: { questions: OcrQuizQuestion[] }) {
  const [revealed, setRevealed] = useState<Record<string, number | null>>({});

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const picked = revealed[q.id] ?? null;
        return (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {qi + 1}. {q.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {q.choices.map((choice, i) => (
                <button
                  key={`${q.id}-${i}`}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: i }))}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-left text-sm transition',
                    picked === null && 'hover:border-primary/50 hover:bg-muted/50',
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
              {picked !== null && q.explanation && (
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhận xét tổng quan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{overallFeedback}</p>
        </CardContent>
      </Card>
      {errors.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lỗi và gợi ý sửa ({errors.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {errors.map((err, i) => (
              <div key={i} className="space-y-1 px-4 py-3 text-sm">
                <p className="font-medium">{err.location}</p>
                <p>
                  <span className="text-muted-foreground">Bạn:</span> {err.student_answer || '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Đúng / gợi ý:</span>{' '}
                  {err.correct_answer || '—'}
                </p>
                <p className="text-muted-foreground">{err.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Không phát hiện lỗi rõ ràng trong bài làm.</p>
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
        const paddle = s.paddle?.installed ? 'PaddleOCR' : 'chưa cài PaddleOCR';
        const gpu = s.use_gpu && s.paddle?.cuda_compiled ? ' · GPU' : ' · CPU';
        setEngineInfo(`${paddle}${gpu}`);
      })
      .catch(() => setEngineInfo('PaddleOCR (offline)'));
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
    <div className="mx-auto max-w-2xl">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={onInputChange}
      />

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-bold">OCR</h1>
        <Badge variant="outline" className="font-normal">
          {engineInfo}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(MODE_LABELS) as OcrMode[]).map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={mode === m ? 'default' : 'outline'}
            onClick={() => {
              setMode(m);
              clearResults();
            }}
          >
            {MODE_LABELS[m]}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{MODE_HINTS[mode]}</p>

      {mode === 'quiz' && (
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="quiz-count" className="text-sm font-medium shrink-0">
            Số câu quiz
          </label>
          <Input
            id="quiz-count"
            type="number"
            min={3}
            max={20}
            value={quizCount}
            onChange={(e) => setQuizCount(Number(e.target.value) || 5)}
            className="w-24"
          />
          <span className="text-xs text-muted-foreground">3–20</span>
        </div>
      )}

      {mode === 'grade' && (
        <div className="mt-4">
          <label htmlFor="grade-context" className="text-sm font-medium">
            Môn / bài học (tùy chọn)
          </label>
          <Input
            id="grade-context"
            className="mt-1"
            value={gradeContext}
            onChange={(e) => setGradeContext(e.target.value)}
            placeholder="VD: N5 — bài 3, JLPT mock…"
          />
        </div>
      )}

      <div
        role="presentation"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-primary/40 bg-muted/30 hover:border-primary/60 hover:bg-muted/50',
        )}
      >
        <Upload className="mb-3 size-10 text-primary/70" aria-hidden />
        <p className="text-sm font-medium">Kéo thả ảnh vào đây</p>
        <p className="mt-1 text-xs text-muted-foreground">hoặc</p>
        <Button type="button" className="mt-3" disabled={loading} onClick={openFilePicker}>
          Chọn ảnh từ máy
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">PNG, JPG, WEBP — tối đa 8MB</p>
      </div>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Ảnh đã chọn"
          className="mt-4 max-h-48 w-full rounded-lg border object-contain"
        />
      )}

      <Button
        type="button"
        className="mt-4 w-full"
        size="lg"
        disabled={loading || !pendingBase64}
        onClick={() => void runAnalysis()}
      >
        {loading ? 'Đang xử lý…' : submitLabel}
      </Button>

      {loading && (
        <p className="mt-2 text-sm text-muted-foreground">
          OCR + AI có thể mất 10–60 giây…
        </p>
      )}

      {lookupResult && mode === 'lookup' && (
        <div className="mt-6 space-y-4">
          <MetaLine meta={lookupResult.meta} />
          <Card>
            <CardHeader>
              <CardTitle className="font-jp text-lg font-normal leading-relaxed whitespace-pre-wrap">
                {lookupResult.extracted_text || '—'}
              </CardTitle>
            </CardHeader>
            {lookupResult.grammar_explanation && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{lookupResult.grammar_explanation}</p>
              </CardContent>
            )}
          </Card>
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
        <div className="mt-6 space-y-4">
          <MetaLine meta={quizResult.meta} />
          {quizResult.extracted_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Văn bản nhận diện</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-jp text-sm whitespace-pre-wrap">{quizResult.extracted_text}</p>
              </CardContent>
            </Card>
          )}
          {quizResult.questions.length > 0 && (
            <OcrQuizResults questions={quizResult.questions} />
          )}
        </div>
      )}

      {gradeResult && mode === 'grade' && (
        <div className="mt-6 space-y-4">
          <MetaLine meta={gradeResult.meta} />
          {gradeResult.extracted_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Văn bản nhận diện</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-jp text-sm whitespace-pre-wrap">{gradeResult.extracted_text}</p>
              </CardContent>
            </Card>
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
