import { Clock, FileText, Play, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageGrid, PageShell } from '@/components/usable/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';
import { listJlptExams, type JlptExamListItem } from '@/features/student/services/studentApi';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export function JlptSimView() {
  const [level, setLevel] = useState<string>('N5');
  const [exams, setExams] = useState<JlptExamListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listJlptExams(level);
      setExams(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được danh sách đề');
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      eyebrow="Luyện tập"
      title="Luyện thi JLPT"
      description="Chọn cấp độ và đề thi thử — làm bài có giới hạn thời gian, bảng điều hướng câu hỏi và kết quả theo từng phần."
    >
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
        <p className="text-sm text-muted-foreground">Đang tải đề thi…</p>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Chưa có đề thi {level}. Liên hệ giáo viên để được cập nhật đề.
            </p>
          </CardContent>
        </Card>
      ) : (
        <PageGrid cols="wide">
          {exams.map((exam) => (
            <Card key={exam.id} className="flex h-full flex-col overflow-hidden">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{exam.jlptLevel}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {exam.myAttemptCount}/{exam.maxAttempts} lượt
                    {exam.hasActiveSession ? ' · đang làm dở' : ''}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
                  {exam.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" />
                    {exam.durationMinutes} phút
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-3.5 shrink-0" />
                    {exam.questionCount} câu
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5 shrink-0" />
                    Tối đa {exam.maxAttempts} lượt / học viên
                  </span>
                </div>

                <div className="mt-auto border-t border-border/60 pt-4">
                  {exam.questionCount === 0 ? (
                    <Button className="w-full" size="lg" variant="secondary" disabled>
                      Chưa có câu hỏi
                    </Button>
                  ) : !exam.canStart ? (
                    <Button className="w-full" size="lg" variant="secondary" disabled>
                      Đã hết lượt thi
                    </Button>
                  ) : (
                    <Link
                      to={paths.student.jlptExam(exam.id)}
                      state={{ exam }}
                      className={cn(buttonVariants({ size: 'lg' }), 'w-full gap-2')}
                    >
                      <Play className="size-4" />
                      {exam.hasActiveSession ? 'Tiếp tục thi' : 'Bắt đầu thi'}
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </PageGrid>
      )}
    </PageShell>
  );
}
