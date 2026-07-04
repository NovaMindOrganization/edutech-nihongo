export type NotebookPool = 'learned' | 'collected';
export type NotebookType = 'kanji' | 'vocabulary' | 'grammar';
export type NotebookReviewMode = 'random' | 'lesson' | 'pick' | 'unlearned' | 'learned';

export const NOTEBOOK_POOLS: NotebookPool[] = ['learned', 'collected'];
export const NOTEBOOK_TYPES: NotebookType[] = ['kanji', 'vocabulary', 'grammar'];

/** Display names (URL keys stay `learned` / `collected`). */
export const POOL_LABELS: Record<NotebookPool, string> = {
  learned: 'Lộ trình học',
  collected: 'Sưu tập riêng',
};

/** Một dòng phân biệt — không lặp kanji/từ/ngữ pháp (đã nói ở header trang). */
export const POOL_TAGLINES: Record<NotebookPool, string> = {
  learned: 'Từ các bài trong khóa bạn đang học',
  collected: 'Sổ tay cá nhân — nhiều sổ, ghi chú từng mục, thêm từ bài học',
};

export const TYPE_LABELS: Record<NotebookType, string> = {
  kanji: 'Kanji',
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
};

export function isNotebookPool(value: string): value is NotebookPool {
  return NOTEBOOK_POOLS.includes(value as NotebookPool);
}

export function isNotebookType(value: string): value is NotebookType {
  return NOTEBOOK_TYPES.includes(value as NotebookType);
}
