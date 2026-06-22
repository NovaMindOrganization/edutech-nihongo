import { HelpCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InsetEmpty } from '@/components/usable/inset-empty';
import { Input } from '@/components/ui/input';

import {
  AdminListPanel,
  AdminPagination,
  AdminSection,
  StaffListPageShell,
} from '../components/admin-page-shell';
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
    <StaffListPageShell
      title="Ngân hàng câu hỏi"
      description="MCQ dùng chung cho đề JLPT mock hoặc gán vào bài học."
      icon={HelpCircle}
      iconClassName="bg-brand-soft"
      tone="brand"
      chips={['MCQ', 'JLPT', 'Import']}
      total={total}
      secondaryStat={{ label: 'Trang này', value: items.length }}
      filters={
        <AdminListFilters className="mt-0 border-0 bg-transparent p-0 shadow-none">
          <JlptLevelFilter
            value={jlptLevel}
            onChange={(v) => {
              setJlptLevel(v);
              setPage(1);
            }}
          />
        </AdminListFilters>
      }
      pagination={
        <AdminPagination
          page={page}
          total={total}
          pageSize={40}
          onPrevious={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      }
    >
      <AdminSection
        title="Thêm câu hỏi mới"
        description="Nhập nội dung, đáp án A–D và chọn đáp án đúng."
        icon={HelpCircle}
        iconClassName="bg-secondary"
      >
        <Input placeholder="Nội dung câu hỏi" value={text} onChange={(e) => setText(e.target.value)} />
        {OPTION_LABELS.map((label) => (
          <div key={label} className="flex gap-2">
            <span className="flex w-8 items-center text-sm font-bold">{label}</span>
            <Input
              placeholder={`Đáp án ${label}`}
              value={options[label]}
              onChange={(e) => setOptions((o) => ({ ...o, [label]: e.target.value }))}
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <select
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm"
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
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm"
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
            className="min-w-[10rem] flex-1"
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
      </AdminSection>

      <AdminListPanel>
        {items.length === 0 ? (
          <InsetEmpty tone="exam" title="Không có câu hỏi" description="Thêm câu hỏi mới hoặc đổi bộ lọc JLPT." />
        ) : (
          items.map((q) => (
            <div key={q.id} className="flex items-start gap-3 border-b border-border/70 px-4 py-3 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-jp font-medium">{q.questionText}</p>
                {q.jlptLevel ? (
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {q.jlptLevel}
                  </p>
                ) : null}
              </div>
              <Button size="sm" variant="destructive" onClick={() => deleteQuestion(q.id).then(load)}>
                Xóa
              </Button>
            </div>
          ))
        )}
      </AdminListPanel>
    </StaffListPageShell>
  );
}
