import { cn } from '@/lib/utils';
import { uiBase } from './recipes';

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      role="region"
      aria-label="Bảng dữ liệu có thể cuộn ngang"
      tabIndex={0}
      className={cn('w-full overflow-x-auto focus-visible:ring-2 focus-visible:ring-ring/20', uiBase.panel)}
    >
      <table className={cn('w-full min-w-max caption-bottom border-collapse text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead className={cn('bg-muted text-foreground', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return <tfoot className={cn('border-t border-border bg-muted font-semibold', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('border-b border-border transition-colors hover:bg-brand-soft/30', className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 px-4 text-left align-middle font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 align-middle font-normal', className)} {...props} />;
}

export function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return <caption className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
}
