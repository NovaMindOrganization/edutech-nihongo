import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { uiBase } from './recipes';

const badgeVariants = cva(
  cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', uiBase.interactive),
  {
    variants: {
      variant: {
        default: 'bg-brand-soft text-brand border border-brand-muted/60',
        secondary: 'bg-secondary text-secondary-foreground border border-pink/30',
        outline: 'bg-background text-foreground border border-border',
        success: 'bg-quaternary text-quaternary-foreground border border-green/30',
        warning: 'bg-tertiary text-tertiary-foreground border border-yellow/40',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
