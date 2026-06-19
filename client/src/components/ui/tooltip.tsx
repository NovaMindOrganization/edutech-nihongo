import { cloneElement, isValidElement, useId } from 'react';

import { cn } from '@/lib/utils';
import { uiBase } from './recipes';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: 'top' | 'bottom';
};

export function Tooltip({
  content,
  children,
  className,
  contentClassName,
  side = 'top',
}: TooltipProps) {
  const tooltipId = useId();
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' '),
      })
    : children;

  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-64 -translate-x-1/2 px-3 py-2 text-xs font-bold opacity-0 transition-all duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          side === 'top'
            ? 'bottom-full mb-2 translate-y-1 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:translate-y-0'
            : 'top-full mt-2 -translate-y-1 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:translate-y-0',
          uiBase.popover,
          'rounded-2xl shadow-premium',
          contentClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
}
