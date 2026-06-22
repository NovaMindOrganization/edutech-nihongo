import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';

import { formatCountdown } from './jlpt-sim-utils';

type JlptExamTimerProps = {
  remainingMs: number;
  durationMinutes: number;
  answeredCount: number;
  totalQuestions: number;
  className?: string;
  size?: 'default' | 'compact';
};

export function JlptExamTimer({
  remainingMs,
  durationMinutes,
  answeredCount,
  totalQuestions,
  className,
  size = 'default',
}: JlptExamTimerProps) {
  const urgent = remainingMs > 0 && remainingMs < 5 * 60 * 1000;
  const critical = remainingMs > 0 && remainingMs < 60 * 1000;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-lg border px-4 py-2',
          critical
            ? 'border-destructive/50 bg-destructive/10 text-destructive'
            : urgent
              ? 'border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100'
              : 'border-border bg-muted/40 text-foreground',
        )}
        role="timer"
        aria-live="polite"
        aria-label={`Thời gian còn lại ${formatCountdown(remainingMs)}`}
      >
        <Clock className={cn('shrink-0', size === 'compact' ? 'size-4' : 'size-5')} aria-hidden />
        <span
          className={cn(
            'font-mono font-bold tabular-nums tracking-wide',
            size === 'compact' ? 'text-lg' : 'text-2xl',
            critical && 'animate-pulse',
          )}
        >
          {formatCountdown(remainingMs)}
        </span>
      </div>

      <div className={cn('text-right', size === 'compact' ? 'text-xs' : 'text-sm')}>
        <p className="text-muted-foreground">Thời lượng {durationMinutes} phút</p>
        <p className="mt-0.5 font-mono tabular-nums text-foreground">
          <span className="font-semibold">{answeredCount}</span>
          <span className="text-muted-foreground"> / </span>
          {totalQuestions}
          <span className="ml-1 text-muted-foreground">đã trả lời</span>
        </p>
      </div>
    </div>
  );
}
