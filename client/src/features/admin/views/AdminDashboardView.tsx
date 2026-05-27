import { BookOpen, Languages, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

const links = [
  { to: paths.admin.vocabulary, title: 'Từ vựng', desc: '860+ mục N5 đã import', icon: Languages },
  { to: paths.admin.grammar, title: 'Ngữ pháp', desc: '159 mẫu cấu trúc N5', icon: BookOpen },
  { to: paths.admin.courses, title: 'Khóa học', desc: '25 bài + sequential unlock', icon: GraduationCap },
];

export function AdminDashboardView() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Bảng điều khiển</h1>
      <p className="mt-1 text-muted-foreground">Quản lý master data và nội dung học tập NihongoCoach</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
