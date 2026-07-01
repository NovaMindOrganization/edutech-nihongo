export type FeedbackCategory =
  | 'lesson_content'
  | 'system_bug'
  | 'payment_account'
  | 'feature_request'
  | 'other';

export type FeedbackStatus =
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'closed';

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  lesson_content: 'Nội dung bài học',
  system_bug: 'Lỗi hệ thống',
  payment_account: 'Thanh toán / tài khoản',
  feature_request: 'Đề xuất tính năng',
  other: 'Khác',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  resolved: 'Đã xử lý',
  rejected: 'Từ chối',
  closed: 'Đã đóng',
};

export const STUDENT_FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  'lesson_content',
  'system_bug',
  'payment_account',
  'feature_request',
  'other',
];

export const FEEDBACK_STATUS_VARIANT: Record<
  FeedbackStatus,
  'default' | 'secondary' | 'outline' | 'success' | 'warning'
> = {
  pending: 'outline',
  in_progress: 'default',
  resolved: 'success',
  rejected: 'warning',
  closed: 'secondary',
};

export function isFeedbackClosed(status: FeedbackStatus): boolean {
  return status === 'closed' || status === 'rejected' || status === 'resolved';
}

export function canStudentReply(status: FeedbackStatus): boolean {
  return status === 'pending' || status === 'in_progress';
}

export function canStaffReply(status: FeedbackStatus): boolean {
  return status !== 'closed' && status !== 'rejected';
}
