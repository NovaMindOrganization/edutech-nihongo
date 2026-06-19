import { ArrowLeft, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

import {
  getMockExam,
  importMockExamQuestions,
  removeMockExamQuestion,
  type MockExamDetail,
  type ImportQuestionBody,
} from '../services/adminApi';
import { parseJlptImportText } from '../utils/jlpt-import-parser';

const IMPORT_HINT = `Q: ___のことばはひらがなでどうかきますか
A: しがつ
B: しかつ
C: よかつ
D: よげつ
ANS: A
EXP: 四月は「しがつ」
CAT: 文字・語彙

(Cách nhau bằng dòng trống — hoặc dán JSON array)`;

type TabId = 'manual' | 'import';

const emptyManual = (): ImportQuestionBody => ({
  questionText: '',
  options: [
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ],
  correctAnswer: '',
  explanation: '',
  questionCategory: '',
  section: '',
});

export function MockExamDetailAdminView() {
  const { examId = '' } = useParams();
  const [exam, setExam] = useState<MockExamDetail | null>(null);
  const [tab, setTab] = useState<TabId>('manual');
  const [manual, setManual] = useState(emptyManual);
  const [correctLabel, setCorrectLabel] = useState('A');
  const [importText, setImportText] = useState('');
  const [preview, setPreview] = useState<ImportQuestionBody[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!examId) return;
    try {
      const data = await getMockExam(examId);
      setExam(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được đề');
    }
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPreview(parseJlptImportText(importText));
  }, [importText]);

  function buildManualPayload(): ImportQuestionBody | null {
    const options = manual.options.filter((o) => o.text.trim());
    if (!manual.questionText.trim() || options.length < 2) return null;
    const picked = options.find((o) => o.label === correctLabel);
    if (!picked?.text.trim()) {
      toast.error('Chọn đáp án đúng hợp lệ');
      return null;
    }
    return {
      ...manual,
      questionText: manual.questionText.trim(),
      options,
      correctAnswer: picked.text.trim(),
      section: manual.section || manual.questionCategory,
    };
  }

  async function handleAddManual() {
    const payload = buildManualPayload();
    if (!payload) {
      toast.error('Điền đủ nội dung và ít nhất 2 đáp án');
      return;
    }
    setLoading(true);
    try {
      await importMockExamQuestions(examId, [payload]);
      toast.success('Đã thêm câu hỏi');
      setManual(emptyManual());
      setCorrectLabel('A');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi thêm câu');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (preview.length === 0) {
      toast.error('Không parse được câu hỏi nào');
      return;
    }
    setLoading(true);
    try {
      const data = await importMockExamQuestions(examId, preview);
      toast.success(`Đã import ${data.imported} câu`);
      setImportText('');
      setPreview([]);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveQuestion(questionId: string) {
    if (!confirm('Gỡ câu hỏi khỏi đề?')) return;
    try {
      await removeMockExamQuestion(examId, questionId);
      toast.success('Đã gỡ');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  if (!exam) {
    return <p className="text-sm text-muted-foreground">Đang tải đề thi…</p>;
  }

  return (
    <div className="w-full">
      <Link
        to={paths.admin.mockExams}
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Danh sách đề
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-border/60 pb-6">
        <Badge>{exam.jlptLevel}</Badge>
        <h1 className="font-display text-2xl font-bold">{exam.title}</h1>
        <span className="text-sm text-muted-foreground">
          {exam.durationMinutes} phút · {exam.questions.length} câu · {exam.maxAttempts} lượt/HV
          · {exam.totalSessions} phiên
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={tab === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('manual')}
        >
          Thêm câu hỏi
        </Button>
        <Button
          variant={tab === 'import' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('import')}
        >
          <Upload className="mr-1 h-4 w-4" />
          Import hàng loạt
        </Button>
      </div>

      {tab === 'manual' ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Thêm một câu (trắc nghiệm 4 đáp án)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nội dung câu hỏi"
              value={manual.questionText}
              onChange={(e) => setManual((m) => ({ ...m, questionText: e.target.value }))}
            />
            {manual.options.map((opt, i) => (
              <div key={opt.label} className="flex gap-2">
                <span className="flex w-8 items-center text-sm font-medium">{opt.label}</span>
                <Input
                  placeholder={`Đáp án ${opt.label}`}
                  value={opt.text}
                  onChange={(e) => {
                    const next = [...manual.options];
                    next[i] = { ...opt, text: e.target.value };
                    setManual((m) => ({ ...m, options: next }));
                  }}
                />
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={correctLabel}
                onChange={(e) => setCorrectLabel(e.target.value)}
              >
                {['A', 'B', 'C', 'D'].map((l) => (
                  <option key={l} value={l}>
                    Đáp án đúng: {l}
                  </option>
                ))}
              </select>
              <Input
                className="flex-1 min-w-[12rem]"
                placeholder="Phân loại (vd: 文字・語彙)"
                value={manual.questionCategory ?? ''}
                onChange={(e) =>
                  setManual((m) => ({
                    ...m,
                    questionCategory: e.target.value,
                    section: e.target.value,
                  }))
                }
              />
            </div>
            <Input
              placeholder="Giải thích (tuỳ chọn)"
              value={manual.explanation ?? ''}
              onChange={(e) => setManual((m) => ({ ...m, explanation: e.target.value }))}
            />
            <Button disabled={loading} onClick={handleAddManual}>
              Thêm vào đề
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Import từ text / JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground whitespace-pre-wrap">
              {IMPORT_HINT}
            </pre>
            <textarea
              className="min-h-[200px] w-full rounded-lg border border-border bg-background p-3 font-mono text-sm"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Dán nội dung import…"
            />
            {preview.length > 0 && (
              <p className="text-sm text-primary">
                Preview: {preview.length} câu sẽ được thêm
              </p>
            )}
            <Button disabled={loading || preview.length === 0} onClick={handleImport}>
              Import {preview.length > 0 ? preview.length : ''} câu
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Câu hỏi trong đề ({exam.questions.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {exam.questions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Chưa có câu hỏi.</p>
          ) : (
            exam.questions.map((row) => (
              <div key={row.question.id} className="flex gap-3 px-4 py-4">
                <span className="text-xs font-medium text-muted-foreground w-6">
                  {row.order}
                </span>
                <div className="min-w-0 flex-1">
                  {row.section && (
                    <Badge variant="outline" className="mb-1 text-xs">
                      {row.section}
                    </Badge>
                  )}
                  <p className="font-jp text-sm">{row.question.questionText}</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                    {(row.question.options ?? []).map((o) => (
                      <li
                        key={o.label}
                        className={cn(
                          o.text === row.question.correctAnswer && 'font-medium text-primary',
                        )}
                      >
                        {o.label}. {o.text}
                        {o.text === row.question.correctAnswer ? ' ✓' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveQuestion(row.question.id)}
                >
                  Gỡ
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
