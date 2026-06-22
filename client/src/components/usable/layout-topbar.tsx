import type { ReactNode } from 'react';

import { AppBreadcrumbs } from '@/components/usable/breadcrumbs';
import { layoutShellHeaderClass } from '@/components/usable/layout-shell';
import { cn } from '@/lib/utils';

type LayoutTopbarProps = {
  title?: string;
  eyebrow?: string;
  leading?: ReactNode;
  actions?: ReactNode;
  showBreadcrumbs?: boolean;
  className?: string;
};

export function LayoutTopbar({
  title,
  eyebrow,
  leading,
  actions,
  showBreadcrumbs = true,
  className,
}: LayoutTopbarProps) {
  return (
    <header
      className={layoutShellHeaderClass(
        cn('sticky top-0 z-30 bg-white/80 px-4 glass-overlay md:px-6 lg:px-8', className),
      )}
    >
      <div className="flex h-full w-full items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-3">
          {leading}
          <div className="flex min-h-0 min-w-0 flex-col justify-center gap-0.5">
            {showBreadcrumbs && (
              <AppBreadcrumbs className="leading-none [&_ol]:max-w-full [&_ol]:flex-nowrap [&_ol]:overflow-hidden" />
            )}
            {title && (
              <div className="flex min-w-0 items-center gap-2 leading-none">
                {eyebrow && (
                  <span className="hidden shrink-0 rounded-full border border-border bg-surface-paper px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-brand sm:inline-flex">
                    {eyebrow}
                  </span>
                )}
                <p className="truncate font-display text-sm font-semibold tracking-tight text-foreground">
                  {title}
                </p>
              </div>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
