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
  /** Landing page: scroll to in-page sections instead of route links. */
  marketing?: boolean;
  nav?: ReactNode;
};

const marketingSectionLinks = [
  { label: 'Chức năng', href: '#features' },
  { label: 'Lộ trình', href: '#roadmap' },
  { label: 'Đánh giá', href: '#testimonials' },
  { label: 'Bảng giá', href: '#pricing' },
] as const;

const marketingNavLinkClass =
  'rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-soft hover:text-foreground';

const marketingNavLinkMobileClass =
  'inline-flex min-h-10 items-center whitespace-nowrap rounded-lg border border-border bg-surface-paper px-3 text-xs font-medium text-muted-foreground shadow-sm';

export function AppHeader({ showNav = false, marketing = false, nav }: AppHeaderProps) {
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
    <header className="sticky top-0 z-40 border-b border-border bg-white/80 glass-overlay">
      <div className="flex w-full flex-col gap-3 px-4 py-3 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="relative flex items-center justify-between gap-2 sm:gap-4">
          <Link
            to={user ? defaultAppPath(user) : paths.home}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-lg border border-border bg-surface-paper px-3 py-2 font-display text-sm font-semibold tracking-tight text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-premium-hover"
          >
            <img src="/brand-mark.png" alt="" className="size-7 rounded-md object-cover" />
            <span className="hidden sm:inline">NihongoCoach</span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
            {marketing ? (
              <>
                {marketingSectionLinks.map(({ label, href }) => (
                  <a key={href} href={href} className={marketingNavLinkClass}>
                    {label}
                  </a>
                ))}
                <Link to={paths.dictionary} className={marketingNavLinkClass}>
                  Từ điển
                </Link>
              </>
            ) : (
              <>
                <Link to={paths.learn.hub} className={marketingNavLinkClass}>
                  Học
                </Link>
                <Link to={paths.dictionary} className={marketingNavLinkClass}>
                  Từ điển
                </Link>
                <Link
                  to={paths.pricing}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Bảng giá
                </Link>
              </>
            )}
          </nav>

          {user ? (
            <div className="flex min-w-0 items-center gap-2">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-semibold">
                  {user.displayName?.trim() || user.email}
                </p>
                {user.displayName?.trim() && (
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
              {staff && (
                <Badge variant="secondary" className="hidden text-xs sm:inline-flex">
                  {user.role}
                </Badge>
              )}
              <Link to={defaultAppPath(user)}>
                <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <nav className="flex min-w-0 shrink-0 gap-2">
              <Link to={paths.login}>
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to={paths.register}>
                <Button size="sm" variant="brand">
                  Đăng ký
                </Button>
              </Link>
            </nav>
          )}
        </div>
        {!showNav && (
          <nav className="flex max-w-full gap-2 overflow-x-auto pb-1 md:hidden">
            {marketing ? (
              <>
                {marketingSectionLinks.map(({ label, href }) => (
                  <a key={href} href={href} className={marketingNavLinkMobileClass}>
                    {label}
                  </a>
                ))}
                <Link to={paths.dictionary} className={marketingNavLinkMobileClass}>
                  Từ điển
                </Link>
              </>
            ) : (
              <>
                <Link to={paths.learn.hub} className={marketingNavLinkMobileClass}>
                  Học
                </Link>
                <Link to={paths.dictionary} className={marketingNavLinkMobileClass}>
                  Từ điển
                </Link>
                <Link to={paths.pricing} className={marketingNavLinkMobileClass}>
                  Bảng giá
                </Link>
              </>
            )}
          </nav>
        )}
        {showNav && nav && (
          <div className="flex flex-wrap items-center gap-2">
            {nav}
            {staff && (
              <Link
                to={paths.admin.dashboard}
                className="ml-auto text-sm font-medium text-brand hover:underline"
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
