import {
  BookOpen,
  CreditCard,
  Languages,
  GraduationCap,
  Users,
  Settings,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth';
import { isAdminRole } from '@/features/auth/utils/role-permissions';
import { paths } from '@/router/paths';

const instructorLinks = [
  { to: paths.admin.vocabulary, title: 'Từ vựng', desc: 'Quản lý từ vựng theo bài & JLPT', icon: Languages },
  { to: paths.admin.grammar, title: 'Ngữ pháp', desc: 'Mẫu cấu trúc, ví dụ, quiz', icon: BookOpen },
  { to: paths.admin.courses, title: 'Khóa học', desc: 'Bài học, gán nội dung, MiniTest', icon: GraduationCap },
  { to: paths.admin.kanji, title: 'Kanji & bộ thủ', desc: 'Kanji, hình nhớ, radicals', icon: BookOpen },
];

const adminLinks = [
  { to: paths.admin.users, title: 'Người dùng', desc: 'Tài khoản, role, khóa/mở', icon: Users },
  { to: paths.admin.analytics, title: 'Thống kê', desc: 'DAU, doanh thu, tiến độ khóa', icon: LayoutDashboard },
  { to: paths.admin.pricing, title: 'Gói & giá', desc: 'Gói học, SePAY, mở khóa tự động', icon: CreditCard },
  { to: paths.admin.config, title: 'Cấu hình', desc: 'LLM, bảo trì, tích hợp thanh toán', icon: Settings },
  { to: paths.admin.reports, title: 'Báo cáo', desc: 'Xử lý báo cáo vi phạm cộng đồng', icon: MessageSquare },
];

export function AdminDashboardView() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user ? isAdminRole(user.role) : false;
  const links = isAdmin ? adminLinks : instructorLinks;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Bảng điều khiển</h1>
      <p className="mt-1 text-muted-foreground">
        {isAdmin
          ? 'Quản lý tài khoản, cấu hình hệ thống và gói học phí'
          : 'Quản lý nội dung học tập NihongoCoach'}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ to, title, desc, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <Icon className="size-8 text-primary" />
                <CardTitle className="mt-2">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
