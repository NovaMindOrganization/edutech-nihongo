import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  Languages,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ScrollText,
  Settings,
  Users,
  CreditCard,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { logoutApi, useAuthStore } from "@/features/auth";
import { paths } from "@/router/paths";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const mainNav: NavItem[] = [
  {
    to: paths.admin.dashboard,
    label: "Tổng quan",
    icon: LayoutDashboard,
    end: true,
  },
  { to: paths.admin.kanji, label: "Kanji", icon: ScrollText },
  { to: paths.admin.radicals, label: "Bộ thủ", icon: ScrollText },
  { to: paths.admin.vocabulary, label: "Từ vựng", icon: Languages },
  { to: paths.admin.grammar, label: "Ngữ pháp", icon: BookOpen },
  { to: paths.admin.courses, label: "Khóa học", icon: GraduationCap },
  { to: paths.admin.pricing, label: "Gói & giá", icon: CreditCard },
  { to: paths.admin.conversations, label: "Hội thoại", icon: MessageSquare },
  { to: paths.admin.questions, label: "Câu hỏi", icon: HelpCircle },
  { to: paths.admin.studySets, label: "Study sets", icon: Languages },
  { to: paths.admin.users, label: "Người dùng", icon: Users },
  { to: paths.admin.config, label: "Cấu hình", icon: Settings },
];

function sidebarLinkClass(isActive: boolean) {
  return cn(
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-foreground/80 hover:bg-muted",
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

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

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex min-h-screen w-60 shrink-0 flex-col border-r border-border/70 bg-[var(--nc-sidebar)]">
        <div className="shrink-0 border-b border-border/50 p-5">
          <p className="font-display text-xs tracking-[0.2em] text-primary uppercase">
            NihongoCoach
          </p>
          <p className="mt-1 text-sm font-medium">Quản trị nội dung</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
          {mainNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => sidebarLinkClass(isActive)}
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto shrink-0 space-y-0.5 border-t border-border/50 p-3">
          <NavLink
            to={paths.learn.hub}
            className={({ isActive }) => sidebarLinkClass(isActive)}
          >
            <GraduationCap className="size-4 shrink-0" />
            <span>Chế độ học (test học viên)</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className={sidebarLinkClass(false)}
          >
            <LogOut className="size-4 shrink-0" />
            <span className="text-destructive">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 overflow-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
