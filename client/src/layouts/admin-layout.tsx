import {
  BarChart3,
  BookOpen,
  CreditCard,
  Flag,
  GraduationCap,
  ClipboardList,
  HelpCircle,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AnimatedOutlet } from "@/components/motion";
import { LayoutTopbar } from "@/components/usable/layout-topbar";
import {
  sidebarShellClass,
  SidebarAction,
  SidebarBrandHeader,
  SidebarFooter,
  SidebarFooterDivider,
  SidebarNavItem,
  SidebarScrollNav,
  SidebarSection,
  SidebarShell,
  SidebarUserCard,
} from "@/components/usable/sidebar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { RequireStaffRole } from "@/features/auth/components/require-staff-role";
import { logoutApi, useAuthStore } from "@/features/auth";
import { isAdminRole } from "@/features/auth/utils/role-permissions";
import { paths } from "@/router/paths";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  roles: Array<"admin" | "instructor">;
};

type NavSection = {
  label: string;
  roles?: Array<"admin" | "instructor">;
  items: NavItem[];
};

const staffNavSections: NavSection[] = [
  {
    label: "Tổng quan",
    items: [
      {
        to: paths.admin.dashboard,
        label: "Bảng điều khiển",
        icon: LayoutDashboard,
        end: true,
        roles: ["admin", "instructor"],
      },
    ],
  },
  {
    label: "Nội dung học",
    roles: ["instructor"],
    items: [
      { to: paths.admin.kanji, label: "Kanji", icon: ScrollText, roles: ["instructor"] },
      { to: paths.admin.radicals, label: "Bộ thủ", icon: ScrollText, roles: ["instructor"] },
      { to: paths.admin.vocabulary, label: "Từ vựng", icon: Languages, roles: ["instructor"] },
      { to: paths.admin.grammar, label: "Ngữ pháp", icon: BookOpen, roles: ["instructor"] },
      { to: paths.admin.courses, label: "Khóa học", icon: GraduationCap, roles: ["instructor"] },
      { to: paths.admin.conversations, label: "Hội thoại", icon: MessageSquare, roles: ["instructor"] },
    ],
  },
  {
    label: "Đề & câu hỏi",
    roles: ["instructor"],
    items: [
      { to: paths.admin.mockExams, label: "Đề thi JLPT", icon: ClipboardList, roles: ["instructor"] },
      { to: paths.admin.questions, label: "Ngân hàng câu hỏi", icon: HelpCircle, roles: ["instructor"] },
      { to: paths.admin.studySets, label: "Study sets", icon: Languages, roles: ["instructor"] },
    ],
  },
  {
    label: "Vận hành",
    roles: ["admin"],
    items: [
      { to: paths.admin.users, label: "Người dùng", icon: Users, roles: ["admin"] },
      { to: paths.admin.pricing, label: "Gói & giá", icon: CreditCard, roles: ["admin"] },
      { to: paths.admin.reports, label: "Báo cáo", icon: Flag, roles: ["admin"] },
      { to: paths.admin.analytics, label: "Thống kê", icon: BarChart3, roles: ["admin"] },
      { to: paths.admin.config, label: "Cấu hình", icon: Settings, roles: ["admin"] },
    ],
  },
];

function flattenNav(sections: NavSection[], role: "admin" | "instructor") {
  return sections.flatMap((section) => {
    if (section.roles && !section.roles.includes(role)) return [];
    return section.items.filter((item) => item.roles.includes(role));
  });
}

function activeStaffLabel(pathname: string, nav: NavItem[]) {
  const active = nav
    .filter((item) => pathname === item.to || (!item.end && pathname.startsWith(`${item.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return active?.label ?? "Quản trị";
}

function AdminSidebarPanel({
  role,
  displayName,
  email,
  onLogout,
  onNavigate,
}: {
  role: "admin" | "instructor";
  displayName: string;
  email: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const badge = role === "admin" ? "Admin" : "Giảng viên";
  const subtitle = role === "admin" ? "Quản trị hệ thống" : "Quản trị nội dung";

  return (
    <SidebarShell>
      <SidebarBrandHeader
        subtitle={subtitle}
        badge={badge}
        to={paths.admin.dashboard}
        onNavigate={onNavigate}
      />

      <SidebarScrollNav>
        {staffNavSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role));
          if (section.roles && !section.roles.includes(role)) return null;
          if (visibleItems.length === 0) return null;

          return (
            <SidebarSection key={section.label} label={section.label}>
              {visibleItems.map((item) => (
                <SidebarNavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  end={item.end}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarSection>
          );
        })}
      </SidebarScrollNav>

      <SidebarFooter>
        <SidebarUserCard name={displayName} email={email} />
        <SidebarFooterDivider />
        <div className="space-y-0.5">
          <SidebarAction
            icon={GraduationCap}
            label="Chuyển sang học viên"
            to={paths.learn.hub}
            onNavigate={onNavigate}
          />
          <SidebarAction
            icon={LogOut}
            label="Đăng xuất"
            onClick={onLogout}
            tone="danger"
          />
        </div>
      </SidebarFooter>
    </SidebarShell>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role as "admin" | "instructor" | undefined;

  const visibleNav = useMemo(
    () => (role ? flattenNav(staffNavSections, role) : []),
    [role],
  );

  const displayName = useMemo(() => {
    if (!user) return "Staff";
    return user.displayName?.trim() || user.email.split("@")[0];
  }, [user]);

  const currentLabel = useMemo(
    () => activeStaffLabel(pathname, visibleNav),
    [pathname, visibleNav],
  );

  useEffect(() => {
    if (!user) {
      navigate(paths.login, { replace: true });
      return;
    }
    if (user.role !== "admin" && user.role !== "instructor") {
      navigate(paths.student.dashboard, { replace: true });
    }
  }, [user, navigate]);

  if (!user || (user.role !== "admin" && user.role !== "instructor")) {
    return null;
  }

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      /* ignore */
    }
    logout();
    navigate(paths.home);
  }

  const asideClass = cn(
    "sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r-2 border-border/80 md:flex",
    sidebarShellClass,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className={asideClass}>
        <AdminSidebarPanel
          role={user.role as "admin" | "instructor"}
          displayName={displayName}
          email={user.email}
          onLogout={handleLogout}
        />
      </aside>

      <Drawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title="Menu quản trị"
        side="left"
        className={cn(sidebarShellClass, "bg-surface-sidebar p-0 md:hidden")}
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AdminSidebarPanel
          role={user.role as "admin" | "instructor"}
          displayName={displayName}
          email={user.email}
          onLogout={handleLogout}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <LayoutTopbar
          title={currentLabel}
          eyebrow={isAdminRole(user.role) ? "Admin" : "Giảng viên"}
          leading={
            <Button
              type="button"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu quản trị"
            >
              <Menu className="size-5" />
            </Button>
          }
        />
        <main className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 md:p-8 lg:p-10">
          <RequireStaffRole>
            <AnimatedOutlet />
          </RequireStaffRole>
        </main>
      </div>
    </div>
  );
}
