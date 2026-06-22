import { Navigate } from 'react-router-dom';

import { paths } from '@/router/paths';

/** @deprecated Use `/notebook/learned/:type` — kept for backward-compatible imports. */
export function ReviewHubView() {
  return <Navigate to={paths.student.notebook} replace />;
}
