import { useMemo, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { AdminListFilters, AdminSearchFilter } from '../components/admin-list-filters';
import { listPendingStudySets, moderateStudySet } from '../services/adminApi';

export function StudySetsAdminView() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listPendingStudySets>>>([]);
  const [search, setSearch] = useState('');

  async function load() {
    setItems(await listPendingStudySets());
  }

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.owner.email ?? '').toLowerCase().includes(q) ||
        (s.owner.displayName ?? '').toLowerCase().includes(q),
    );
  }, [items, search]);

  async function moderate(id: string, status: 'approved' | 'rejected') {
    await moderateStudySet(id, status);
    toast.success(status === 'approved' ? 'Đã duyệt' : 'Đã từ chối');
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Kiểm duyệt Study sets</h1>
      <p className="text-sm text-muted-foreground">
        {filtered.length}/{items.length} chờ duyệt
      </p>

      <AdminListFilters onReset={search.trim() ? () => setSearch('') : undefined}>
        <AdminSearchFilter
          value={search}
          placeholder="Tiêu đề, email chủ sở hữu…"
          onChange={setSearch}
        />
      </AdminListFilters>

      <ul className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Không có bộ thẻ chờ duyệt.</p>
        )}
        {filtered.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3"
          >
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">
                {s.owner.displayName ?? s.owner.email} · {s._count.cards} thẻ
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => moderate(s.id, 'approved')}>
                Duyệt
              </Button>
              <Button size="sm" variant="destructive" onClick={() => moderate(s.id, 'rejected')}>
                Từ chối
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
