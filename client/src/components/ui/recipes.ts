export const uiBase = {
  interactive:
    'transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-55',
  lift:
    'depth-interactive hover:border-border-strong active:border-border',
  paper: 'border border-border bg-surface-paper text-foreground shadow-premium',
  panel:
    'rounded-xl border border-border bg-surface-paper text-foreground shadow-premium card-lift',
  popover:
    'rounded-xl border border-border bg-popover text-popover-foreground shadow-premium-hover',
  control:
    'h-10 w-full rounded-lg border border-input bg-surface-paper px-3 py-2 text-sm font-normal text-foreground shadow-sm transition-all duration-200 hover:border-border-strong focus:border-ring',
  controlFocus:
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:shadow-premium',
  placeholder: 'placeholder:text-muted-foreground',
  label: 'font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground',
  mutedText: 'text-sm font-normal text-muted-foreground',
} as const;

/** @deprecated Import from `@/lib/motion` — kept for dialog/drawer compatibility */
export { uiMotion } from '@/lib/motion';
