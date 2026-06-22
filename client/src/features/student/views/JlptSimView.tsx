import { Clock, ClipboardCheck, FileText, Play, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageShell } from '@/components/usable/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return (
    <PageShell
      eyebrow="Luyện tập"
      title="Luyện thi JLPT"
      description="Chọn cấp độ và đề thi thử — làm bài có giới hạn thời gian, bảng điều hướng câu hỏi và kết quả theo từng phần."
      icon={ClipboardCheck}
      iconClassName="bg-secondary"
      tone="secondary"
      chips={['N5', 'N4', 'N3', 'N2', 'N1']}
      footer="Mỗi đề có số lượt thi giới hạn — bạn có thể tiếp tục bài đang làm dở nếu thoát giữa chừng."
    >
      <div className="mb-6 rounded-xl border border-border bg-surface-paper p-3 shadow-premium card-lift">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Chọn cấp độ
        </p>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Đang tải đề thi…
          </CardContent>
        </Card>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Chưa có đề thi {level}. Liên hệ giáo viên để được cập nhật đề.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="overflow-hidden">
              <CardHeader className="border-b border-border bg-muted py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{exam.jlptLevel}</Badge>
                      {exam.hasActiveSession && (
                        <Badge className="bg-amber-100 text-amber-900">Đang làm dở</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-snug">{exam.title}</CardTitle>
                  </div>
                  <span className="rounded-lg border border-border bg-surface-paper px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-premium card-lift">
                    {exam.myAttemptCount}/{exam.maxAttempts} lượt
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_14rem] lg:items-center">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-paper px-3 py-2 shadow-premium card-lift">
                    <Clock className="size-4 shrink-0" />
                    <span>{exam.durationMinutes} phút</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-paper px-3 py-2 shadow-premium card-lift">
                    <FileText className="size-4 shrink-0" />
                    <span>{exam.questionCount} câu</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-paper px-3 py-2 shadow-premium card-lift">
                    <Users className="size-4 shrink-0" />
                    <span>Tối đa {exam.maxAttempts} lượt</span>
                  </div>
                </div>

                <div>
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
        </div>
      )}
    </PageShell>
  );
}
