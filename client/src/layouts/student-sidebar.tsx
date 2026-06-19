import {
  BookOpen,
  Brain,
  ClipboardCheck,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  NotebookPen,
  ScanText,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageTransition } from '@/components/motion';
import { LayoutTopbar } from '@/components/usable/layout-topbar';
import {
  sidebarShellClass,
  SidebarAction,
  SidebarBrandHeader,
  SidebarFooter,
  SidebarFooterDivider,
  SidebarNavGroup,
  SidebarNavItem,
  SidebarScrollNav,
  SidebarSection,
  SidebarShell,
  SidebarUserCard,
} from '@/components/usable/sidebar';
import { StudentProfileDialog } from '@/components/usable/student-profile-dialog';
import { studentNavTree } from '@/components/usable/student-nav-menu';
import { studentNavPathMatches } from '@/components/usable/student-nav-paths';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { logoutApi, useAuthStore } from '@/features/auth';
import { isStaffRole } from '@/features/auth/utils/auth-routes';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const NAV_ICONS: Record<string, LucideIcon> = {
  [paths.student.dashboard]: LayoutDashboard,
  [paths.learn.hub]: BookOpen,
  [paths.student.notebook]: NotebookPen,
  [paths.learn.kanaQuiz]: BookOpen,
  [paths.student.aiSpeaking]: Mic,
  [paths.placementTest]: ClipboardCheck,
  [paths.student.jlptSim]: ClipboardCheck,
  [paths.student.jlptHistory]: History,
  [paths.student.mistakes]: History,
  [paths.student.ocr]: ScanText,
  [paths.student.studySets]: Users,
  [paths.student.communityCall]: Mic,
};

const GROUP_ICONS: Record<string, LucideIcon> = {
  Học: BookOpen,
  'Luyện đề': ClipboardCheck,
  'Theo dõi': History,
  'Cộng đồng': Users,
};

function groupHasActiveChild(pathname: string, children: { to: string }[]) {
  return children.some((child) => studentNavPathMatches(pathname, child.to));
}

function activeNavLabel(pathname: string) {
  for (const entry of studentNavTree) {
    if ('children' in entry) {
      const activeChild = entry.children.find((child) =>
        studentNavPathMatches(pathname, child.to),
      );
      if (activeChild) return activeChild.label;
    } else if (studentNavPathMatches(pathname, entry.to)) {
      return entry.label;
    }
  }
  return 'Không gian học tập';
}

function navMatch(to: string) {
  return (pathname: string) => studentNavPathMatches(pathname, to);
}

