import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileWarning,
  GraduationCap,
  HelpCircle,
  Languages,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  ServerCog,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { AppIcon } from '@/components/usable/app-icon';
import { HubLinkCard, HubLinkCardTag } from '@/components/usable/hub-link-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { useAuthStore } from '@/features/auth';
import { isAdminRole } from '@/features/auth/utils/role-permissions';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

const instructorHubCards = [
  {
    to: paths.admin.courses,
    title: 'Khóa học',
    description: 'Tạo lộ trình JLPT, quản lý tiết học và gán nội dung.',
    icon: GraduationCap,
    accent: 'bg-quaternary/50',
    tag: 'Lộ trình',
  },
  {
    to: paths.admin.vocabulary,
    title: 'Từ vựng',
    description: 'Thêm và gán từ theo khóa, tiết và cấp JLPT.',
    icon: Languages,
    accent: 'bg-secondary/50',
    tag: 'Từ vựng',
  },
  {
    to: paths.admin.grammar,
    title: 'Ngữ pháp',
    description: 'Mẫu cấu trúc, ví dụ minh họa và quiz kiểm tra.',
    icon: BookOpen,
    accent: 'bg-brand-soft/60',
    tag: 'Ngữ pháp',
  },
  {
    to: paths.admin.kanji,
    title: 'Kanji',
    description: 'Quản lý chữ Hán, âm đọc, mẹo nhớ và ví dụ.',
    icon: ScrollText,
    accent: 'bg-tertiary/40',
    tag: 'Kanji',
  },
  {
    to: paths.admin.radicals,
    title: 'Bộ thủ',
    description: '214 bộ thủ Hán — số thứ tự, Hán Việt, nghĩa.',
    icon: ScrollText,
    accent: 'bg-muted',
    tag: 'Radicals',
  },
  {
    to: paths.admin.conversations,
    title: 'Hội thoại',
    description: 'Dialogue tiết học — gán vào lesson qua khóa học.',
    icon: MessageSquare,
    accent: 'bg-quaternary/30',
    tag: 'Speaking',
  },
  {
    to: paths.admin.mockExams,
    title: 'Đề thi JLPT',
    description: 'Tạo đề mock, import câu hỏi và cấu hình thời gian.',
    icon: ClipboardList,
    accent: 'bg-secondary/40',
    tag: 'JLPT',
  },
  {
    to: paths.admin.questions,
    title: 'Ngân hàng câu hỏi',
    description: 'MCQ dùng chung cho đề thi và bài kiểm tra.',
    icon: HelpCircle,
    accent: 'bg-brand-soft/50',
    tag: 'Quiz',
  },
  {
    to: paths.admin.studySets,
    title: 'Study sets',
    description: 'Kiểm duyệt bộ học cộng đồng do học viên tạo.',
    icon: Languages,
    accent: 'bg-tertiary/30',
    tag: 'Cộng đồng',
  },
];

const adminLinks = [
  { to: paths.admin.users, title: 'Người dùng', desc: 'Tài khoản, role, khóa/mở', icon: Users },
  { to: paths.admin.analytics, title: 'Thống kê', desc: 'DAU, doanh thu, tiến độ khóa', icon: LayoutDashboard },
  { to: paths.admin.pricing, title: 'Gói & giá', desc: 'Gói học, SePAY, mở khóa tự động', icon: CreditCard },
  { to: paths.admin.config, title: 'Cấu hình', desc: 'LLM, bảo trì, tích hợp thanh toán', icon: Settings },
  { to: paths.admin.reports, title: 'Báo cáo', desc: 'Xử lý báo cáo vi phạm cộng đồng', icon: MessageSquare },
];

const adminOperatingCards = [
  {
    key: 'users',
    title: 'Users',
    label: 'Identity & access',
    desc: 'Quản lý tài khoản, phân quyền, khóa/mở và trạng thái truy cập.',
    to: paths.admin.users,
    icon: Users,
    accent: 'bg-quaternary/10',
    iconBg: 'bg-quaternary',
    status: 'Access control',
    actions: [{ to: paths.admin.users, label: 'Manage users' }],
  },
  {
    key: 'revenue',
    title: 'Revenue',
    label: 'Payments & plans',
    desc: 'Theo dõi doanh thu, đơn hàng, gói học và cấu hình thanh toán.',
    to: paths.admin.analytics,
    icon: CircleDollarSign,
    accent: 'bg-tertiary/20',
    iconBg: 'bg-tertiary',
    status: 'Billing ops',
    actions: [
      { to: paths.admin.analytics, label: 'View analytics' },
      { to: paths.admin.pricing, label: 'Pricing plans' },
    ],
  },
  {
    key: 'reports',
    title: 'Reports',
    label: 'Trust & safety',
    desc: 'Triage báo cáo cộng đồng, xử lý vi phạm và bảo vệ môi trường học.',
    to: paths.admin.reports,
    icon: FileWarning,
    accent: 'bg-secondary/15',
    iconBg: 'bg-secondary',
    status: 'Moderation queue',
    actions: [{ to: paths.admin.reports, label: 'Review reports' }],
  },
  {
    key: 'system-health',
    title: 'System Health',
    label: 'Config & integrations',
    desc: 'Kiểm tra cấu hình LLM, SePAY, bảo trì và các tích hợp vận hành.',
    to: paths.admin.config,
    icon: ServerCog,
    accent: 'bg-primary/10',
    iconBg: 'bg-brand-soft',
    status: 'Operational config',
    actions: [{ to: paths.admin.config, label: 'Open config' }],
  },
];

