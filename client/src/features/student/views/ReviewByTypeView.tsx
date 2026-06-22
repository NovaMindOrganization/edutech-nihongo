import { Navigate } from 'react-router-dom';

import { paths } from '@/router/paths';

type ReviewType = 'kanji' | 'vocabulary' | 'grammar';

/** @deprecated Use `/notebook/learned/:type` — kept for backward-compatible imports. */
export function ReviewByTypeView({ type }: { type: ReviewType }) {
  return <Navigate to={paths.student.notebookLearned(type)} replace />;
}
