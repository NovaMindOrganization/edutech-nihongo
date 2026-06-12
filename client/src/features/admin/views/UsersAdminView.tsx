import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  async function handleResetPassword(user: AdminUserRow) {
    const password = window.prompt(`Mật khẩu mới cho ${user.email}:`);
    if (!password || password.length < 8) {
      toast.error('Mật khẩu tối thiểu 8 ký tự');
      return;
    }
    try {
      await resetUserPassword(user.id, password);
      toast.success('Đã reset mật khẩu');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Người dùng</h1>
      <p className="text-sm text-muted-foreground">{total} tài khoản</p>

      <AdminListFilters onReset={hasFilters ? resetFilters : undefined}>
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

      <Card className="mt-6">
        <CardContent className="divide-y p-0">
          {users.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">Không có kết quả.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className="min-w-[180px] flex-1 text-sm">{u.email}</span>
                <select
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                  value={u.role}
                  onChange={(e) =>
                    updateUserRole(u.id, e.target.value).then(load).catch((err) =>
                      toast.error(err instanceof Error ? err.message : 'Lỗi'),
                    )
                  }
                >
                  <option value="student">student</option>
                  <option value="instructor">instructor</option>
                  <option value="admin">admin</option>
                </select>
                {u.isBanned && <Badge variant="outline">Banned</Badge>}
                {u.isSuspended && <Badge variant="outline">Suspended</Badge>}
                <div className="flex flex-wrap gap-1">
                  {!u.isBanned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => banUser(u.id).then(load)}
                    >
                      Ban
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => unbanUser(u.id).then(load)}>
                      Unban
                    </Button>
                  )}
                  {!u.isSuspended ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => suspendUser(u.id).then(load)}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unsuspendUser(u.id).then(load)}
                    >
                      Unsuspend
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleResetPassword(u)}>
                    Reset MK
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </Button>
        <span className="flex items-center text-sm">
          Trang {page} / {Math.max(1, Math.ceil(total / 30))}
        </span>
        <Button variant="outline" disabled={page * 30 >= total} onClick={() => setPage((p) => p + 1)}>
          Sau
        </Button>
      </div>
    </div>
  );
}
