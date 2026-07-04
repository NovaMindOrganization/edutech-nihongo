import { Navigate, useParams } from 'react-router-dom';

import { paths } from '@/router/paths';
import { isNotebookPool } from './notebook-types';

/** Redirect `/notebook/:pool` → `/notebook/:pool/kanji` */
export function NotebookPoolRedirectView() {
  const { pool } = useParams<{ pool: string }>();
  if (!pool || !isNotebookPool(pool)) {
    return <Navigate to={paths.student.notebook} replace />;
  }
  if (pool === 'collected') {
    return <Navigate to={paths.student.notebookCollectedList} replace />;
  }
  return <Navigate to={paths.student.notebookSection(pool, 'kanji')} replace />;
}
