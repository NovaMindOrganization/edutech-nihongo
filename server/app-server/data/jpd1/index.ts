import { lesson1SelfIntro } from "./lesson-1-self-intro.js";
import { lesson2Shopping } from "./lesson-2-shopping.js";
import { lesson3DailyLife } from "./lesson-3-daily-life.js";
import { lessonSupportGreetings } from "./lesson-support-greetings.js";
import { lessonSupportNumbers } from "./lesson-support-numbers.js";
import { JPD1_COURSE_META } from "./types.js";

export { JPD1_COURSE_META };
export type { Jpd1LessonSeed } from "./types.js";

export const JPD1_LESSONS = [
  lessonSupportGreetings,
  lessonSupportNumbers,
  lesson1SelfIntro,
  lesson2Shopping,
  lesson3DailyLife,
];
