import { Navigate } from 'react-router-dom';

import { paths } from '@/router/paths';

/** @deprecated Use `/notebook/collected/kanji` — kept for backward-compatible imports. */
export function KanjiHandbookView() {
  return <Navigate to={paths.student.notebookCollected('kanji')} replace />;
}
