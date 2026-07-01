import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackThread } from '@/features/feedback/components/FeedbackThread';
import {
  FeedbackCategoryBadge,
  FeedbackStatusBadge,
} from '@/features/feedback/components/FeedbackStatusBadge';
import {
  canStaffReply,
  FEEDBACK_STATUS_LABELS,
  type FeedbackStatus,
} from '@/features/feedback/constants';
import {
  getStaffFeedback,
  patchFeedbackStatus,
  postStaffMessage,
  type FeedbackRow,
  type StaffFeedbackScope,
} from '@/features/feedback/services/feedbackApi';
import { useAuthStore } from '@/features/auth';
import { isAdminRole } from '@/features/auth/utils/role-permissions';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

const STAFF_STATUS_OPTIONS: FeedbackStatus[] = [
  'in_progress',
  'resolved',
  'rejected',
];

export function FeedbackStaffDetailView() {
  const { id = '' } = useParams();
  const user = useAuthStore((s) => s.user);
  const scope: StaffFeedbackScope =
    user?.role && isAdminRole(user.role) ? 'admin' : 'instructor';

  const [feedback, setFeedback] = useState<FeedbackRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setFeedback(await getStaffFeedback(scope, id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được góp ý');
    } finally {
      setLoading(false);
    }
  }, [id, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !id) return;
    setSending(true);
    try {
      const updated = await postStaffMessage(scope, id, reply.trim(), isInternal);
      setFeedback(updated);
      setReply('');
      setIsInternal(false);
      toast.success('Đã gửi phản hồi');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gửi thất bại');
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: FeedbackStatus) {
    if (!id) return;
    setStatusUpdating(true);
    try {
      const updated = await patchFeedbackStatus(scope, id, status);
      setFeedback(updated);
      toast.success(`Đã cập nhật: ${FEEDBACK_STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  if (!feedback) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Không tìm thấy góp ý.</p>
        <Link
          to={paths.admin.feedbacks}
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex')}
        >
          Quay lại
        </Link>
      </div>
    );
  }

  const canReply = canStaffReply(feedback.status);

  return (
    <div>
      <Link
        to={paths.admin.feedbacks}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'inline-flex')}
      >
        ← Danh sách
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold">{feedback.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <FeedbackStatusBadge status={feedback.status} />
        <FeedbackCategoryBadge category={feedback.category} />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Học viên: {feedback.user?.email ?? '—'}
        {feedback.assignee ? ` · Phụ trách: ${feedback.assignee.email}` : ''}
      </p>
      {(feedback.course || feedback.lesson) && (
        <p className="text-sm text-muted-foreground">
          {feedback.course ? `Khóa: ${feedback.course.title}` : ''}
          {feedback.course && feedback.lesson ? ' · ' : ''}
          {feedback.lesson ? `Bài: ${feedback.lesson.title}` : ''}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {STAFF_STATUS_OPTIONS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={feedback.status === s ? 'default' : 'outline'}
            disabled={statusUpdating || feedback.status === s}
            onClick={() => void handleStatusChange(s)}
          >
            {FEEDBACK_STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Trao đổi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeedbackThread
            messages={feedback.messages ?? []}
            showInternal
            currentUserId={user?.id}
          />

          {canReply ? (
            <form onSubmit={handleReply} className="space-y-2 border-t pt-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Phản hồi cho học viên hoặc ghi chú nội bộ…"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                Ghi chú nội bộ (học viên không thấy)
              </label>
              <Button type="submit" size="sm" disabled={sending || !reply.trim()}>
                {sending ? 'Đang gửi…' : 'Gửi'}
              </Button>
            </form>
          ) : (
            <p className="border-t pt-4 text-sm text-muted-foreground">
              Ticket đã đóng — không thể gửi thêm tin nhắn.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
