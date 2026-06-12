import { apiFetch } from '@/services/httpClient';

export type DictionaryResult = {
  vocabulary: Array<{
    id: string;
    word: string;
    reading: string | null;
    meaning: string;
    jlptLevel: string;
  }>;
  grammar: Array<{
    id: string;
    title: string;
    pattern: string;
    meaningVi: string;
    jlpt: string;
  }>;
  kanji: Array<{
    id: string;
    character: string;
    meaning: string;
    hanVietPronunciation: string | null;
    readingsOn: string[];
    readingsKun: string[];
    jlptLevel: string;
  }>;
  rateLimited?: boolean;
};

export function searchDictionary(q: string, authenticated = false) {
  const path = authenticated
    ? `/student/dictionary/search?q=${encodeURIComponent(q)}`
    : `/public/dictionary/search?q=${encodeURIComponent(q)}`;
  return apiFetch<DictionaryResult>(path);
}
