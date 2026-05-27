import { Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOcrStatus, postOcr, type OcrMeta } from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';

type OcrResult = {
  extracted_text: string;
  matched_vocabulary: Array<{ id: string; word: string; reading: string | null; meaning: string }>;
  matched_grammar: Array<{ id: string; pattern: string; meaningVi: string }>;
  grammar_explanation: string | null;
  meta?: OcrMeta | null;
};

export function OcrView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineInfo, setEngineInfo] = useState<string>('…');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const processFile = useCallback(async (file: File) => {
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

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1] ?? '';
      setLoading(true);
      setResult(null);
      try {
        const data = await postOcr(base64);
        setResult(data);
        if (!data.extracted_text) {
          toast.message('Không nhận diện được chữ — thử ảnh rõ hơn');
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'OCR thất bại');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => toast.error('Không đọc được file');
    reader.readAsDataURL(file);
  }, []);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
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
    if (file) processFile(file);
  }

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
        <h1 className="font-display text-2xl font-bold">OCR tra cứu</h1>
        <Badge variant="outline" className="font-normal">
          {engineInfo}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Chụp sách giáo trình / bài tập tiếng Nhật — nhận diện bằng PaddleOCR (GPU) và khớp từ vựng trong
        sổ tay.
      </p>

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

      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">Đang nhận diện (GPU có thể mất 2–10s)…</p>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {result.meta && (
            <p className="text-xs text-muted-foreground">
              {result.meta.engine}
              {result.meta.gpu ? ' · GPU' : ' · CPU'} · {result.meta.processing_ms}ms ·{' '}
              {result.meta.line_count} dòng
              {result.meta.confidence_avg != null &&
                ` · conf ${Math.round(result.meta.confidence_avg * 100)}%`}
            </p>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="font-jp text-lg font-normal leading-relaxed whitespace-pre-wrap">
                {result.extracted_text || '—'}
              </CardTitle>
            </CardHeader>
            {result.grammar_explanation && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{result.grammar_explanation}</p>
              </CardContent>
            )}
          </Card>

          {result.matched_vocabulary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Từ khớp trong sổ tay</CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {result.matched_vocabulary.slice(0, 12).map((v) => (
                  <div key={v.id} className="flex gap-3 px-4 py-2 text-sm">
                    <span className="font-jp font-medium">{v.word}</span>
                    <span className="text-muted-foreground">{v.reading}</span>
                    <span className="flex-1">{v.meaning}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
