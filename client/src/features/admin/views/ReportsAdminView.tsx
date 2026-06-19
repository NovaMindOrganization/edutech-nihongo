import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdminListSkeleton, ViewState } from '@/components/usable/states';

import { listReports, resolveReport, type AbuseReportRow } from '../services/systemAdminApi';

export function ReportsAdminView() {
  const [items, setItems] = useState<AbuseReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listReports());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleResolve(id: string, status: 'resolved' | 'dismissed') {
    try {
      await resolveReport(id, status);
      toast.success(status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Báo cáo lạm dụng</h1>
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
            loadingLabel="Đang tải báo cáo…"
            emptyTitle="Không có báo cáo"
            emptyDescription="Mọi thứ đang ổn — chưa có báo cáo lạm dụng nào cần xử lý."
            emptyTone="admin"
          >
            <div className="divide-y">
              {items.map((r) => (
              <div key={r.id} className="space-y-2 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm">
                  <strong>Người báo:</strong> {r.reporter?.email ?? '—'}
                </p>
                <p className="text-sm">
                  <strong>Đối tượng:</strong> {r.reported?.email ?? '—'}
                </p>
                <p className="text-sm text-muted-foreground">{r.reason}</p>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleResolve(r.id, 'resolved')}>
                      Xử lý
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(r.id, 'dismissed')}>
                      Bỏ qua
                    </Button>
                  </div>
                )}
              </div>
              ))}
            </div>
          </ViewState>
        </CardContent>
      </Card>
    </div>
  );
}
