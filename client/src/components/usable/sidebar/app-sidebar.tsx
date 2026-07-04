import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { MotionCollapse } from '@/components/motion';
import { layoutShellHeaderClass } from '@/components/usable/layout-shell';
import { cn } from '@/lib/utils';

const SIDEBAR_WIDTH = 'w-[260px]';

export const sidebarShellClass = SIDEBAR_WIDTH;

/** Root column: header + scroll nav + footer */
export function SidebarShell({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-h-0 flex-col bg-surface-sidebar">{children}</div>;
}

type SidebarBrandHeaderProps = {
  title?: string;
  subtitle: string;
  badge?: string;
  to: string;
  onNavigate?: () => void;
};

export function SidebarBrandHeader({
  title = 'NihongoCoach',
  subtitle,
  badge,
  to,
  onNavigate,
}: SidebarBrandHeaderProps) {
  return (
    <div
      className={layoutShellHeaderClass(
        'relative overflow-hidden bg-gradient-to-b from-white via-white to-brand-soft/25 px-4',
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-brand-soft/40 blur-2xl"
        aria-hidden
      />
      <Link
        to={to}
        onClick={onNavigate}
        className="relative flex h-full min-w-0 flex-1 items-center gap-3 rounded-xl transition-opacity hover:opacity-90"
      >
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
          <img src="/brand-mark.png" alt="" className="size-8 object-cover" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="flex items-center gap-2">
            <span className="truncate font-display text-sm font-semibold text-foreground">
              {title}
            </span>
            {badge && (
              <span className="shrink-0 rounded-md bg-brand-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-brand">
                {badge}
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{subtitle}</span>
        </span>
      </Link>
    </div>
  );
}

export function SidebarScrollNav({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        'sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3',
        className,
      )}
    >
      {children}
    </nav>
  );
}

export function SidebarSection({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'space-y-2.5 border-t-2 border-border/80 px-0.5 pt-5 first:border-t-0 first:pt-2',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-1">
        <span className="h-4 w-1 shrink-0 rounded-full bg-brand" aria-hidden />
        <h3 className="shrink-0 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
          {label}
        </h3>
        <span className="h-px min-w-0 flex-1 bg-border" aria-hidden />
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function SidebarIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150',
        active
          ? 'bg-brand text-white shadow-sm'
          : 'bg-muted/40 text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground',
      )}
      aria-hidden
    >
      <Icon className="size-4" strokeWidth={2} />
    </span>
  );
}

const navLinkBase =
  'group relative flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all duration-150';

function navLinkState(active: boolean, nested = false) {
  return cn(
    navLinkBase,
    nested && 'min-h-9 pl-2',
    active
      ? 'bg-brand-soft/70 font-semibold text-brand'
      : 'font-medium text-foreground/80 hover:bg-muted/50 hover:text-foreground',
  );
}

function ActiveIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span
      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand"
      aria-hidden
    />
  );
}

type SidebarNavItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  nested?: boolean;
  onNavigate?: () => void;
  isPathActive?: (pathname: string) => boolean;
};

export function SidebarNavItem({
  to,
  icon,
  label,
  end,
  nested,
  onNavigate,
  isPathActive,
}: SidebarNavItemProps) {
  const { pathname } = useLocation();

  const renderContent = (active: boolean) => (
    <span className={navLinkState(active, nested)}>
      <ActiveIndicator active={active} />
      <SidebarIcon icon={icon} active={active} />
      <span className="truncate">{label}</span>
    </span>
  );

  if (isPathActive) {
    const active = isPathActive(pathname);
    return (
      <Link
        to={to}
        onClick={onNavigate}
        className="block"
        aria-current={active ? 'page' : undefined}
      >
        {renderContent(active)}
      </Link>
    );
  }

  return (
    <NavLink to={to} end={end} onClick={onNavigate} className="block">
      {({ isActive }) => renderContent(isActive)}
    </NavLink>
  );
}

type SidebarNavGroupProps = {
  label: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: ReactNode;
};

export function SidebarNavGroup({
  label,
  icon: Icon,
  defaultOpen = false,
  forceOpen = false,
  children,
}: SidebarNavGroupProps) {
  const [open, setOpen] = useState(defaultOpen || forceOpen);

  useEffect(() => {
    if (!forceOpen) return;
    setOpen(true);
  }, [forceOpen]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          navLinkBase,
          'border border-transparent font-semibold text-foreground/85 hover:border-border/60 hover:bg-muted/45 hover:text-foreground',
          open && 'border-border/70 bg-muted/35 text-foreground shadow-sm',
          forceOpen && 'border-brand/20 bg-brand-soft/35 text-brand',
        )}
      >
        {Icon && (
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              forceOpen || open
                ? 'bg-brand text-white shadow-sm'
                : 'bg-muted/50 text-muted-foreground',
            )}
            aria-hidden
          >
            <Icon className="size-4" strokeWidth={2} />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-left text-[13px]">{label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180 text-foreground',
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>

      <MotionCollapse open={open}>
        <div className="ml-2 space-y-0.5 border-l-2 border-brand/30 py-1.5 pl-3">{children}</div>
      </MotionCollapse>
    </div>
  );
}

export function SidebarFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 space-y-3 border-t-2 border-border bg-gradient-to-t from-brand-soft/20 via-white/50 to-transparent p-3">
      {children}
    </div>
  );
}

export function SidebarFooterDivider() {
  return <div className="h-px w-full bg-border" role="separator" aria-hidden />;
}

type SidebarUserCardProps = {
  name: string;
  email: string;
  onClick?: () => void;
};

export function SidebarUserCard({ name, email, onClick }: SidebarUserCardProps) {
  const initial = name.charAt(0).toUpperCase();

  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-sm font-bold text-white shadow-sm">
        {initial}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">{email}</span>
      </span>
    </>
  );

  const className =
    'flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-white/80 px-2.5 py-2 shadow-sm transition-all hover:border-brand-soft hover:bg-white hover:shadow-md';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

type TopbarUserBadgeProps = {
  name: string;
  email: string;
};

/** Read-only learner identity for layout topbars */
export function TopbarUserBadge({ name, email }: TopbarUserBadgeProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-paper/90 px-2 py-1.5 shadow-sm"
      aria-label={`${name}, ${email}`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-hover text-xs font-bold text-white shadow-sm">
        {initial}
      </span>
      <span className="hidden min-w-0 sm:block">
        <span className="block max-w-[140px] truncate text-xs font-semibold text-foreground md:max-w-[200px]">
          {name}
        </span>
        <span className="block max-w-[140px] truncate text-[10px] text-muted-foreground md:max-w-[200px]">
          {email}
        </span>
      </span>
    </div>
  );
}

type SidebarActionProps = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  to?: string;
  onNavigate?: () => void;
  tone?: 'default' | 'danger';
};

export function SidebarAction({
  icon: Icon,
  label,
  onClick,
  to,
  onNavigate,
  tone = 'default',
}: SidebarActionProps) {
  const className = cn(
    navLinkBase,
    'font-medium',
    tone === 'danger'
      ? 'text-destructive/90 hover:bg-destructive/5 hover:text-destructive'
      : 'text-foreground/75 hover:bg-muted/50 hover:text-foreground',
  );

  const inner = (
    <>
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          tone === 'danger' ? 'bg-destructive/10' : 'bg-muted/40',
        )}
        aria-hidden
      >
        <Icon
          className={cn('size-4', tone === 'danger' ? 'text-destructive' : 'text-muted-foreground')}
          strokeWidth={2}
        />
      </span>
      <span>{label}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} onClick={onNavigate} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
