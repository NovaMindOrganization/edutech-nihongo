import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { useAuthStore } from '@/features/auth';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import { FeedbackThread } from '../components/FeedbackThread';
import {
  FeedbackCategoryBadge,
  FeedbackStatusBadge,
} from '../components/FeedbackStatusBadge';
import { canStudentReply } from '../constants';
import {
  closeStudentFeedback,
  getStudentFeedback,
  postStudentMessage,
  type FeedbackRow,
} from '../services/feedbackApi';

export function FeedbackDetailView() {
  const { id = '' } = useParams();
  const user = useAuthStore((s) => s.user);
  const [feedback, setFeedback] = useState<FeedbackRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setFeedback(await getStudentFeedback(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được góp ý');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !id) return;
    setSending(true);
    try {
      const updated = await postStudentMessage(id, reply.trim());
      setFeedback(updated);
      setReply('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gửi thất bại');
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    if (!id) return;
    try {
      const updated = await closeStudentFeedback(id);
      setFeedback(updated);
      toast.success('Đã đóng góp ý');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi');
    }
  }

  if (loading) {
    return (
      <PageShell className={pageContentClass} title="Góp ý">
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </PageShell>
    );
  }

  if (!feedback) {
    return (
      <PageShell className={pageContentClass} title="Góp ý">
        <p className="text-sm text-muted-foreground">Không tìm thấy góp ý.</p>
        <Link
          to={paths.student.feedback}
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex')}
        >
          Quay lại
        </Link>
      </PageShell>
    );
  }

  const canReply = canStudentReply(feedback.status);
  const canClose = feedback.status !== 'closed' && feedback.status !== 'rejected';

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Góp ý"
      title={feedback.title}
      backLink={{ to: paths.student.feedback, label: 'Danh sách góp ý' }}
    >
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FeedbackStatusBadge status={feedback.status} />
        <FeedbackCategoryBadge category={feedback.category} />
      </div>

      {feedback.lesson || feedback.course ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {feedback.course ? `Khóa: ${feedback.course.title}` : null}
          {feedback.course && feedback.lesson ? ' · ' : null}
          {feedback.lesson ? `Bài: ${feedback.lesson.title}` : null}
        </p>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Trao đổi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeedbackThread
            messages={feedback.messages ?? []}
            currentUserId={user?.id}
          />

          {canReply ? (
            <form onSubmit={handleReply} className="space-y-2 border-t pt-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Viết thêm chi tiết…"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm" disabled={sending || !reply.trim()}>
                {sending ? 'Đang gửi…' : 'Gửi'}
              </Button>
            </form>
          ) : (
            <p className="border-t pt-4 text-sm text-muted-foreground">
              Ticket đã đóng hoặc đã xử lý — không thể gửi thêm tin nhắn.
            </p>
          )}

          {canClose ? (
            <Button variant="outline" size="sm" onClick={() => void handleClose()}>
              Đóng góp ý
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  );
}
