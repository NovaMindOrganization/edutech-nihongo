import { Clock, FileText, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

import {
  createMockExam,
  deleteMockExam,
  listMockExams,
  type MockExamListItem,
} from '../services/adminApi';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export function MockExamsAdminView() {
  const [level, setLevel] = useState<string>('N5');
  const [items, setItems] = useState<MockExamListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('105');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [createLevel, setCreateLevel] = useState('N5');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMockExams({ jlptLevel: level, limit: 50 });
      setItems(data.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được danh sách đề');
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!title.trim()) {
      toast.error('Nhập tên đề thi');
      return;
    }
    try {
      const exam = await createMockExam({
        title: title.trim(),
        jlptLevel: createLevel,
        durationMinutes: Number(duration) || 105,
        maxAttempts: Math.min(99, Math.max(1, Number(maxAttempts) || 3)),
      });
      toast.success('Đã tạo đề thi');
      setDialogOpen(false);
      setTitle('');
      setLevel(createLevel);
      window.location.href = paths.admin.mockExamDetail(exam.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tạo được đề');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa đề thi này?')) return;
    try {
      await deleteMockExam(id);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không xóa được');
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm tracking-widest text-primary uppercase">JLPT</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Đề thi JLPT</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo đề thủ công hoặc import câu hỏi hàng loạt
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đề mới
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Button
            key={l}
            size="sm"
            variant={level === l ? 'default' : 'outline'}
            onClick={() => setLevel(l)}
          >
            {l}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Chưa có đề {level}. Tạo đề mới để bắt đầu.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((exam) => (
            <Card key={exam.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary">{exam.jlptLevel}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(exam.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
                  {exam.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {exam.durationMinutes} phút
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {exam.questionCount} câu
                  </span>
                  <span>{exam.maxAttempts} lượt / HV · {exam.totalSessions} phiên</span>
                </div>
                <Link
                  to={paths.admin.mockExamDetail(exam.id)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Quản lý câu hỏi
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Tạo đề thi mới">
        <div className="space-y-3">
          <Input
            placeholder="Tên đề (vd: Đề thi JLPT N5 – Đề 1)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className={cn(
                'flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm',
              )}
              value={createLevel}
              onChange={(e) => setCreateLevel(e.target.value)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={10}
              max={300}
              className="w-28"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Phút"
            />
            <Input
              type="number"
              min={1}
              max={99}
              className="w-24"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="Lượt"
              title="Số lượt thi tối đa mỗi học viên"
            />
          </div>
          <Button className="w-full" onClick={handleCreate}>
            Tạo và thêm câu hỏi
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
