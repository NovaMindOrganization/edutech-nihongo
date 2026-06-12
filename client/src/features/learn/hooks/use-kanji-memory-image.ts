import { useEffect, useState } from 'react';

import { kanjiHasMemoryImage, kanjiMemoryImageSrc } from '@/services/httpClient';

import type { KanjiItem } from '../types/kanji.types';

/** Tải lại ảnh memoric mỗi khi đổi kanji (tránh cache/stale khi bấm Next). */
export function useKanjiMemoryImage(kanji: KanjiItem) {
  const hasImage = kanjiHasMemoryImage(kanji);
  const imageSrc = hasImage ? kanjiMemoryImageSrc(kanji) : null;

  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(imageSrc));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!imageSrc) {
      setResolvedSrc(null);
      setLoading(false);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setResolvedSrc(null);

    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setResolvedSrc(imageSrc);
        setLoading(false);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setFailed(true);
        setLoading(false);
      }
    };
    img.src = imageSrc;

    return () => {
      cancelled = true;
    };
  }, [imageSrc, kanji.id]);

  return { hasImage, resolvedSrc, loading, failed };
}
