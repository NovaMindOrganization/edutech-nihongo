import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { uiBase } from './recipes';

export function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <span className="relative block w-full">
      <select
        className={cn(
          'flex appearance-none pr-10',
          uiBase.control,
          uiBase.controlFocus,
          uiBase.interactive,
          'disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground"
        strokeWidth={2}
        aria-hidden
      />
    </span>
  );
}
