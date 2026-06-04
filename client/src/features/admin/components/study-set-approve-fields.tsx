import { Input } from '@/components/ui/input';
import {
  QUIZ_QUESTION_COUNT_MAX,
  QUIZ_QUESTION_COUNT_MIN,
  suggestQuizQuestionCount,
} from '@/features/student/types/study-set.types';

export function StudySetApproveFields({
  itemCount,
  quizQuestionCount,
  onQuizQuestionCountChange,
}: {
  itemCount: number;
  quizQuestionCount: number;
  onQuizQuestionCountChange: (n: number) => void;
}) {
  const suggested = suggestQuizQuestionCount(itemCount);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Số câu quiz (LLM sinh khi duyệt)</label>
      <Input
        type="number"
        min={QUIZ_QUESTION_COUNT_MIN}
        max={QUIZ_QUESTION_COUNT_MAX}
        value={quizQuestionCount}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onQuizQuestionCountChange(n);
        }}
      />
      <p className="text-xs text-muted-foreground">
        Gợi ý: {suggested} câu (tối thiểu {QUIZ_QUESTION_COUNT_MIN}, tối đa{' '}
        {QUIZ_QUESTION_COUNT_MAX}) · {itemCount} mục nội dung
      </p>
    </div>
  );
}
