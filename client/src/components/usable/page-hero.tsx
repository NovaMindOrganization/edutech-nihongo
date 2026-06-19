import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { FadeUp } from '@/components/motion';
import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PageHeroTone =
  | 'default'
  | 'brand'
  | 'amber'
  | 'emerald'
  | 'secondary'
  | 'quaternary';

const toneSurface: Record<PageHeroTone, string> = {
  default: 'bg-gradient-to-br from-surface-paper via-surface-paper to-secondary/20',
  brand: 'bg-gradient-to-br from-brand-soft/35 via-surface-paper to-quaternary/15',
  amber: 'bg-gradient-to-br from-amber-50/90 via-surface-paper to-brand-soft/25',
  emerald: 'bg-gradient-to-br from-emerald-50/85 via-surface-paper to-quaternary/20',
  secondary: 'bg-gradient-to-br from-secondary/25 via-surface-paper to-tertiary/15',
  quaternary: 'bg-gradient-to-br from-quaternary/30 via-surface-paper to-secondary/15',
};

export type PageHeroProps = {
  badge?: string;
  /** Dòng phụ trên tiêu đề — vd. "Tiết 3 · N5" */
  subtitle?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  badgeClassName?: string;
  tone?: PageHeroTone;
  /** Nhãn nhỏ dưới mô tả */
  chips?: string[];
  aside?: ReactNode;
  nav?: ReactNode;
  /** Gợi ý / callout cuối header */
  footer?: ReactNode;
  backLink?: { to: string; label: string };
  className?: string;
  animate?: boolean;
};

function HeroIconAside({
  icon,
  iconClassName,
  badge,
  title,
}: {
  icon: LucideIcon;
  iconClassName: string;
  badge?: string;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/90 p-4 shadow-premium card-lift backdrop-blur-sm">
      <AppIcon icon={icon} size="lg" className={iconClassName} />
      {badge && (
        <p className="mt-3 font-display text-xs font-extrabold uppercase tracking-widest text-primary">
          {badge}
        </p>
      )}
      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

export function PageHero({
  badge,
  subtitle,
  title,
  description,
  icon,
  iconClassName = 'bg-quaternary',
  badgeClassName = 'bg-tertiary text-tertiary-foreground',
  tone = 'default',
  chips,
  aside,
  nav,
  footer,
  backLink,
  className,
  animate = true,
}: PageHeroProps) {
  const resolvedAside =
    aside ??
    (icon ? (
      <HeroIconAside icon={icon} iconClassName={iconClassName} badge={badge} title={title} />
    ) : null);

  const header = (
    <header
      className={cn(
        'relative overflow-hidden rounded-xl border border-border p-5 shadow-premium-hover md:p-7',
        toneSurface[tone],
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-border bg-secondary/40" />
      <div className="pointer-events-none absolute -left-6 top-1/2 hidden size-16 -translate-y-1/2 rounded-full border border-border bg-brand-soft/40 md:block" />
      <div className="pointer-events-none absolute bottom-10 right-24 hidden size-12 rotate-12 rounded-lg border border-border bg-tertiary/90 md:block" />
      <div className="pointer-events-none absolute bottom-6 right-8 size-8 rounded-full border border-border bg-quaternary/80" />

      {backLink && (
        <Link
          to={backLink.to}
          className="relative text-sm font-bold text-primary hover:underline"
        >
          ← {backLink.label}
        </Link>
      )}

      <motion.div
        initial={animate ? { opacity: 0, y: 8 } : false}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        className={cn('relative', backLink && 'mt-4')}
      >
        <div
          className={cn(
            'grid gap-6',
            resolvedAside ? 'lg:grid-cols-[1fr_auto] lg:items-start' : undefined,
          )}
        >
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              {icon && (
                <AppIcon
                  icon={icon}
                  size="lg"
                  className={cn(iconClassName, resolvedAside && 'shrink-0 lg:hidden')}
                />
              )}
              <div className="min-w-0 flex-1">
                {badge && <Badge className={badgeClassName}>{badge}</Badge>}
                {subtitle && (
                  <p className="mt-3 text-sm font-semibold text-muted-foreground">{subtitle}</p>
                )}
                <h1
                  className={cn(
                    'font-display font-extrabold tracking-tight text-foreground',
                    badge || subtitle ? 'mt-2 text-3xl md:text-4xl lg:text-5xl' : 'text-3xl md:text-5xl',
                  )}
                >
                  {title}
                </h1>
              </div>
            </div>

            {description && (
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-muted-foreground md:text-base">
                {description}
              </p>
            )}

            {chips && chips.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-bold text-foreground/80 shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>

          {resolvedAside && <div className="hidden shrink-0 lg:block">{resolvedAside}</div>}
        </div>

        {nav}

        {footer && (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-3 text-sm font-medium leading-6 text-muted-foreground">
            {footer}
          </div>
        )}
      </motion.div>
    </header>
  );

  if (!animate) return header;

  return <FadeUp className="mb-8">{header}</FadeUp>;
}
