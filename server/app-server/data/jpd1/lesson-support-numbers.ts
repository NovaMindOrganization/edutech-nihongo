import type { Jpd1LessonSeed } from "./types.js";

export const lessonSupportNumbers: Jpd1LessonSeed = {
  orderIndex: 1,
  slug: "so-dem-co-ban",
  title: "Số đếm cơ bản",
  description: "Đếm từ 0–10, số lớn và cách đọc tiền yên.",
  objective: "Đọc được số cơ bản và giá tiền bằng 円.",
  lessonType: "support",
  isBonus: true,
  estimatedMinutes: 25,
  vocabulary: [
    { word: "ぜろ", reading: "ぜろ", meaning: "0", memoryTip: "ゼロ — số không." },
    { word: "いち", reading: "いち", meaning: "1" },
    { word: "に", reading: "に", meaning: "2" },
    { word: "さん", reading: "さん", meaning: "3" },
    { word: "よん", reading: "よん", meaning: "4", memoryTip: "Cũng đọc し / よ." },
    { word: "ご", reading: "ご", meaning: "5" },
    { word: "ろく", reading: "ろく", meaning: "6" },
    { word: "なな", reading: "なな", meaning: "7", memoryTip: "Cũng đọc しち." },
    { word: "はち", reading: "はち", meaning: "8" },
    { word: "きゅう", reading: "きゅう", meaning: "9", memoryTip: "Cũng đọc く." },
    { word: "じゅう", reading: "じゅう", meaning: "10" },
    { word: "ひゃく", reading: "ひゃく", meaning: "100", memoryTip: "300: さんびゃく, 600: ろっぴゃく, 800: はっぴゃく." },
    { word: "せん", reading: "せん", meaning: "1000", memoryTip: "3000: さんぜん, 8000: はっせん." },
    { word: "まん", reading: "まん", meaning: "10000" },
    { word: "えん", reading: "えん", meaning: "yên (tiền Nhật)", memoryTip: "Gắn sau số: 100えん = 100 yên." },
  ],
  grammar: [
    {
      title: "Đọc số tiền",
      pattern: "数字 + 円（えん）",
      meaningVi: "Giá tiền bằng yên Nhật",
      usage: "Đặt số trước えん. Ví dụ: 350えん → さんびゃくごじゅうえん.",
      examples: [
        { segments: [{ text: "このペンは 100えんです。" }], vi: "Cây bút này 100 yên." },
        { segments: [{ text: "ひゃくえんショップ" }], vi: "Cửa hàng 100 yên." },
      ],
      quiz: [
        {
          question: { segments: [{ text: "300えんを どう よみますか。" }] },
          choices: ["さんひゃくえん", "さんびゃくえん", "みっひゃくえん", "さんぜんえん"],
          answer: 1,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Hỏi giá đơn giản",
      situationVi: "Mua đồ ở cửa hàng 100 yên.",
      lines: [
        { speaker: "A", segments: [{ text: "すみません、これは いくらですか。" }], vi: "Xin lỗi, cái này bao nhiêu tiền?" },
        { speaker: "B", segments: [{ text: "100えんです。" }], vi: "100 yên ạ." },
        { speaker: "A", segments: [{ text: "じゃ、これを ください。" }], vi: "Vậy cho tôi cái này." },
      ],
    },
  ],
  kanji: [],
  speakingPrompt: "Luyện đọc to các số từ 1 đến 10, sau đó nói giá: 350えん, 800えん.",
};
