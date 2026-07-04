import { SPEAKING_PASS_SCORE } from './speaking-progress';

/** Khóa nhập môn JPD1/JPD2: ưu tiên luyện nhại đúng mẫu; ngưỡng phát âm thấp hơn N5/N4. */
export const JPD_INTRO_SPEAKING_PASS_SCORE = 65;

const INTRO_COURSE_LEVELS = new Set(["JPD1", "JPD2"]);

export function isIntroCourseLevel(jlptLevel?: string | null): boolean {
  return INTRO_COURSE_LEVELS.has(jlptLevel ?? "");
}

/** @deprecated Use JPD_INTRO_SPEAKING_PASS_SCORE */
export const JPD1_SPEAKING_PASS_SCORE = JPD_INTRO_SPEAKING_PASS_SCORE;

export function speakingPassScoreForCourse(jlptLevel?: string | null): number {
  return isIntroCourseLevel(jlptLevel) ? JPD_INTRO_SPEAKING_PASS_SCORE : SPEAKING_PASS_SCORE;
}

/** Scripted JPD1/JPD2: không chặn tiến độ khi Azure Speech chưa cấu hình. */
export function allowsJpd1PronunciationFallback(
  jlptLevel?: string | null,
  isScripted?: boolean,
): boolean {
  return isIntroCourseLevel(jlptLevel) && !!isScripted;
}
