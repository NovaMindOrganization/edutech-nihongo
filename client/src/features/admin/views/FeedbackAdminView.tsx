import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AdminListSkeleton, ViewState } from '@/components/usable/states';
import {
  FeedbackCategoryBadge,
  FeedbackStatusBadge,
} from '@/features/feedback/components/FeedbackStatusBadge';
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  type FeedbackCategory,
  type FeedbackStatus,
} from '@/features/feedback/constants';
import {
  listStaffFeedbacks,
  type FeedbackRow,
  type StaffFeedbackScope,
} from '@/features/feedback/services/feedbackApi';
import { paths } from '@/router/paths';

type FeedbackAdminViewProps = {
  scope: StaffFeedbackScope;
};

const STATUS_OPTIONS: Array<FeedbackStatus | 'all'> = [
  'all',
  'pending',
  'in_progress',
  'resolved',
  'rejected',
  'closed',
];

export function FeedbackAdminView({ scope }: FeedbackAdminViewProps) {
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<FeedbackStatus | 'all'>('pending');
  const [category, setCategory] = useState<FeedbackCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const title =
    scope === 'instructor' ? 'Góp ý bài học' : 'Phản hồi học viên';
  const description =
    scope === 'instructor'
      ? 'Xử lý góp ý về nội dung bài học từ học viên.'
      : 'Quản lý tất cả phản hồi: lỗi hệ thống, thanh toán, nội dung bài học…';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listStaffFeedbacks(scope, {
        ...(status !== 'all' ? { status } : {}),
        ...(category !== 'all' && scope === 'admin' ? { category } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        limit: 50,
      });
      setItems(data.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được góp ý');
    } finally {
      setLoading(false);
    }
  }, [scope, status, category, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Trạng thái
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FeedbackStatus | 'all')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'Tất cả' : FEEDBACK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {scope === 'admin' ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Loại
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory | 'all')}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="all">Tất cả</option>
              {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map((c) => (
                <option key={c} value={c}>
                  {FEEDBACK_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Tìm kiếm
          </label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tiêu đề, mô tả…"
          />
        </div>

        <Button size="sm" onClick={() => void load()}>
          Lọc
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <ViewState
            loading={loading}
            empty={!loading && items.length === 0}
            loadingSkeleton={
              <div className="p-5">
                <AdminListSkeleton count={4} />
              </div>
            }
            loadingLabel="Đang tải góp ý…"
            emptyTitle="Không có góp ý"
            emptyDescription="Chưa có phản hồi nào phù hợp bộ lọc."
            emptyTone="admin"
          >
            <div className="divide-y">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={paths.admin.feedbackDetail(item.id)}
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
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Học viên: {item.user?.email ?? '—'}</span>
                    {item.lesson ? <Badge variant="outline">Bài: {item.lesson.title}</Badge> : null}
                  </div>
                </Link>
              ))}
            </div>
          </ViewState>
        </CardContent>
      </Card>
    </div>
  );
}
