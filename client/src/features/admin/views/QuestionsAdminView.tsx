import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { AdminListFilters, JlptLevelFilter } from '../components/admin-list-filters';
import { JLPT_ALL } from '../constants';
import { createQuestion, deleteQuestion, listQuestions, type QuestionItem } from '../services/adminApi';

export function QuestionsAdminView() {
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [jlptLevel, setJlptLevel] = useState(JLPT_ALL);
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [createJlpt, setCreateJlpt] = useState('N5');

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
    try {
      await createQuestion({
        questionText: text,
        questionType: 'multiple_choice',
        correctAnswer: answer,
        jlptLevel: createJlpt,
        options: [
          { label: 'A', text: answer },
          { label: 'B', text: '—' },
        ],
      });
      setText('');
      setAnswer('');
      toast.success('Đã tạo câu hỏi');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Câu hỏi</h1>
      <p className="text-sm text-muted-foreground">{total} câu hỏi</p>

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
          <Input placeholder="Đáp án đúng" value={answer} onChange={(e) => setAnswer(e.target.value)} />
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
          <Button onClick={handleCreate}>Thêm</Button>
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
