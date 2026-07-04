import { useAuthStore } from '@/features/auth';
import { isAdminRole } from '@/features/auth/utils/role-permissions';

import { FeedbackAdminView } from './FeedbackAdminView';

export function FeedbackAdminRouteView() {
  const role = useAuthStore((s) => s.user?.role);
  const scope = role && isAdminRole(role) ? 'admin' : 'instructor';
  return <FeedbackAdminView scope={scope} />;
}
