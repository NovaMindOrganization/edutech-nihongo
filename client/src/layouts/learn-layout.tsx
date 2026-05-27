import { Link, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { StudentNavMenu } from '@/components/usable/student-nav-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logoutApi, useAuthStore } from '@/features/auth';
import { isStaffRole } from '@/features/auth/utils/auth-routes';
import { paths } from '@/router/paths';

export function LearnLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const staff = user ? isStaffRole(user.role) : false;

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      /* cookie clear best-effort */
    }
    logout();
    toast.message('Đã đăng xuất');
    navigate(paths.home);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--nc-cream)]/50 to-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              to={paths.home}
              className="font-display shrink-0 text-sm font-bold tracking-wide text-primary"
            >
              日本語 Coach
            </Link>
            {user ? (
              <div className="flex shrink-0 items-center gap-2">
                {staff && (
                  <Badge variant="secondary" className="hidden text-xs font-normal sm:inline-flex">
                    Admin · test học viên
                  </Badge>
                )}
                <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground md:inline">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Link to={paths.login} state={{ returnTo: window.location.pathname }}>
                <Button size="sm">Đăng nhập</Button>
              </Link>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StudentNavMenu />
            {staff && (
              <Link
                to={paths.admin.dashboard}
                className="ml-auto text-sm font-medium text-primary hover:underline"
              >
                ← Quản trị
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {staff && (
          <p className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-muted-foreground">
            Chế độ học viên — menu theo cấu trúc: Học (khóa/tiết/kanji), Ôn tập, Luyện nói AI, Luyện đề, OCR,
            Cộng đồng.
          </p>
        )}
        <Outlet />
      </div>
    </div>
  );
}
