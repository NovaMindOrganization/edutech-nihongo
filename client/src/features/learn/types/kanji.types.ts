import type { LessonPayload } from '@/features/student/services/studentApi';

export type KanjiItem = LessonPayload['kanji'][number];

export type KanjiExample = KanjiItem['examples'][number];
