import { RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { LearningIllustration, type StateTone } from '@/components/usable/states/learning-illustration';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
  title?: string;
  description?: string;
  tone?: StateTone;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  embedded?: boolean;
};

export function ErrorState({
  title = 'Không tải được dữ liệu',
  description = 'Đã xảy ra lỗi tạm thời. Hãy thử lại sau giây lát.',
  tone = 'error',
  onRetry,
  retryLabel = 'Thử lại',
  action,
  size = 'md',
  className,
  embedded = false,
}: ErrorStateProps) {
  const illustrationSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const padding = embedded
    ? 'px-4 py-8'
    : size === 'sm'
      ? 'px-5 py-8'
      : size === 'lg'
        ? 'px-8 py-12'
        : 'px-6 py-10';

  return (
    <div
      role="alert"
      className={cn(
        'relative overflow-hidden text-center',
        embedded
          ? 'bg-transparent'
          : 'rounded-3xl border border-dashed border-destructive/40 bg-destructive/5 shadow-premium',
        padding,
        className,
      )}
    >
      {!embedded && (
        <div className="pointer-events-none absolute -right-4 -top-4 size-10 rotate-12 rounded-xl border border-border bg-destructive/20" />
      )}

      <LearningIllustration tone={tone} size={illustrationSize} className="relative mb-4" />

      <h2
        className={cn(
          'relative font-display font-extrabold tracking-tight text-foreground',
          size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="relative mx-auto mt-2 max-w-md text-sm font-medium leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {(onRetry || action) && (
        <div className="relative mt-4 flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1.5 size-4" aria-hidden />
              {retryLabel}
            </Button>
          ) : null}
          {action}
        </div>
      )}
    </div>
  );
}
