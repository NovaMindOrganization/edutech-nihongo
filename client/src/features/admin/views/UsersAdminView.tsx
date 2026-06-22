import { UserRound, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AdminPageShell,
  AdminStatPill,
  AdminToolbar,
} from '../components/admin-page-shell';
import {
  AdminListFilters,
  AdminSearchFilter,
  UserRoleFilter,
  UserStatusFilterSelect,
} from '../components/admin-list-filters';
import type { UserStatusFilter } from '../constants';
import {
  banUser,
  listUsers,
  resetUserPassword,
  suspendUser,
  unbanUser,
  unsuspendUser,
  updateUserRole,
  type AdminUserRow,
} from '../services/systemAdminApi';

const ROLE_LABELS: Record<string, string> = {
  student: 'Học viên',
  instructor: 'Giảng viên',
  admin: 'Admin',
};

function UserRow({ user, onReload }: { user: AdminUserRow; onReload: () => void }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <AppIcon icon={UserRound} size="md" className="bg-brand-soft shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-extrabold">{user.email}</p>
          <p className="mt-0.5 truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {ROLE_LABELS[user.role] ?? user.role}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.isBanned && (
              <Badge className="border-0 bg-destructive/15 text-destructive">Đã cấm</Badge>
            )}
            {user.isSuspended && (
              <Badge className="border-0 bg-tertiary text-tertiary-foreground">Tạm khóa</Badge>
            )}
            {!user.isBanned && !user.isSuspended && (
              <Badge className="border-0 bg-quaternary/30 text-quaternary-foreground">Hoạt động</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <select
          className="min-h-10 rounded-xl border border-border bg-surface-paper px-3 text-xs font-bold shadow-sm"
          value={user.role}
          onChange={(e) =>
            updateUserRole(user.id, e.target.value).then(onReload).catch((err) =>
              toast.error(err instanceof Error ? err.message : 'Lỗi'),
            )
          }
        >
          <option value="student">Học viên</option>
          <option value="instructor">Giảng viên</option>
          <option value="admin">Admin</option>
        </select>
        {!user.isBanned ? (
          <Button size="sm" variant="outline" onClick={() => banUser(user.id).then(onReload)}>
            Cấm
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => unbanUser(user.id).then(onReload)}>
            Bỏ cấm
          </Button>
        )}
        {!user.isSuspended ? (
          <Button size="sm" variant="outline" onClick={() => suspendUser(user.id).then(onReload)}>
            Khóa tạm
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => unsuspendUser(user.id).then(onReload)}>
            Mở khóa
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const password = window.prompt(`Mật khẩu mới cho ${user.email}:`);
            if (!password || password.length < 8) {
              toast.error('Mật khẩu tối thiểu 8 ký tự');
              return;
            }
            resetUserPassword(user.id, password)
              .then(() => toast.success('Đã reset mật khẩu'))
              .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
          }}
        >
          Reset MK
        </Button>
      </div>
    </div>
  );
}

export function UsersAdminView() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<UserStatusFilter>('');

  const load = useCallback(async () => {
    try {
      const data = await listUsers({
        page,
        limit: 30,
        ...(role ? { role } : {}),
        ...(search.trim() ? { q: search.trim() } : {}),
        ...(status ? { status } : {}),
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }, [page, role, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  function resetFilters() {
    setSearch('');
    setRole('');
    setStatus('');
    setPage(1);
  }

  const hasFilters = Boolean(search.trim() || role || status);
  const totalPages = Math.max(1, Math.ceil(total / 30));

  const roleCounts = useMemo(() => {
    const counts = { student: 0, instructor: 0, admin: 0 };
    for (const u of users) {
      if (u.role in counts) counts[u.role as keyof typeof counts] += 1;
    }
    return counts;
  }, [users]);

  return (
    <AdminPageShell
      title="Người dùng"
      description="Quản lý tài khoản, phân quyền, khóa/mở và reset mật khẩu học viên."
      icon={Users}
      iconClassName="bg-quaternary"
      tone="quaternary"
      chips={['Học viên', 'Giảng viên', 'Admin', 'Phân quyền']}
      footer="Thay đổi vai trò có hiệu lực ngay — cấm/tạm khóa chặn đăng nhập."
      headerExtra={
        <div className="grid grid-cols-2 gap-2">
          <AdminStatPill label="Tổng tài khoản" value={total} accent="brand" />
          <AdminStatPill label="Trang này" value={users.length} />
        </div>
      }
    >
      <div className="space-y-5">
        <AdminToolbar>
          <AdminListFilters onReset={hasFilters ? resetFilters : undefined} className="mt-0 border-0 bg-transparent p-0 shadow-none">
            <AdminSearchFilter
              value={search}
              placeholder="Email, tên hiển thị…"
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
            <UserRoleFilter
              value={role}
              onChange={(v) => {
                setRole(v);
                setPage(1);
              }}
            />
            <UserStatusFilterSelect
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            />
          </AdminListFilters>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
            {Object.entries(roleCounts).map(([key, count]) => (
              <span
                key={key}
                className="rounded-full border border-border bg-surface-paper px-3 py-1 text-xs font-bold text-muted-foreground"
              >
                {ROLE_LABELS[key] ?? key}: {count}
              </span>
            ))}
          </div>
        </AdminToolbar>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface-paper/50 shadow-premium card-lift">
          {users.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm font-medium text-muted-foreground">
              Không có kết quả phù hợp bộ lọc.
            </p>
          ) : (
            users.map((u) => <UserRow key={u.id} user={u} onReload={load} />)
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="text-sm font-bold text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      </div>
    </AdminPageShell>
  );
}
