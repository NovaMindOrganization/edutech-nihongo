import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/** Khung tab trong header — đồng bộ LessonShellView */
export const pageNavShellClass =
  'flex flex-wrap gap-2 rounded-xl border border-border bg-background p-2 shadow-premium card-lift';

export function pageNavTabClass(isActive: boolean) {
  return cn(
    'rounded-2xl border px-3 py-2 text-sm font-bold transition-all',
    isActive
      ? 'border-border bg-brand-soft text-brand shadow-premium card-lift'
      : 'border-border bg-surface-paper text-foreground hover:-translate-y-0.5 hover:bg-brand-soft hover:shadow-premium card-lift',
  );
}

export function PageNav({ className, ...props }: ComponentProps<'nav'>) {
  return <nav className={cn('mt-6', pageNavShellClass, className)} {...props} />;
}
