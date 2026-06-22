import { cn } from '@/lib/utils';

/** Shared fixed height for sidebar brand header + main layout topbar */
export const layoutShellHeaderClass = (className?: string) =>
  cn(
    'layout-shell-header shrink-0 flex h-[var(--layout-header-h)] min-h-[var(--layout-header-h)] items-center border-b-2 border-border',
    className,
  );
