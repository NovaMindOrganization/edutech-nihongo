import { KANJI_BAI6 } from "./kanji-catalog.js";
import type { Jpd2LessonSeed } from "./types.js";

/** Bài 6 · Tiết 6 — Kanji */
export const lesson6L6Kanji: Jpd2LessonSeed = {
  orderIndex: 14,
  slug: "bai-6-l6-kanji",
  title: "Tiết 6 — Kanji bài 6",
  description: "Kanji 今・来・帰・会・社・聞・読・書・話・言... — ôn thời gian và động từ giao tiếp — Bài 6, Tiết 6.",
  objective:
    "Nhận biết và đọc kanji bài 6 (thời gian, gặp gỡ, đọc-viết-nói) — liên kết với từ đã học ở Bài 5–6.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [],
  grammar: [],
  dialogues: [],
  kanji: KANJI_BAI6,
  speakingPrompt: "Luyện đọc: 今週, 来週, 会社, 読みます, 書きます, 会います.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Đọc 今週",
      guideVi: "Kanji 今 + 週 — tuần này.",
      modelJa: "今週",
      aiReply: "こんしゅう",
      acceptPattern: "こんしゅう|今週",
      hintVi: "Nói: こんしゅう",
    },
    {
      id: 2,
      taskVi: "Đọc 来週",
      guideVi: "Kanji 来 + 週 — tuần sau.",
      modelJa: "来週",
      aiReply: "らいしゅう",
      acceptPattern: "らいしゅう|来週",
      hintVi: "Nói: らいしゅう",
    },
    {
      id: 3,
      taskVi: "Đọc 会社",
      guideVi: "会 + 社 — công ty.",
      modelJa: "会社",
      aiReply: "かいしゃ",
      acceptPattern: "かいしゃ|会社",
      hintVi: "Nói: かいしゃ",
    },
    {
      id: 4,
      taskVi: "Đọc 書きます",
      guideVi: "Kanji 書 — viết.",
      modelJa: "書きます",
      aiReply: "かきます",
      acceptPattern: "かきます|書きます",
      hintVi: "Nói: かきます",
      praiseVi: "Hoàn thành Bài 6!",
    },
  ],
};
