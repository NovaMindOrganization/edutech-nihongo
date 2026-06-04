import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Bỏ header khi view tự quản lý (vd. quiz nhiều phase) */
  hideHeader?: boolean;
};

export function PageShell({
  eyebrow,
  title,
  description,
  headerExtra,
  children,
  className,
  hideHeader = false,
}: PageShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {!hideHeader && (
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-2 border-b border-border/60 pb-6"
        >
          {eyebrow && (
            <p className="font-display text-sm tracking-widest text-primary uppercase">
              {eyebrow}
            </p>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 max-w-3xl text-base text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {headerExtra && <div className="shrink-0">{headerExtra}</div>}
          </div>
        </motion.header>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}

/** Lưới nội dung học — card hub, danh sách khóa, v.v. */
export function PageGrid({
  children,
  className,
  cols = 'default',
}: {
  children: ReactNode;
  className?: string;
  cols?: 'default' | 'dense' | 'wide';
}) {
  return (
    <div
      className={cn(
        'grid w-full gap-4',
        cols === 'dense' && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        cols === 'wide' && 'lg:grid-cols-2 xl:grid-cols-3',
        cols === 'default' && 'md:grid-cols-2 xl:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
