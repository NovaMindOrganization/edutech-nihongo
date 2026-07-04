import { lesson1SelfIntro } from "./lesson-1-self-intro.js";

import { lesson2Birthday } from "./lesson-2-birthday.js";

import { lesson2Kanji } from "./lesson-2-kanji.js";

import { lesson2Slot1Location } from "./lesson-2-slot1-location.js";

import { lesson2Slot2Shopping } from "./lesson-2-slot2-shopping.js";

import { lesson2Slot3Restaurant } from "./lesson-2-slot3-restaurant.js";

import { lesson3Hobby } from "./lesson-3-hobby.js";

import { lesson3Tiet1Time } from "./lesson-3-tiet1-time.js";

import { lesson3Tiet2Schedule } from "./lesson-3-tiet2-schedule.js";

import { lesson3Tiet3Activities } from "./lesson-3-tiet3-activities.js";

import { lesson3Tiet4Negative } from "./lesson-3-tiet4-negative.js";

import { lesson3Tiet5Habits } from "./lesson-3-tiet5-habits.js";

import { lesson3Tiet6Kanji } from "./lesson-3-tiet6-kanji.js";

import { lessonSupportGreetings } from "./lesson-support-greetings.js";

import { lessonSupportNumbers } from "./lesson-support-numbers.js";

import { JPD1_COURSE_META } from "./types.js";



export { JPD1_COURSE_META };

export type { Jpd1LessonSeed } from "./types.js";



/**

 * JPD1 — 3 bài:

 * - Bài 1: 5 tiết (chào hỏi → số đếm → ST1 → ST2 → ST3)

 * - Bài 2: 4 tiết (ST1 → ST2 → ST3 → kanji)

 * - Bài 3: 6 tiết (giờ → lịch → hoạt động → phủ định → thói quen → kanji)

 */

export const JPD1_LESSONS = [

  lessonSupportGreetings,

  lessonSupportNumbers,

  lesson1SelfIntro,

  lesson2Birthday,

  lesson3Hobby,

  lesson2Slot1Location,

  lesson2Slot2Shopping,

  lesson2Slot3Restaurant,

  lesson2Kanji,

  lesson3Tiet1Time,

  lesson3Tiet2Schedule,

  lesson3Tiet3Activities,

  lesson3Tiet4Negative,

  lesson3Tiet5Habits,

  lesson3Tiet6Kanji,

];