function StudentSidebarPanel({
  onNavigate,
  onOpenProfile,
  onLogout,
}: {
  onNavigate?: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}) {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const staff = user ? isStaffRole(user.role) : false;
  const displayName = user?.displayName?.trim() || user?.email.split('@')[0] || 'Học viên';

  const primaryItems = studentNavTree.filter(
    (entry) => !('children' in entry) && entry.to === paths.student.dashboard,
  );
  const learningItems = studentNavTree.filter(
    (entry) =>
      ('children' in entry && ['Học', 'Luyện đề'].includes(entry.label)) ||
      (!('children' in entry) &&
        (entry.to === paths.student.aiSpeaking || entry.to === paths.student.ocr)),
  );
  const communityItems = studentNavTree.filter(
    (entry) =>
      ('children' in entry && ['Theo dõi', 'Cộng đồng'].includes(entry.label)),
  );

  return (
    <SidebarShell>
      <SidebarBrandHeader
        subtitle="Không gian học tập của bạn"
        badge="Học viên"
        to={paths.student.dashboard}
        onNavigate={onNavigate}
      />

      <SidebarScrollNav>
        <SidebarSection label="Tổng quan">
          {primaryItems.map((entry) => {
            if ('children' in entry) return null;
            return (
              <SidebarNavItem
                key={entry.to}
                to={entry.to}
                icon={NAV_ICONS[entry.to] ?? LayoutDashboard}
                label={entry.label}
                onNavigate={onNavigate}
                isPathActive={navMatch(entry.to)}
              />
            );
          })}
        </SidebarSection>

        <SidebarSection label="Học & luyện tập">
          {learningItems.map((entry) => {
            if ('children' in entry) {
              return (
                <SidebarNavGroup
                  key={entry.label}
                  label={entry.label}
                  icon={GROUP_ICONS[entry.label]}
                  forceOpen={groupHasActiveChild(pathname, entry.children)}
                >
                  {entry.children.map((child) => (
                    <SidebarNavItem
                      key={child.to}
                      to={child.to}
                      icon={NAV_ICONS[child.to] ?? BookOpen}
                      label={child.label}
                      nested
                      onNavigate={onNavigate}
                      isPathActive={navMatch(child.to)}
                    />
                  ))}
                </SidebarNavGroup>
              );
            }

            return (
              <SidebarNavItem
                key={entry.to}
                to={entry.to}
                icon={NAV_ICONS[entry.to] ?? Brain}
                label={entry.label}
                onNavigate={onNavigate}
                isPathActive={navMatch(entry.to)}
              />
            );
          })}
        </SidebarSection>

        <SidebarSection label="Cộng đồng & tiến độ">
          {communityItems.map((entry) => {
            if (!('children' in entry)) return null;
            return (
              <SidebarNavGroup
                key={entry.label}
                label={entry.label}
                icon={GROUP_ICONS[entry.label]}
                forceOpen={groupHasActiveChild(pathname, entry.children)}
              >
                {entry.children.map((child) => (
                  <SidebarNavItem
                    key={child.to}
                    to={child.to}
                    icon={NAV_ICONS[child.to] ?? Users}
                    label={child.label}
                    nested
                    onNavigate={onNavigate}
                    isPathActive={navMatch(child.to)}
                  />
                ))}
              </SidebarNavGroup>
            );
          })}
        </SidebarSection>
      </SidebarScrollNav>

      {user && (
        <SidebarFooter>
          <SidebarUserCard
            name={displayName}
            email={user.email}
            onClick={onOpenProfile}
          />
          <SidebarFooterDivider />
          <div className="space-y-0.5">
            <SidebarAction
              icon={Settings}
              label="Cài đặt tài khoản"
              onClick={onOpenProfile}
            />
            {staff && (
              <SidebarAction
                icon={Shield}
                label="Chuyển sang quản trị"
                to={paths.admin.dashboard}
                onNavigate={onNavigate}
              />
            )}
            <SidebarAction icon={LogOut} label="Đăng xuất" onClick={onLogout} tone="danger" />
          </div>
        </SidebarFooter>
      )}
    </SidebarShell>
  );
}

export function StudentSidebarShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const currentLabel = useMemo(() => activeNavLabel(pathname), [pathname]);

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

  const asideClass = cn(
    'sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r-2 border-border/80 md:flex',
    sidebarShellClass,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className={asideClass}>
        <StudentSidebarPanel
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={handleLogout}
        />
      </aside>

      <Drawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title="Menu học viên"
        side="left"
        className={cn(sidebarShellClass, 'bg-surface-sidebar p-0 md:hidden')}
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <StudentSidebarPanel
          onNavigate={() => setMobileOpen(false)}
          onOpenProfile={() => {
            setMobileOpen(false);
            setProfileOpen(true);
          }}
          onLogout={handleLogout}
        />
      </Drawer>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <LayoutTopbar
          title={currentLabel}
          eyebrow="Học viên"
          leading={
            <Button
              type="button"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu className="size-5" strokeWidth={2} />
            </Button>
          }
          actions={
            <Link
              to={paths.student.dashboard}
              className="hidden items-center gap-2 rounded-xl border border-border/60 bg-white px-3 py-2 font-display text-xs font-semibold text-foreground shadow-sm transition-all hover:border-brand-soft hover:shadow-md sm:inline-flex"
            >
              <span className="flex size-6 items-center justify-center rounded-lg bg-brand text-[10px] font-bold text-white">
                日
              </span>
              NihongoCoach
            </Link>
          }
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <StudentProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onLogout={handleLogout}
      />
    </div>
  );
}
