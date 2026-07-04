import { NOTEBOOK_TYPES, type NotebookType } from './notebook-types';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isNotebookUuid(value: string) {
  return UUID_RE.test(value);
}

export function isNotebookTypeParam(value: string): value is NotebookType {
  return NOTEBOOK_TYPES.includes(value as NotebookType);
}
