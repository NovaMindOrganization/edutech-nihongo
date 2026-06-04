import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logoutApi, useAuthStore } from '@/features/auth';
import { defaultAppPath, isStaffRole } from '@/features/auth/utils/auth-routes';
import { paths } from '@/router/paths';

type AppHeaderProps = {
  /** Show full student nav (learn layout). Marketing home omits it. */
  showNav?: boolean;
  nav?: ReactNode;
};

export function AppHeader({ showNav = false, nav }: AppHeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const staff = user ? isStaffRole(user.role) : false;

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      /* best-effort */
    }
    logout();
    toast.message('Đã đăng xuất');
    navigate(paths.home);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="flex w-full flex-col gap-3 px-4 py-3 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={paths.home}
            className="font-display shrink-0 text-sm font-bold tracking-wide text-primary"
          >
            日本語 Coach
          </Link>

          {user ? (
            <div className="flex min-w-0 items-center gap-2">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-medium">
                  {user.displayName?.trim() || user.email}
                </p>
                {user.displayName?.trim() && (
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
              {staff && (
                <Badge variant="secondary" className="hidden text-xs font-normal sm:inline-flex">
                  {user.role}
                </Badge>
              )}
              <Link to={defaultAppPath(user)}>
                <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                  Vào học
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <nav className="flex shrink-0 gap-2">
              <Link to={paths.login}>
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to={paths.register}>
                <Button size="sm">Đăng ký</Button>
              </Link>
            </nav>
          )}
        </div>
        {showNav && nav && (
          <div className="flex flex-wrap items-center gap-2">
            {nav}
            {staff && (
              <Link
                to={paths.admin.dashboard}
                className="ml-auto text-sm font-medium text-primary hover:underline"
              >
                ← Quản trị
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
