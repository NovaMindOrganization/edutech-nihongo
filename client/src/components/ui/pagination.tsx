import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      className={cn('flex w-full justify-center', className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-row flex-wrap items-center gap-2', className)} {...props} />;
}

export function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('inline-flex', className)} {...props} />;
}

type PaginationLinkProps = React.ComponentProps<'a'> & {
  isActive?: boolean;
};

export function PaginationLink({ className, isActive, children, ...props }: PaginationLinkProps) {
  const isDisabled = props['aria-disabled'] === true || props['aria-disabled'] === 'true';
  return (
    <a
      {...props}
      aria-current={isActive ? 'page' : undefined}
      aria-label={props['aria-label'] ?? (typeof children === 'string' ? `Trang ${children}` : undefined)}
      tabIndex={isDisabled ? -1 : props.tabIndex}
      className={cn(
        buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'icon-sm' }),
        'min-w-9 px-3',
        isDisabled && 'pointer-events-none opacity-55',
        className,
      )}
    >
      {children}
    </a>
  );
}

export function PaginationPrevious({ className, children = 'Trước', ...props }: React.ComponentProps<'a'>) {
  const isDisabled = props['aria-disabled'] === true || props['aria-disabled'] === 'true';
  return (
    <a
      {...props}
      aria-label={props['aria-label'] ?? 'Trang trước'}
      tabIndex={isDisabled ? -1 : props.tabIndex}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'gap-1',
        isDisabled && 'pointer-events-none opacity-55',
        className,
      )}
    >
      <ChevronLeft className="size-4" />
      <span>{children}</span>
    </a>
  );
}

export function PaginationNext({ className, children = 'Sau', ...props }: React.ComponentProps<'a'>) {
  const isDisabled = props['aria-disabled'] === true || props['aria-disabled'] === 'true';
  return (
    <a
      {...props}
      aria-label={props['aria-label'] ?? 'Trang sau'}
      tabIndex={isDisabled ? -1 : props.tabIndex}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'gap-1',
        isDisabled && 'pointer-events-none opacity-55',
        className,
      )}
    >
      <span>{children}</span>
      <ChevronRight className="size-4" />
    </a>
  );
}

export function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-9 items-center justify-center rounded-lg border border-border bg-muted shadow-premium',
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </span>
  );
}
