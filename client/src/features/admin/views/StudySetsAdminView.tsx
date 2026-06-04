import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';

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
    <div>
      <h1 className="font-display text-2xl font-bold">Kiểm duyệt Study sets</h1>
      <p className="text-sm text-muted-foreground">
        {filtered.length}/{items.length} bộ · trạng thái: {status}
        {status === 'pending' && ' · chỉ bộ công khai chờ duyệt'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={status === s ? 'default' : 'outline'}
            onClick={() => setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <AdminListFilters
        className="mt-4"
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

      <ul className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {status === 'pending'
              ? 'Không có bộ chờ duyệt. Study set tạo ở chế độ riêng tư (không tick Công khai cộng đồng) sẽ không vào hàng đợi — học viên cần sửa bộ và bật công khai.'
              : 'Không có bộ phù hợp.'}
          </p>
        )}
        {filtered.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <Link
                to={paths.admin.studySetDetail(s.id)}
                className="font-medium hover:text-primary hover:underline"
              >
                {s.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {s.owner?.displayName ?? s.owner?.email} · {s.itemCount} mục ·{' '}
                {s.moderationStatus}
              </p>
              <StudySetTypeBadges typeCounts={s.typeCounts} className="mt-2" />
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
          </li>
        ))}
      </ul>
    </div>
  );
}
