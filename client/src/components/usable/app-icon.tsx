import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Lucide icons live inside simple geometric tokens across the app. */
export const ICON_STROKE = 2;
export const ICON_MUTED = 'text-foreground';
export const ICON_ACTIVE = 'text-primary-foreground';

const FRAME_SIZE = {
  sm: 'size-7 rounded-xl',
  md: 'size-9 rounded-2xl',
  lg: 'size-11 rounded-2xl',
} as const;

const ICON_SIZE = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
} as const;

type AppIconProps = {
  icon: LucideIcon;
  size?: keyof typeof FRAME_SIZE;
  active?: boolean;
  className?: string;
};

export function AppIcon({ icon: Icon, size = 'md', active = false, className }: AppIconProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center border border-border shadow-premium transition-all duration-200',
        active ? 'bg-primary' : 'bg-surface-paper',
        FRAME_SIZE[size],
        className,
      )}
      aria-hidden
    >
      <Icon
        className={cn(ICON_SIZE[size], active ? ICON_ACTIVE : ICON_MUTED)}
        strokeWidth={ICON_STROKE}
      />
    </span>
  );
}
