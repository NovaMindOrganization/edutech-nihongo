import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type HubLinkCardProps = {
  to: string;
  icon: LucideIcon;
  accent: string;
  title: string;
  description: string;
  cta: string;
  className?: string;
  tag?: ReactNode;
};

/** Card hub link — đồng bộ Gợi ý tiếp theo trên Dashboard */
export function HubLinkCard({
  to,
  icon,
  accent,
  title,
  description,
  cta,
  className,
  tag,
}: HubLinkCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'sticker-lift relative block h-full overflow-hidden rounded-xl border border-border bg-surface-paper p-5 shadow-premium card-lift',
        className,
      )}
    >
      {tag ? <div className="relative z-10 mb-3 flex flex-wrap gap-2">{tag}</div> : null}
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 size-20 rounded-full border border-border',
          accent,
        )}
      />
      <AppIcon icon={icon} size="lg" className={accent} />
      <h3 className="mt-5 font-display text-xl font-extrabold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 font-display text-sm font-extrabold text-primary">
        {cta}
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

export function HubLinkCardTag({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: 'enrolled' | 'available' | 'default';
}) {
  return (
    <Badge
      className={cn(
        'border-0 font-display text-[11px] font-extrabold uppercase tracking-wide',
        variant === 'enrolled' && 'bg-quaternary text-quaternary-foreground',
        variant === 'available' && 'bg-muted text-muted-foreground',
        variant === 'default' && 'bg-surface-paper',
      )}
    >
      {label}
    </Badge>
  );
}