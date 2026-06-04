import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { AdminListFilters, JlptLevelFilter } from '../components/admin-list-filters';
import { JLPT_ALL } from '../constants';
import { createQuestion, deleteQuestion, listQuestions, type QuestionItem } from '../services/adminApi';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export function QuestionsAdminView() {
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [jlptLevel, setJlptLevel] = useState(JLPT_ALL);
  const [text, setText] = useState('');
  const [createJlpt, setCreateJlpt] = useState('N5');
  const [category, setCategory] = useState('');
  const [explanation, setExplanation] = useState('');
  const [correctLabel, setCorrectLabel] = useState('A');
  const [options, setOptions] = useState<Record<string, string>>({
    A: '',
    B: '',
    C: '',
    D: '',
  });

  const load = useCallback(async () => {
    try {
      const data = await listQuestions({
        page,
        limit: 40,
        ...(jlptLevel ? { jlptLevel } : {}),
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }, [page, jlptLevel]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    const opts = OPTION_LABELS.map((label) => ({
      label,
      text: options[label]?.trim() ?? '',
    })).filter((o) => o.text);

    if (!text.trim() || opts.length < 2) {
      toast.error('Nhập câu hỏi và ít nhất 2 đáp án');
      return;
    }

    const correct = opts.find((o) => o.label === correctLabel);
    if (!correct) {
      toast.error('Chọn đáp án đúng');
      return;
    }

    try {
      await createQuestion({
        questionText: text.trim(),
        questionType: 'multiple_choice',
        correctAnswer: correct.text,
        jlptLevel: createJlpt,
        questionCategory: category.trim() || undefined,
        options: opts,
        explanation: explanation.trim() || undefined,
      });
      setText('');
      setCategory('');
      setExplanation('');
      setOptions({ A: '', B: '', C: '', D: '' });
      setCorrectLabel('A');
      toast.success('Đã tạo câu hỏi');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Ngân hàng câu hỏi</h1>
      <p className="text-sm text-muted-foreground">
        {total} câu — dùng cho đề JLPT hoặc gán vào bài học
      </p>

      <AdminListFilters>
        <JlptLevelFilter
          value={jlptLevel}
          onChange={(v) => {
            setJlptLevel(v);
            setPage(1);
          }}
        />
      </AdminListFilters>

      <Card className="mt-6">
        <CardContent className="space-y-3 p-4">
          <Input placeholder="Nội dung câu hỏi" value={text} onChange={(e) => setText(e.target.value)} />
          {OPTION_LABELS.map((label) => (
            <div key={label} className="flex gap-2">
              <span className="flex w-8 items-center text-sm font-medium">{label}</span>
              <Input
                placeholder={`Đáp án ${label}`}
                value={options[label]}
                onChange={(e) => setOptions((o) => ({ ...o, [label]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              value={correctLabel}
              onChange={(e) => setCorrectLabel(e.target.value)}
            >
              {OPTION_LABELS.map((l) => (
                <option key={l} value={l}>
                  Đáp án đúng: {l}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              value={createJlpt}
              onChange={(e) => setCreateJlpt(e.target.value)}
            >
              {['N5', 'N4', 'N3', 'N2', 'N1'].map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
            <Input
              className="flex-1 min-w-[10rem]"
              placeholder="Phân loại (vd: 文字・語彙)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <Input
            placeholder="Giải thích (tuỳ chọn)"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
          <Button onClick={handleCreate}>Thêm vào ngân hàng</Button>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardContent className="divide-y p-0">
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Không có câu hỏi.</p>
          ) : (
            items.map((q) => (
              <div key={q.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-jp">{q.questionText}</p>
                  {q.jlptLevel && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{q.jlptLevel}</p>
                  )}
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteQuestion(q.id).then(load)}>
                  Xóa
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </Button>
        <span className="flex items-center text-sm">
          Trang {page} / {Math.max(1, Math.ceil(total / 40))}
        </span>
        <Button variant="outline" disabled={page * 40 >= total} onClick={() => setPage((p) => p + 1)}>
          Sau
        </Button>
      </div>
    </div>
  );
}
