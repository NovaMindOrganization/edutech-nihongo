import { Navigate, useParams } from 'react-router-dom';

import { paths } from '@/router/paths';
import { isNotebookTypeParam, isNotebookUuid } from './personal-notebook-utils';

export function PersonalNotebookRedirectView() {
  const { notebookId } = useParams<{ notebookId: string }>();

  if (!notebookId) {
    return <Navigate to={paths.student.notebookCollectedList} replace />;
  }

  if (isNotebookTypeParam(notebookId)) {
    return <Navigate to={paths.student.notebookCollectedList} replace />;
  }

  if (!isNotebookUuid(notebookId)) {
    return <Navigate to={paths.student.notebookCollectedList} replace />;
  }

  return <Navigate to={paths.student.notebookPersonal(notebookId, 'kanji')} replace />;
}
