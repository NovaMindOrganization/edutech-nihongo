import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Lucide-only icon tokens — outline, 2px stroke, SaaS-consistent. */
export const ICON_STROKE = 2;
export const ICON_MUTED = 'text-[#78716c]';
export const ICON_ACTIVE = 'text-primary';

const SIZE = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

type AppIconProps = {
  icon: LucideIcon;
  size?: keyof typeof SIZE;
  active?: boolean;
  className?: string;
};

export function AppIcon({ icon: Icon, size = 'md', active = false, className }: AppIconProps) {
  return (
    <Icon
      className={cn(SIZE[size], 'shrink-0', active ? ICON_ACTIVE : ICON_MUTED, className)}
      strokeWidth={ICON_STROKE}
      aria-hidden
    />
  );
}
