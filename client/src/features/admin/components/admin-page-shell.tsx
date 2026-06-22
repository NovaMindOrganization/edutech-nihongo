import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppIcon } from '@/components/usable/app-icon';
import { Button } from '@/components/ui/button';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { cn } from '@/lib/utils';

type AdminPageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  tone?: 'brand' | 'quaternary' | 'secondary' | 'default';
  chips?: string[];
  footer?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminPageShell({
  eyebrow = 'Quản trị',
  title,
  description,
  icon,
  iconClassName = 'bg-brand-soft',
  tone = 'brand',
  chips,
  footer,
  headerExtra,
  children,
  className,
}: AdminPageShellProps) {
  return (
    <PageShell
      className={cn(pageContentClass, className)}
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={icon}
      iconClassName={iconClassName}
      tone={tone}
      chips={chips}
      footer={footer}
      headerExtra={headerExtra}
    >
      {children}
    </PageShell>
  );
}

export function AdminSection({
  title,
  description,
  icon,
  iconClassName = 'bg-secondary',
  action,
  children,
  className,
  tone = 'default',
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'warning' | 'brand';
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/70 bg-surface-paper/50 p-4 shadow-premium card-lift md:p-6',
        tone === 'warning' && 'border-amber-500/30 bg-amber-500/5',
        tone === 'brand' && 'border-brand/20 bg-brand-soft/10',
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <AppIcon icon={icon} size="md" className={iconClassName} /> : null}
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function AdminStatPill({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: string | number;
  accent?: 'default' | 'brand' | 'quaternary';
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3 text-center shadow-sm">
      <p
        className={cn(
          'font-mono text-2xl font-black tabular-nums',
          accent === 'brand' && 'text-brand',
          accent === 'quaternary' && 'text-quaternary-foreground',
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

export function AdminToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-background p-4 shadow-premium card-lift',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AdminListPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-surface-paper/50 shadow-premium card-lift',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminPagination({
  page,
  total,
  pageSize,
  onPrevious,
  onNext,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" disabled={page <= 1} onClick={onPrevious}>
        Trước
      </Button>
      <span className="text-sm font-bold text-muted-foreground">
        Trang {page} / {totalPages}
      </span>
      <Button variant="outline" disabled={page >= totalPages} onClick={onNext}>
        Sau
      </Button>
    </div>
  );
}

type StaffListPageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  tone?: 'brand' | 'quaternary' | 'secondary' | 'default';
  chips?: string[];
  footer?: ReactNode;
  total?: number;
  totalLabel?: string;
  secondaryStat?: { label: string; value: string | number };
  createAction?: ReactNode;
  headerExtra?: ReactNode;
  filters?: ReactNode;
  toolbarExtra?: ReactNode;
  pagination?: ReactNode;
  children: ReactNode;
};

/** Shell chuẩn cho trang quản lý nội dung (giảng viên) */
export function StaffListPageShell({
  eyebrow = 'Nội dung',
  title,
  description,
  icon,
  iconClassName = 'bg-quaternary',
  tone = 'quaternary',
  chips,
  footer,
  total,
  totalLabel = 'Tổng mục',
  secondaryStat,
  createAction,
  headerExtra,
  filters,
  toolbarExtra,
  pagination,
  children,
}: StaffListPageShellProps) {
  const defaultHeaderExtra =
    total !== undefined || createAction ? (
      <div className="flex flex-col gap-3">
        {(total !== undefined || secondaryStat) && (
          <div className="grid grid-cols-2 gap-2">
            {total !== undefined ? (
              <AdminStatPill label={totalLabel} value={total} accent="brand" />
            ) : null}
            {secondaryStat ? (
              <AdminStatPill label={secondaryStat.label} value={secondaryStat.value} />
            ) : null}
          </div>
        )}
        {createAction}
      </div>
    ) : undefined;

  return (
    <AdminPageShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={icon}
      iconClassName={iconClassName}
      tone={tone}
      chips={chips}
      footer={footer}
      headerExtra={headerExtra ?? defaultHeaderExtra}
    >
      <div className="space-y-5">
        {(filters || toolbarExtra) && (
          <AdminToolbar>
            {filters}
            {toolbarExtra}
          </AdminToolbar>
        )}
        {children}
        {pagination}
      </div>
    </AdminPageShell>
  );
}
