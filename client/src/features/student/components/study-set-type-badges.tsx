import { cn } from '@/lib/utils';

import {
  STUDY_SET_CONTENT_COLORS,
  STUDY_SET_CONTENT_LABELS,
  type StudySetContentType,
  type StudySetTypeCounts,
} from '../types/study-set.types';

export function StudySetTypeBadges({
  typeCounts,
  className,
}: {
  typeCounts: Partial<StudySetTypeCounts>;
  className?: string;
}) {
  const entries = (Object.keys(typeCounts) as StudySetContentType[]).filter(
    (k) => (typeCounts[k] ?? 0) > 0,
  );

  if (!entries.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {entries.map((type) => (
        <span
          key={type}
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            STUDY_SET_CONTENT_COLORS[type],
          )}
        >
          {STUDY_SET_CONTENT_LABELS[type]} · {typeCounts[type]}
        </span>
      ))}
    </div>
  );
}
