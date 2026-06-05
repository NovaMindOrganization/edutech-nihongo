import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  getLessonVocabulary,
  patchVocabularyProgress,
  type LessonVocabularyItem,
} from '../services/vocabularyApi';

export function useVocabularyList(lessonId: string) {
  const [items, setItems] = useState<LessonVocabularyItem[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLessonVocabulary(lessonId, 'all');
      setItems(data.items);
      setLessonTitle(data.lesson.title);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được từ vựng');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const masteredCount = useMemo(
    () => items.filter((i) => i.progress?.status === 'mastered').length,
    [items],
  );

  const masteredPercent = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round((masteredCount / items.length) * 100);
  }, [items.length, masteredCount]);

  const toggleStar = useCallback((vocabularyId: string, nextStarred: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== vocabularyId) return item;
        const base = item.progress ?? {
          isStarred: false,
          status: null,
          updatedAt: new Date().toISOString(),
        };
        return { ...item, progress: { ...base, isStarred: nextStarred } };
      }),
    );

    void patchVocabularyProgress({ vocabularyId, isStarred: nextStarred }).catch((e) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== vocabularyId) return item;
          const base = item.progress ?? {
            isStarred: false,
            status: null,
            updatedAt: new Date().toISOString(),
          };
          return { ...item, progress: { ...base, isStarred: !nextStarred } };
        }),
      );
      toast.error(e instanceof Error ? e.message : 'Không cập nhật được sao');
    });
  }, []);

  return {
    items,
    lessonTitle,
    loading,
    total: items.length,
    masteredCount,
    masteredPercent,
    reload: load,
    toggleStar,
  };
}
