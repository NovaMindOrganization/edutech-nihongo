import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  FileText,
  History,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  NotebookPen,
  ScanText,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { StudentProfileDialog } from '@/components/usable/student-profile-dialog';
import { studentNavTree } from '@/components/usable/student-nav-menu';
import { logoutApi, useAuthStore } from '@/features/auth';
import { isStaffRole } from '@/features/auth/utils/auth-routes';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const NAV_ICONS: Record<string, LucideIcon> = {
  [paths.student.dashboard]: LayoutDashboard,
  [paths.learn.hub]: BookOpen,
  [paths.learn.kanjiHub]: Languages,
  [paths.student.notebook]: NotebookPen,
  [paths.learn.kanaQuiz]: BookOpen,
  [paths.student.reviewKanji]: Languages,
  [paths.student.reviewVocabulary]: NotebookPen,
  [paths.student.reviewGrammar]: FileText,
  [paths.student.aiSpeaking]: Mic,
  [paths.placementTest]: ClipboardCheck,
  [paths.student.jlptSim]: ClipboardCheck,
  [paths.student.jlptHistory]: History,
  [paths.student.mistakes]: History,
  [paths.student.ocr]: ScanText,
  [paths.student.studySets]: Users,
  [paths.student.communityCall]: Mic,
};

function pathMatches(pathname: string, to: string) {
  if (to === paths.learn.hub) {
    return (
      pathname === to ||
      pathname.startsWith('/learn/courses') ||
      pathname.startsWith('/learn/lessons')
    );
  }
  if (to === paths.learn.kanjiHub) {
    return pathname === to || pathname.startsWith('/learn/kanji/course');
  }
  if (
    to === paths.student.reviewKanji ||
    to === paths.student.reviewVocabulary ||
    to === paths.student.reviewGrammar
  ) {
    return pathname.startsWith('/review');
  }
  if (to === paths.placementTest || to === paths.student.jlptSim) {
    return pathname === paths.placementTest || pathname.startsWith('/practice');
  }
  if (to === paths.student.jlptHistory || to === paths.student.mistakes) {
    return pathname.startsWith('/insights');
  }
  if (to === paths.student.studySets || to === paths.student.communityCall) {
    return pathname.startsWith('/community');
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function sidebarLinkClass(active: boolean, nested = false) {
  return cn(
    'flex items-center gap-2.5 rounded-lg py-2 text-sm transition-colors',
    nested ? 'px-2.5' : 'px-3',
    active
      ? 'bg-primary/10 font-medium text-primary'
      : 'text-[#44403c] hover:bg-[#f5f5f4]',
  );
}

function groupHasActiveChild(pathname: string, children: { to: string }[]) {
  return children.some((child) => pathMatches(pathname, child.to));
}

function NavGroupSection({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: { label: string; to: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const groupActive = groupHasActiveChild(pathname, items);
  const [open, setOpen] = useState(groupActive);

  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive, pathname]);

  return (
    <div className="pt-1 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          groupActive
            ? 'bg-primary/10 text-primary'
            : open
              ? 'bg-[#f5f5f4] text-[#44403c]'
              : 'text-[#44403c] hover:bg-[#f5f5f4]',
        )}
      >
        <span className="truncate text-left">{label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform duration-200',
            groupActive ? 'text-primary' : 'text-[#78716c]',
            open && 'rotate-180',
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="mt-0.5 space-y-0.5 pl-3">
          {items.map((child) => {
            const Icon = NAV_ICONS[child.to] ?? BookOpen;
            const active = pathMatches(pathname, child.to);
            return (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onNavigate}
                className={sidebarLinkClass(active, true)}
              >
                <AppIcon icon={Icon} size="sm" active={active} />
                <span className="truncate">{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {studentNavTree.map((entry) => {
        if ('children' in entry) {
          return (
            <NavGroupSection
              key={entry.label}
              label={entry.label}
              items={entry.children}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          );
        }

        const Icon = NAV_ICONS[entry.to] ?? LayoutDashboard;
        const active = pathMatches(pathname, entry.to);
        return (
          <NavLink
            key={entry.to}
            to={entry.to}
            onClick={onNavigate}
            className={sidebarLinkClass(active)}
          >
            <AppIcon icon={Icon} size="sm" active={active} />
            <span>{entry.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  onOpenProfile,
  onLogout,
}: {
  onOpenProfile: () => void;
  onLogout: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const staff = user ? isStaffRole(user.role) : false;
  if (!user) return null;

  const displayName = user.displayName?.trim() || user.email.split('@')[0];

  return (
    <div className="shrink-0 space-y-0.5 border-t border-[#e7e5e4] bg-[#fafaf9] p-3">
      <button
        type="button"
        onClick={onOpenProfile}
        className={cn(sidebarLinkClass(false), 'w-full text-left')}
      >
        <AppIcon icon={Settings} size="sm" />
        <span>Cài đặt</span>
      </button>

      {staff && (
        <Link to={paths.admin.dashboard} className={sidebarLinkClass(false)}>
          <AppIcon icon={LayoutDashboard} size="sm" />
          <span>Quản trị</span>
        </Link>
      )}

      <button
        type="button"
        onClick={onOpenProfile}
        className="mt-1 flex w-full items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 text-left ring-1 ring-[#e7e5e4] transition-colors hover:bg-[#fafaf9]"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-[#44403c]">{displayName}</span>
          <span className="block truncate text-xs text-[#78716c]">{user.email}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={onLogout}
        className={cn(sidebarLinkClass(false), 'mt-1 w-full')}
      >
        <LogOut className="size-4 shrink-0 text-[#78716c]" strokeWidth={2} aria-hidden />
        <span className="text-[#78716c]">Đăng xuất</span>
      </button>
    </div>
  );
}

function SidebarPanel({
  onNavigate,
  onOpenProfile,
  onLogout,
}: {
  onNavigate?: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#e7e5e4] bg-white px-4 py-4">
        <Link
          to={paths.student.dashboard}
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            日
          </span>
          <span>
            <span className="block font-display text-sm font-bold leading-tight text-[#44403c]">
              日本語 Coach
            </span>
            <span className="block text-[11px] text-[#78716c]">Khu vực học viên</span>
          </span>
        </Link>
      </div>
      <SidebarNav onNavigate={onNavigate} />
      <SidebarFooter onOpenProfile={onOpenProfile} onLogout={onLogout} />
    </div>
  );
}

export function StudentSidebarShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
    <div className="flex min-h-screen bg-[#fafaf9]">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[#e7e5e4] bg-white md:flex xl:w-60">
        <SidebarPanel onOpenProfile={() => setProfileOpen(true)} onLogout={handleLogout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(100%,16rem)] flex-col bg-white shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-md p-1 hover:bg-[#f5f5f4]"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5 text-[#78716c]" strokeWidth={2} />
            </button>
            <SidebarPanel
              onNavigate={() => setMobileOpen(false)}
              onOpenProfile={() => {
                setMobileOpen(false);
                setProfileOpen(true);
              }}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-[#e7e5e4] bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            className="rounded-md border border-[#e7e5e4] p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="size-5 text-[#78716c]" strokeWidth={2} />
          </button>
          <Link to={paths.student.dashboard} className="font-display text-sm font-bold text-primary">
            日本語 Coach
          </Link>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</main>
      </div>

      <StudentProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onLogout={handleLogout}
      />
    </div>
  );
}
