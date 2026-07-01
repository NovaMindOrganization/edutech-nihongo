import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { ViewState } from '@/components/usable/states';
import { paths } from '@/router/paths';

import {
  FeedbackCategoryBadge,
  FeedbackStatusBadge,
} from '../components/FeedbackStatusBadge';
import type { FeedbackStatus } from '../constants';
import { listStudentFeedbacks, type FeedbackRow } from '../services/feedbackApi';

const STATUS_FILTERS: Array<{ value: FeedbackStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'resolved', label: 'Đã xử lý' },
  { value: 'closed', label: 'Đã đóng' },
];

export function FeedbackHubView() {
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listStudentFeedbacks({
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        limit: 50,
      });
      setItems(data.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được góp ý');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const emptyDescription = useMemo(
    () =>
      statusFilter === 'all'
        ? 'Bạn chưa gửi góp ý nào. Dùng nút Góp ý trên header để gửi phản hồi mới.'
        : 'Không có góp ý nào ở trạng thái này.',
    [statusFilter],
  );

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Hỗ trợ"
      title="Góp ý của tôi"
      description="Theo dõi trạng thái xử lý các góp ý bạn đã gửi."
    >
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? 'default' : 'outline'}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <ViewState
            loading={loading}
            empty={!loading && items.length === 0}
            loadingLabel="Đang tải góp ý…"
            emptyTitle="Chưa có góp ý"
            emptyDescription={emptyDescription}
          >
            <div className="divide-y">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={paths.student.feedbackDetail(item.id)}
                  className="block space-y-2 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <FeedbackStatusBadge status={item.status} />
                    <FeedbackCategoryBadge category={item.category} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  {item.lesson ? (
                    <p className="text-xs text-muted-foreground">Bài học: {item.lesson.title}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          </ViewState>
        </CardContent>
      </Card>
    </PageShell>
  );
}
