import type { ReactNode } from 'react';

import { LearningIllustration, type StateTone } from '@/components/usable/states/learning-illustration';
import { cn } from '@/lib/utils';

export type EmptyStateTone = StateTone;

export type EmptyStateProps = {
  title: string;
  description?: string;
  tone?: EmptyStateTone;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Inset inside cards/tables — less padding, no outer border */
  embedded?: boolean;
  className?: string;
};

export function EmptyState({
  title,
  description,
  tone = 'default',
  action,
  size = 'md',
  embedded = false,
  className,
}: EmptyStateProps) {
  const illustrationSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const padding = embedded
    ? 'px-4 py-8'
    : size === 'sm'
      ? 'px-5 py-10'
      : size === 'lg'
        ? 'px-8 py-14'
        : 'px-6 py-12';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative overflow-hidden text-center',
        !embedded && 'rounded-3xl border border-dashed border-border bg-surface-paper shadow-premium',
        padding,
        className,
      )}
    >
      {!embedded && (
        <>
          <div className="pointer-events-none absolute -left-6 -top-6 size-16 rounded-full border border-border bg-tertiary/40" />
          <div className="pointer-events-none absolute -bottom-4 -right-4 size-10 rotate-12 rounded-xl border border-border bg-secondary/50" />
        </>
      )}

      <LearningIllustration tone={tone} size={illustrationSize} className="relative mb-5" />

      <h2
        className={cn(
          'relative font-display font-extrabold tracking-tight text-foreground',
          size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="relative mx-auto mt-2 max-w-md text-sm font-medium leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? <div className="relative mt-5 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export const emptyStatePresets = {
  dashboard: {
    tone: 'default' as const,
    title: 'Chưa có dữ liệu học tập',
    description: 'Hoàn thành bài học đầu tiên để dashboard bắt đầu hiển thị tiến độ và nhịp học của bạn.',
  },
  dashboardCourses: {
    tone: 'courses' as const,
    title: 'Chưa ghi danh khóa nào',
    description: 'Khám phá lộ trình JLPT và chọn khóa phù hợp để bắt đầu hành trình Nihongo của bạn.',
  },
  courses: {
    tone: 'courses' as const,
    title: 'Chưa có khóa học',
    description: 'Các khóa JLPT sẽ xuất hiện ở đây khi đã được đăng tải. Hãy quay lại sau nhé!',
  },
  vocabulary: {
    tone: 'vocabulary' as const,
    title: 'Chưa có từ vựng',
    description: 'Bài học này chưa có từ vựng. Bạn có thể quay lại sau hoặc chuyển sang phần khác.',
  },
  kanji: {
    tone: 'kanji' as const,
    title: 'Chưa có kanji',
    description: 'Bài học này chưa có kanji để luyện. Thử xem ngữ pháp hoặc từ vựng trước nhé!',
  },
  grammar: {
    tone: 'grammar' as const,
    title: 'Chưa có ngữ pháp',
    description: 'Bài học này chưa có mẫu ngữ pháp. Hãy tiếp tục với phần học khác trong tiết.',
  },
  flashcards: {
    tone: 'flashcards' as const,
    title: 'Không có thẻ để ôn',
    description: 'Đổi bộ lọc hoặc xem tất cả từ vựng để bắt đầu phiên flashcard.',
  },
  flashcardsComplete: {
    tone: 'flashcards' as const,
    title: 'Xong rồi!',
    description: 'Bạn đã ôn hết thẻ trong bộ lọc hiện tại. Giỏi lắm — nghỉ một chút hoặc học lại nhé!',
  },
  community: {
    tone: 'community' as const,
    title: 'Chưa có study set nào',
    description: 'Hãy là người đầu tiên chia sẻ bộ học, hoặc thử đổi bộ lọc tìm kiếm.',
  },
  communityMine: {
    tone: 'community' as const,
    title: 'Bạn chưa có study set',
    description: 'Tạo bộ học đầu tiên và chia sẻ với cộng đồng sau khi kiểm duyệt.',
  },
  admin: {
    tone: 'admin' as const,
    title: 'Không có kết quả',
    description: 'Thử đổi bộ lọc hoặc thêm mục mới để bắt đầu.',
  },
  adminCourses: {
    tone: 'courses' as const,
    title: 'Không có khóa học phù hợp',
    description: 'Đổi bộ lọc JLPT/trạng thái hoặc tạo khóa học mới.',
  },
  adminSearch: {
    tone: 'search' as const,
    title: 'Không tìm thấy',
    description: 'Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách.',
  },
} as const;
