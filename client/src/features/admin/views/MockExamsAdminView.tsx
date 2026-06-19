import { ArrowRight, ClipboardList, Clock, FileText, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InsetEmpty } from '@/components/usable/inset-empty';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

import { StaffListPageShell } from '../components/admin-page-shell';
import {
  createMockExam,
  deleteMockExam,
  listMockExams,
  type MockExamListItem,
} from '../services/adminApi';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

function ExamAdminCard({
  exam,
  onDelete,
}: {
  exam: MockExamListItem;
  onDelete: () => void;
}) {
  return (
    <article className="depth-interactive relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface-paper/50 p-5 shadow-premium card-lift">
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border bg-secondary/10" />
      <div className="relative flex items-start justify-between gap-2">
        <Badge className="border-0 bg-secondary text-secondary-foreground">{exam.jlptLevel}</Badge>
        <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
      <h3 className="relative mt-3 font-display text-lg font-extrabold leading-snug">{exam.title}</h3>
      <div className="relative mt-3 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {exam.durationMinutes} phút
        </span>
        <span className="inline-flex items-center gap-1">
          <FileText className="size-3.5" />
          {exam.questionCount} câu
        </span>
        <span>
          {exam.maxAttempts} lượt/HV · {exam.totalSessions} phiên
        </span>
      </div>
      <Link
        to={paths.admin.mockExamDetail(exam.id)}
        className={cn(buttonVariants({ size: 'sm' }), 'relative mt-5 w-full gap-1.5')}
      >
        Quản lý câu hỏi
        <ArrowRight className="size-3.5" />
      </Link>
    </article>
  );
}

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
    <>
      <StaffListPageShell
        title="Đề thi JLPT"
        description="Tạo đề mock thủ công, import câu hỏi hàng loạt và cấu hình thời gian/lượt thi."
        icon={ClipboardList}
        iconClassName="bg-secondary/50"
        tone="secondary"
        chips={['JLPT', 'Mock exam', 'Import']}
        secondaryStat={{ label: `Đề ${level}`, value: items.length }}
        createAction={
          <Button onClick={() => setDialogOpen(true)} className="w-full">
            <Plus className="mr-1.5 size-4" />
            Tạo đề mới
          </Button>
        }
        toolbarExtra={
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
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
        }
      >
        {loading ? (
          <p className="text-sm font-medium text-muted-foreground">Đang tải…</p>
        ) : items.length === 0 ? (
          <InsetEmpty
            tone="exam"
            title={`Chưa có đề ${level}`}
            description="Tạo đề mới để bắt đầu thêm câu hỏi."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                Tạo đề đầu tiên
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((exam) => (
              <ExamAdminCard key={exam.id} exam={exam} onDelete={() => handleDelete(exam.id)} />
            ))}
          </div>
        )}
      </StaffListPageShell>

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
                'flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm',
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
    </>
  );
}
