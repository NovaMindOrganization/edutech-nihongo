import { createContext, useContext } from 'react';

import type { LessonPayload } from '@/features/student/services/studentApi';

export const LessonContext = createContext<LessonPayload | null>(null);

export function useLessonData() {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('LessonContext missing');
  return ctx;
}
