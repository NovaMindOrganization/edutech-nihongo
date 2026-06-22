import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { PopIn } from '@/components/motion';
import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AuthCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  accent?: 'soft' | 'brand' | 'success' | 'warning' | 'pink' | 'yellow';
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

const accentClass = {
  soft: 'bg-brand-soft',
  brand: 'bg-brand-muted',
  success: 'bg-quaternary',
  warning: 'bg-tertiary',
  pink: 'bg-secondary',
  yellow: 'bg-tertiary',
} as const;

export function AuthCard({
  eyebrow = 'NihongoCoach',
  title,
  description,
  accent = 'soft',
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <PopIn
      className={cn(
        'premium-card premium-card-interactive relative w-full max-w-md p-7 md:p-8',
        className,
      )}
    >
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Badge variant="default">{eyebrow}</Badge>
            <h1 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {title}
            </h1>
          </div>
          <AppIcon icon={Sparkles} size="lg" className={accentClass[accent]} />
        </div>
        <p className="text-sm font-normal leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-7">{children}</div>
        {footer && (
          <div className="mt-6 text-center text-sm font-normal text-muted-foreground">{footer}</div>
        )}
      </div>
    </PopIn>
  );
}

type AuthFieldProps = {
  label: string;
  action?: ReactNode;
  hint?: string;
  children: ReactNode;
};

export function AuthField({ label, action, hint, children }: AuthFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="font-sans text-sm font-medium tracking-tight">{label}</label>
        {action}
      </div>
      {children}
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
