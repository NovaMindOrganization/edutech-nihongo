import { MessageSquare, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Dialog } from '@/components/ui/dialog';
import { paths } from '@/router/paths';

import type { FeedbackCategory } from '../constants';
import { FeedbackForm } from './FeedbackForm';

export type FeedbackQuickDialogInitial = {
  initialCategory?: FeedbackCategory;
  initialCourseId?: string;
  initialLessonId?: string;
  initialPageUrl?: string;
};

type FeedbackQuickDialogProps = FeedbackQuickDialogInitial & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackQuickDialog({
  open,
  onOpenChange,
  initialCategory,
  initialCourseId,
  initialLessonId,
  initialPageUrl,
}: FeedbackQuickDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Góp ý"
      className="max-w-lg sm:max-w-xl"
    >
      <div className="relative mb-6 overflow-hidden rounded-xl border border-brand/15 bg-gradient-to-br from-brand-soft/60 via-white to-white p-4">
        <div
          className="pointer-events-none absolute -right-4 -top-6 size-24 rounded-full bg-brand/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/20">
            <MessageSquare className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              Chúng tôi luôn lắng nghe bạn
              <Sparkles className="size-3.5 text-brand" strokeWidth={2} aria-hidden />
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Góp ý giúp cải thiện bài học và trải nghiệm. Theo dõi phản hồi tại{' '}
              <span className="font-medium text-foreground">Góp ý của tôi</span>.
            </p>
          </div>
        </div>
      </div>

      <FeedbackForm
          initialCategory={initialCategory}
          initialCourseId={initialCourseId}
          initialLessonId={initialLessonId}
          initialPageUrl={
            initialPageUrl ?? (typeof window !== 'undefined' ? window.location.href : undefined)
          }
          onSuccess={(id) => {
            onOpenChange(false);
            navigate(paths.student.feedbackDetail(id));
          }}
          onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