function FeatureCard({
  card,
  enabled,
}: {
  card: (typeof adminOperatingCards)[number];
  enabled: boolean;
}) {
  const content = (
    <Card
      className={cn(
        'h-full overflow-hidden bg-surface-paper transition-all',
        enabled ? 'hover:-translate-y-0.5 hover:shadow-premium card-lift' : 'opacity-70',
      )}
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('rounded-xl border border-border p-2 shadow-premium card-lift', card.accent)}>
            <AppIcon icon={card.icon} size="md" className={card.iconBg} />
          </div>
          <Badge variant={enabled ? 'outline' : 'secondary'} className="bg-surface-paper text-muted-foreground">
            {enabled ? card.status : 'Admin only'}
          </Badge>
        </div>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {card.label}
        </p>
        <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight text-foreground">
          {card.title}
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{card.desc}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {card.actions.map((action) => (
            <span
              key={action.to}
              className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground shadow-premium card-lift"
            >
              {action.label}
            </span>
          ))}
        </div>
        <span
          className={cn(
            'mt-auto inline-flex items-center gap-1 pt-5 text-sm font-extrabold',
            enabled ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {enabled ? 'Open workspace' : 'Không thuộc quyền hiện tại'}
          <ArrowRight className="size-4" />
        </span>
      </CardContent>
    </Card>
  );

  if (!enabled) return content;
  return (
    <Link to={card.to} className="block h-full">
      {content}
    </Link>
  );
}

export function AdminDashboardView() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user ? isAdminRole(user.role) : false;

  if (!isAdmin) {
    return (
      <PageShell
        className={pageContentClass}
        eyebrow="Giảng viên"
        title="Không gian nội dung"
        description="Xây dựng khóa học, bổ sung từ vựng/ngữ pháp/kanji và chuẩn bị đề thi cho học viên."
        icon={GraduationCap}
        iconClassName="bg-quaternary"
        tone="quaternary"
        chips={['Khóa học', 'JLPT', 'Quiz', 'Kiểm duyệt']}
        footer="Gán nội dung vào tiết qua Khóa học → chi tiết tiết → panel tương ứng."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {instructorHubCards.map((card) => (
            <HubLinkCard
              key={card.to}
              to={card.to}
              icon={card.icon}
              accent={card.accent}
              title={card.title}
              description={card.description}
              cta="Mở trang"
              tag={<HubLinkCardTag label={card.tag} />}
            />
          ))}
        </div>

        <Card className="mt-6 bg-muted/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AppIcon icon={ShieldCheck} size="md" className="bg-brand-soft" />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Checklist hôm nay
                </p>
                <CardTitle className="text-lg">Quy trình gợi ý</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            {[
              'Kiểm tra khóa học draft trước khi publish.',
              'Rà từ vựng/ngữ pháp mới theo đúng JLPT level.',
              'Liên hệ admin nếu cần quyền users, revenue hoặc reports.',
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-surface-paper px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-sm"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Admin"
      title="Trung tâm vận hành"
      description="Tập trung người dùng, doanh thu, báo cáo cộng đồng và sức khỏe hệ thống từ một nơi."
      icon={LayoutDashboard}
      iconClassName="bg-brand-soft"
      tone="brand"
      chips={['Users', 'Revenue', 'Reports', 'Config']}
    >
      <div className="space-y-6">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                Executive overview
              </p>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                Users · Revenue · Reports · System Health
              </h2>
            </div>
            <Badge variant="outline" className="bg-surface-paper text-muted-foreground">
              Admin first
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {adminOperatingCards.map((card) => (
              <FeatureCard key={card.key} card={card} enabled />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <Card className="overflow-hidden bg-surface-paper">
            <CardHeader className="border-b border-border bg-muted">
              <div className="flex items-center gap-3">
                <AppIcon icon={ShieldCheck} size="md" className="bg-brand-soft text-brand" />
                <div>
                  <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    Quick actions
                  </p>
                  <CardTitle className="text-xl text-foreground">Công cụ thường dùng</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminLinks.map(({ to, title, desc, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <AppIcon icon={Icon} size="sm" className="bg-muted text-foreground" />
                    <div className="min-w-0">
                      <p className="font-display text-base font-extrabold leading-tight text-foreground">{title}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AppIcon icon={ShieldCheck} size="md" className="bg-tertiary" />
                <div>
                  <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    Admin rhythm
                  </p>
                  <CardTitle className="text-xl text-foreground">Checklist hôm nay</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                'Rà tài khoản bị khóa/tạm ngưng trước khi kết thúc ngày.',
                'Kiểm tra doanh thu, gói giá và cấu hình thanh toán.',
                'Triage report pending và kiểm tra cấu hình hệ thống trọng yếu.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-border bg-surface-paper px-3 py-2 font-medium text-muted-foreground shadow-premium card-lift"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
