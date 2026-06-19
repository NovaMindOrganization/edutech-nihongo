import { motion } from 'framer-motion';

import { loadingDotVariants, loadingPulseVariants, loadingSpinnerTransition } from '@/lib/motion';
import { useSafeVariants } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

type LoadingSpinnerProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

const spinnerSizes = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-11',
} as const;

/** Geometric spinner — rotating rounded square with hard shadow accent. */
export function LoadingSpinner({ className, size = 'md', label = 'Đang tải' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <motion.span
        aria-hidden
        className={cn(
          'rounded-xl border border-border bg-tertiary shadow-premium',
          spinnerSizes[size],
        )}
        animate={{ rotate: [0, 90, 180, 270, 360] }}
        transition={loadingSpinnerTransition}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

type LoadingDotsProps = {
  className?: string;
  label?: string;
};

/** Three bouncing dots — playful loading indicator. */
export function LoadingDots({ className, label = 'Đang tải' }: LoadingDotsProps) {
  const dotVariants = useSafeVariants(loadingDotVariants);

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          aria-hidden
          className="size-2.5 rounded-full border border-border bg-primary shadow-premium"
          variants={dotVariants}
          animate="animate"
          transition={{ delay: index * 0.12 }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

type MotionSkeletonProps = {
  className?: string;
  animated?: boolean;
};

/** Skeleton placeholder with geometric pulse animation. */
export function MotionSkeleton({ className, animated = true }: MotionSkeletonProps) {
  const pulseVariants = useSafeVariants(loadingPulseVariants);

  if (!animated) {
    return (
      <div
        aria-hidden
        className={cn(
          'rounded-lg border border-border/20 bg-muted shadow-premium',
          className,
        )}
      />
    );
  }

  return (
    <motion.div
      aria-hidden
      className={cn(
        'rounded-lg border border-border/20 bg-muted shadow-premium',
        className,
      )}
      variants={pulseVariants}
      initial="initial"
      animate="animate"
    />
  );
}

type LoadingOverlayProps = {
  label?: string;
  className?: string;
};

/** Full-area loading overlay for views and panels. */
export function LoadingOverlay({ label = 'Đang tải', className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex min-h-32 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/30 bg-surface-paper/80 p-8',
        className,
      )}
    >
      <LoadingSpinner size="lg" label={label} />
      <p className="font-display text-sm font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
