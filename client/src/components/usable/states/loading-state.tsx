import { LoadingDots, LoadingSpinner } from '@/components/motion';
import { MotionSkeleton } from '@/components/motion/loading';
import {
  LearningIllustration,
  type StateTone,
} from '@/components/usable/states/learning-illustration';
import { cn } from '@/lib/utils';

type LoadingStateProps = {
  label?: string;
  variant?: 'inline' | 'panel' | 'page';
  tone?: StateTone;
  className?: string;
};

/** Consistent loading indicator — Playful Geometric. */
export function LoadingState({
  label = 'Đang tải',
  variant = 'panel',
  tone,
  className,
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn('inline-flex items-center gap-3 text-sm font-semibold text-muted-foreground', className)}
      >
        <LoadingSpinner size="sm" label={label} />
        <span>{label}</span>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={label}
        className={cn('w-full space-y-5', className)}
      >
        {tone ? (
          <div className="flex justify-center py-4">
            <LearningIllustration tone={tone} size="md" />
          </div>
        ) : null}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-paper px-5 py-4 shadow-premium">
          <LoadingSpinner size="md" label={label} />
          <p className="font-display text-sm font-extrabold text-muted-foreground">{label}</p>
        </div>
        <MotionSkeleton className="h-40 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MotionSkeleton className="h-36" />
          <MotionSkeleton className="h-36" />
          <MotionSkeleton className="h-36" />
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-dashed border-border bg-surface-paper px-6 py-12 text-center shadow-premium',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 size-14 rounded-full border border-border bg-tertiary/40" />
      {tone ? <LearningIllustration tone={tone} size="sm" /> : null}
      <LoadingSpinner size="lg" label={label} />
      <p className="font-display text-sm font-extrabold text-muted-foreground">{label}</p>
      <LoadingDots label={label} className="opacity-80" />
    </div>
  );
}
