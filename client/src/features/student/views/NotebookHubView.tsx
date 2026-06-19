import { Navigate } from 'react-router-dom';

import { paths } from '@/router/paths';

/** @deprecated Use `NotebookHubView` from `@/features/student/notebook` */
export function NotebookHubView() {
  return <Navigate to={paths.student.notebook} replace />;
}
