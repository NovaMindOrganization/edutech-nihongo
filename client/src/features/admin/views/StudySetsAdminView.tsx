import { Languages } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';

import { AdminListPanel, StaffListPageShell } from '../components/admin-page-shell';
import { StudySetApproveFields } from '../components/study-set-approve-fields';
import { AdminListFilters, AdminSearchFilter } from '../components/admin-list-filters';
import { StudySetTypeBadges } from '@/features/student/components/study-set-type-badges';
import { listAdminStudySets, moderateStudySet } from '../services/adminApi';
import {
  QUIZ_QUESTION_COUNT_MAX,
  QUIZ_QUESTION_COUNT_MIN,
  suggestQuizQuestionCount,
  type StudySetListRow,
} from '@/features/student/types/study-set.types';

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

const STATUS_LABELS: Record<StatusFilter, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  all: 'Tất cả',
};

export function StudySetsAdminView() {
  const [items, setItems] = useState<StudySetListRow[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [quizCounts, setQuizCounts] = useState<Record<string, number>>({});

  async function load() {
    const rows = await listAdminStudySets({ status, search: search.trim() || undefined });
    setItems(rows);
    setQuizCounts((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        if (next[row.id] == null) {
          next[row.id] = suggestQuizQuestionCount(row.itemCount);
        }
      }
      return next;
    });
  }

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, [status]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.owner?.email ?? '').toLowerCase().includes(q) ||
        (s.owner?.displayName ?? '').toLowerCase().includes(q),
    );
  }, [items, search]);

  async function quickModerate(
    id: string,
    st: 'approved' | 'rejected',
    itemCount: number,
  ) {
    const count = quizCounts[id] ?? suggestQuizQuestionCount(itemCount);
    if (st === 'approved') {
      if (count < QUIZ_QUESTION_COUNT_MIN || count > QUIZ_QUESTION_COUNT_MAX) {
        toast.error(`Số câu quiz: ${QUIZ_QUESTION_COUNT_MIN}–${QUIZ_QUESTION_COUNT_MAX}`);
        return;
      }
    }
    try {
      await moderateStudySet(id, st, st === 'approved' ? { quizQuestionCount: count } : {});
      toast.success(
        st === 'approved'
          ? `Đã duyệt · đang tạo ${count} câu quiz bằng AI`
          : 'Đã từ chối',
      );
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <StaffListPageShell
      title="Kiểm duyệt Study sets"
      description="Duyệt bộ học cộng đồng do học viên tạo — chỉ bộ công khai vào hàng đợi."
      icon={Languages}
      iconClassName="bg-tertiary/40"
      tone="secondary"
      chips={['Cộng đồng', 'AI quiz', 'Moderation']}
      total={items.length}
      totalLabel="Tổng bộ"
      secondaryStat={{ label: 'Hiển thị', value: filtered.length }}
      toolbarExtra={
        <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
          {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={status === s ? 'default' : 'outline'}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      }
      filters={
        <AdminListFilters
          className="mt-0 border-0 bg-transparent p-0 shadow-none"
          onReset={search.trim() ? () => setSearch('') : undefined}
        >
          <AdminSearchFilter
            value={search}
            placeholder="Tiêu đề, email chủ sở hữu…"
            onChange={setSearch}
          />
          <Button type="button" size="sm" variant="secondary" onClick={() => load()}>
            Tải lại
          </Button>
        </AdminListFilters>
      }
    >
      <AdminListPanel>
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm font-medium text-muted-foreground">
            {status === 'pending'
              ? 'Không có bộ chờ duyệt. Study set riêng tư không vào hàng đợi — học viên cần bật công khai.'
              : 'Không có bộ phù hợp.'}
          </p>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-4 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={paths.admin.studySetDetail(s.id)}
                  className="font-display text-sm font-extrabold hover:text-brand"
                >
                  {s.title}
                </Link>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {s.owner?.displayName ?? s.owner?.email} · {s.itemCount} mục
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{s.moderationStatus}</Badge>
                  <StudySetTypeBadges typeCounts={s.typeCounts} />
                </div>
              </div>
              {s.moderationStatus === 'pending' && (
                <div className="flex min-w-[200px] flex-col gap-2 sm:min-w-[240px]">
                  <StudySetApproveFields
                    itemCount={s.itemCount}
                    quizQuestionCount={quizCounts[s.id] ?? suggestQuizQuestionCount(s.itemCount)}
                    onQuizQuestionCountChange={(n) =>
                      setQuizCounts((prev) => ({ ...prev, [s.id]: n }))
                    }
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => quickModerate(s.id, 'approved', s.itemCount)}>
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => quickModerate(s.id, 'rejected', s.itemCount)}
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </AdminListPanel>
    </StaffListPageShell>
  );
}
