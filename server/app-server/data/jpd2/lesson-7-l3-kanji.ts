import { KANJI_BAI7 } from "./kanji-catalog.js";
import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 3 — Kanji (trước thể Te) */
export const lesson7L3Kanji: Jpd2LessonSeed = {
  orderIndex: 17,
  slug: "bai-7-l3-kanji",
  title: "Tiết 3 — Kanji bài 7",
  description:
    "Kanji 肉・料・理・野・半・大・小 — chuẩn bị cho nhà bếp và thể Te — Bài 7, Tiết 3. (寺・言・田... đã học Bài 6)",
  objective:
    "Nhận biết kanji nhà bếp và mô tả (肉料理野半大小) trước khi học Vてください.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 40,
  vocabulary: [],
  grammar: [],
  dialogues: [],
  kanji: KANJI_BAI7,
  speakingPrompt: "Luyện đọc: 料理, 野菜, 大学, 大きい, 小さい.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Đọc 料理",
      guideVi: "Kanji 料 + 理 — món ăn.",
      modelJa: "料理",
      aiReply: "りょうり",
      acceptPattern: "りょうり|料理",
      hintVi: "Nói: りょうり",
    },
    {
      id: 2,
      taskVi: "Đọc 野菜",
      guideVi: "Kanji 野 + 菜 — rau củ.",
      modelJa: "野菜",
      aiReply: "やさい",
      acceptPattern: "やさい|野菜",
      hintVi: "Nói: やさい",
    },
    {
      id: 3,
      taskVi: "Đọc 大学",
      guideVi: "Kanji 大 + 学 — đại học.",
      modelJa: "大学",
      aiReply: "だいがく",
      acceptPattern: "だいがく|大学",
      hintVi: "Nói: だいがく",
    },
    {
      id: 4,
      taskVi: "Đọc 大きい",
      guideVi: "Kanji 大 — to, lớn.",
      modelJa: "大きい",
      aiReply: "おおきい",
      acceptPattern: "おおきい|大きい",
      hintVi: "Nói: おおきい",
      praiseVi: "Hoàn thành!",
    },
  ],
};
