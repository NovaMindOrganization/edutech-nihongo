import type { ReactNode } from 'react';

import { EmptyState } from '@/components/usable/states/empty-state';
import { ErrorState } from '@/components/usable/states/error-state';
import { LoadingState } from '@/components/usable/states/loading-state';
import type { StateTone } from '@/components/usable/states/learning-illustration';

type ViewStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingLabel?: string;
  loadingVariant?: 'inline' | 'panel' | 'page';
  loadingSkeleton?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyTone?: StateTone;
  emptyAction?: ReactNode;
  emptyEmbedded?: boolean;
  emptySize?: 'sm' | 'md' | 'lg';
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
};

/** Standard loading → error → empty → content switcher for views. */
export function ViewState({
  loading,
  error,
  empty,
  loadingLabel = 'Đang tải',
  loadingVariant = 'panel',
  loadingSkeleton,
  emptyTitle = 'Chưa có nội dung',
  emptyDescription,
  emptyTone = 'default',
  emptyAction,
  emptyEmbedded = false,
  emptySize,
  errorTitle,
  errorDescription,
  onRetry,
  children,
  className,
}: ViewStateProps) {
  if (loading) {
    if (loadingSkeleton) {
      return <div className={className}>{loadingSkeleton}</div>;
    }
    return <LoadingState label={loadingLabel} variant={loadingVariant} className={className} />;
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription ?? error}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (empty) {
    return (
      <EmptyState
        tone={emptyTone}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        embedded={emptyEmbedded}
        size={emptySize ?? (emptyEmbedded ? 'sm' : 'md')}
        className={className}
      />
    );
  }

  return <>{children}</>;
}
