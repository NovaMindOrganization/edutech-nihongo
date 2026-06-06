import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  getKanjiLearnedStatus,
  upsertMastery,
} from '@/features/student/services/studentApi';

export function useKanjiProgress(kanjiIds: string[]) {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const idsKey = useMemo(() => [...new Set(kanjiIds)].sort().join(','), [kanjiIds]);

  useEffect(() => {
    if (!idsKey) {
      setLearnedIds(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getKanjiLearnedStatus(idsKey.split(','))
      .then((data) => {
        if (cancelled) return;
        setLearnedIds(new Set(data.learnedIds));
      })
      .catch((e) => {
        if (cancelled) return;
        toast.error(e instanceof Error ? e.message : 'Không tải được tiến độ kanji');
        setLearnedIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const isLearned = useCallback((kanjiId: string) => learnedIds.has(kanjiId), [learnedIds]);

  const markLearned = useCallback((kanjiId: string) => {
    setLearnedIds((prev) => {
      if (prev.has(kanjiId)) return prev;
      const next = new Set(prev);
      next.add(kanjiId);
      return next;
    });

    void upsertMastery({ itemId: kanjiId, itemType: 'kanji', isLearned: true }).catch((e) => {
      setLearnedIds((prev) => {
        const next = new Set(prev);
        next.delete(kanjiId);
        return next;
      });
      toast.error(e instanceof Error ? e.message : 'Không lưu được tiến độ');
    });
  }, []);

  const learnedCount = learnedIds.size;

  return {
    loading,
    learnedCount,
    isLearned,
    markLearned,
  };
}
