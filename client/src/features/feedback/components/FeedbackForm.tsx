import {
  BookOpen,
  Bug,
  CreditCard,
  Lightbulb,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uiBase } from '@/components/ui/recipes';
import { cn } from '@/lib/utils';

import {
  FEEDBACK_CATEGORY_LABELS,
  STUDENT_FEEDBACK_CATEGORIES,
  type FeedbackCategory,
} from '../constants';
import { createFeedback, type CreateFeedbackBody } from '../services/feedbackApi';

const CATEGORY_ICONS: Record<FeedbackCategory, LucideIcon> = {
  lesson_content: BookOpen,
  system_bug: Bug,
  payment_account: CreditCard,
  feature_request: Lightbulb,
  other: MessageCircle,
};

type FeedbackFormProps = {
  initialCategory?: FeedbackCategory;
  initialCourseId?: string;
  initialLessonId?: string;
  initialPageUrl?: string;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
};

export function FeedbackForm({
  initialCategory = 'other',
  initialCourseId,
  initialLessonId,
  initialPageUrl,
  onSuccess,
  onCancel,
}: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const categoryLocked = Boolean(initialLessonId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 5) {
      toast.error('Tiêu đề cần ít nhất 5 ký tự');
      return;
    }
    if (description.trim().length < 20) {
      toast.error('Mô tả cần ít nhất 20 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const body: CreateFeedbackBody = {
        category,
        title: title.trim(),
        description: description.trim(),
        ...(initialCourseId ? { courseId: initialCourseId } : {}),
        ...(initialLessonId ? { lessonId: initialLessonId } : {}),
        ...(initialPageUrl ? { pageUrl: initialPageUrl } : {}),
      };
      const created = await createFeedback(body);
      toast.success('Đã gửi góp ý');
      onSuccess?.(created.id);
      setTitle('');
      setDescription('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gửi thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2.5">
        <label className={uiBase.label}>Loại góp ý</label>
        {categoryLocked ? (
          <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand-soft/40 px-3 py-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
              <BookOpen className="size-4" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand">
                {FEEDBACK_CATEGORY_LABELS.lesson_content}
              </p>
              <p className="text-xs text-muted-foreground">
                Góp ý được liên kết với bài học hiện tại.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STUDENT_FEEDBACK_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              const selected = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-150',
                    selected
                      ? 'border-brand bg-brand-soft/60 font-semibold text-brand shadow-sm'
                      : 'border-border/70 bg-white font-medium text-foreground/80 hover:border-brand/30 hover:bg-muted/40',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      selected
                        ? 'bg-brand text-white shadow-sm'
                        : 'bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="leading-snug">{FEEDBACK_CATEGORY_LABELS[c]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="feedback-title" className={uiBase.label}>
          Tiêu đề
        </label>
        <Input
          id="feedback-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tóm tắt vấn đề hoặc góp ý"
          maxLength={200}
          className={cn(uiBase.control, uiBase.controlFocus, uiBase.placeholder)}
        />
        <p className="text-right text-[11px] text-muted-foreground">{title.length}/200</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="feedback-description" className={uiBase.label}>
          Mô tả chi tiết
        </label>
        <textarea
          id="feedback-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả cụ thể để chúng tôi hỗ trợ bạn tốt hơn…"
          rows={5}
          maxLength={5000}
          className={cn(
            uiBase.control,
            uiBase.controlFocus,
            uiBase.placeholder,
            'min-h-[120px] resize-y py-2.5',
          )}
        />
        <p className="text-right text-[11px] text-muted-foreground">
          {description.length}/5000 · tối thiểu 20 ký tự
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting} className="min-w-[120px]">
          {submitting ? 'Đang gửi…' : 'Gửi góp ý'}
        </Button>
      </div>
    </form>
  );
}
