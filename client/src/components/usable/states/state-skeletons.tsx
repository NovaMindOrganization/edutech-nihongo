import { MotionSkeleton } from '@/components/motion/loading';
import { cn } from '@/lib/utils';

function SkeletonBlock({ className }: { className?: string }) {
  return <MotionSkeleton className={cn('rounded-xl border border-border/15', className)} />;
}

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8', className)} aria-busy="true" aria-label="Đang tải dashboard">
      <SkeletonBlock className="h-44 md:h-52" />
      <SkeletonBlock className="h-36" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonBlock className="h-56" />
        <SkeletonBlock className="h-56" />
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn('grid gap-5 md:grid-cols-2 xl:grid-cols-3', className)}
      aria-busy="true"
      aria-label="Đang tải khóa học"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-44" />
      ))}
    </div>
  );
}

export function VocabularyListSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)} aria-busy="true" aria-label="Đang tải từ vựng">
      <SkeletonBlock className="h-28" />
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-24" />
      ))}
    </div>
  );
}

export function KanjiGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Đang tải kanji">
      <SkeletonBlock className="h-40 bg-amber-50/50" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBlock key={i} className="h-36" />
        ))}
      </div>
    </div>
  );
}

export function GrammarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)} aria-busy="true" aria-label="Đang tải ngữ pháp">
      <SkeletonBlock className="h-16" />
      <SkeletonBlock className="h-64" />
      <div className="flex gap-3">
        <SkeletonBlock className="h-11 w-28" />
        <SkeletonBlock className="h-11 w-28" />
      </div>
    </div>
  );
}

export function FlashcardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-2xl space-y-6', className)} aria-busy="true" aria-label="Đang tải flashcard">
      <SkeletonBlock className="h-14" />
      <SkeletonBlock className="h-72" />
      <div className="flex justify-center gap-3">
        <SkeletonBlock className="size-11 rounded-2xl" />
        <SkeletonBlock className="h-11 w-32" />
        <SkeletonBlock className="size-11 rounded-2xl" />
      </div>
    </div>
  );
}

export function StudySetGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}
      aria-busy="true"
      aria-label="Đang tải study sets"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-48" />
      ))}
    </div>
  );
}

export function AdminListSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-label="Đang tải danh sách">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-24" />
      ))}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-busy="true" aria-label="Đang tải bảng">
      <SkeletonBlock className="mb-3 h-11" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} className="h-14 rounded-2xl" />
      ))}
    </div>
  );
}

export function LessonShellSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)} aria-busy="true" aria-label="Đang tải bài học">
      <SkeletonBlock className="h-20" />
      <SkeletonBlock className="h-96" />
    </div>
  );
}
