import { Badge } from '@/components/ui/badge';

import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUS_VARIANT,
  type FeedbackCategory,
  type FeedbackStatus,
} from '../constants';

export function FeedbackCategoryBadge({ category }: { category: FeedbackCategory }) {
  return <Badge variant="outline">{FEEDBACK_CATEGORY_LABELS[category]}</Badge>;
}

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <Badge variant={FEEDBACK_STATUS_VARIANT[status]}>
      {FEEDBACK_STATUS_LABELS[status]}
    </Badge>
  );
}
