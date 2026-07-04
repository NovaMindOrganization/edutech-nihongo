import type { Jpd1LessonSeed } from "./types.js";

/** Bài 3 · Tiết 1 */
export const lesson3Tiet1Time: Jpd1LessonSeed = {
  orderIndex: 9,
  slug: "bai-3-tiet-1-hoi-gio-va-thoi-gian",
  title: "ST1 — Hỏi giờ và nói thời gian",
  description: "Hỏi giờ hiện tại, nói giờ, phút, buổi sáng/chiều — Bài 3, Tiết 1.",
  objective: "Hỏi được giờ hiện tại, nói giờ, phút và buổi sáng/chiều (ごぜん／ごご).",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "ごぜん", reading: "ごぜん", meaning: "Buổi sáng / AM" },
    { word: "ごご", reading: "ごご", meaning: "Buổi chiều / PM" },
    { word: "いま", reading: "いま", meaning: "Bây giờ" },
    { word: "なんじ", reading: "なんじ", meaning: "Mấy giờ" },
    { word: "なんぷん", reading: "なんぷん", meaning: "Mấy phút" },
    { word: "～じ", reading: "じ", meaning: "Giờ", memoryTip: "Gắn sau số: さんじ = 3 giờ." },
    { word: "～ふん", reading: "ふん", meaning: "Phút" },
    { word: "～ぷん", reading: "ぷん", meaning: "Phút (biến âm)" },
    { word: "はん", reading: "はん", meaning: "Rưỡi", memoryTip: "はちじはん = 8 giờ rưỡi." },
  ],
  grammar: [
    {
      title: "Hỏi và nói giờ",
      challengeLabel: "チャレンジ 1",
      pattern: "いま なんじですか ／ ～じです",
      meaningVi: "Bây giờ là mấy giờ? / Là ~ giờ",
      usage: "なんじ hỏi giờ. Trả lời: số + じです.",
      notes:
        "Đọc giờ: 1=いちじ, 2=にじ, 3=さんじ, 4=よじ, 5=ごじ, 6=ろくじ, 7=しちじ, 8=はちじ, 9=くじ, 10=じゅうじ, 11=じゅういちじ, 12=じゅうにじ.",
      examples: [
        { segments: [{ text: "いま なんじですか。" }], vi: "Bây giờ là mấy giờ?" },
        { segments: [{ text: "さんじです。" }], vi: "Là 3 giờ." },
        {
          segments: [{ text: "A：すみません、いま なんじですか。" }, { text: " B：さんじです。" }],
          vi: "Xin lỗi, bây giờ mấy giờ? — 3 giờ ạ.",
        },
      ],
      drills: [
        {
          labelVi: "Hỏi giờ",
          modelJa: "いまなんじですか。",
          segments: [{ text: "いま なんじですか。" }],
        },
        {
          labelVi: "Trả lời giờ",
          modelJa: "さんじです。",
          segments: [{ text: "さんじです。" }],
          hintVi: "Thay さん bằng giờ khác.",
        },
      ],
    },
    {
      title: "Sáng / chiều, phút và rưỡi",
      challengeLabel: "チャレンジ 2",
      pattern: "ごぜん／ごご ～じ ～ふん ／ ～じ はん",
      meaningVi: "Giờ sáng/chiều, phút, rưỡi",
      usage: "ごぜん = AM, ごご = PM. ～じ ～ふんです = ~ giờ ~ phút. はん = rưỡi.",
      notes:
        "Phút đặc biệt: 1=いっぷん, 3=さんぷん, 4=よんぷん, 6=ろっぷん, 8=はっぷん, 10=じゅっぷん/じっぷん, 何=なんぷん.",
      examples: [
        { segments: [{ text: "ごぜん しちじ" }], vi: "7 giờ sáng" },
        { segments: [{ text: "ごご さんじ" }], vi: "3 giờ chiều" },
        { segments: [{ text: "ろくじ じゅうごふんです。" }], vi: "Là 6 giờ 15 phút." },
        { segments: [{ text: "はちじ はんです。" }], vi: "Là 8 giờ rưỡi." },
      ],
      drills: [
        {
          labelVi: "Nói 8 giờ rưỡi",
          modelJa: "はちじはんです。",
          segments: [{ text: "はちじ はんです。" }],
        },
        {
          labelVi: "Nói 6 giờ 15 phút",
          modelJa: "ろくじじゅうごふんです。",
          segments: [{ text: "ろくじ じゅうごふんです。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "4時 を どう よみますか。" }] },
          choices: ["よじ", "しじ", "よんじ", "しちじ"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Hỏi giờ hiện tại",
      situationVi: "Hỏi người lạ bây giờ là mấy giờ.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "すみません、いま なんじですか。" }],
          vi: "Xin lỗi, bây giờ là mấy giờ ạ?",
        },
        { speaker: "B", segments: [{ text: "さんじです。" }], vi: "Là 3 giờ ạ." },
        {
          speaker: "A",
          segments: [{ text: "そうですか。" }, { text: "ありがとうございます。" }],
          vi: "Thế à. Cảm ơn ạ.",
        },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Giờ giấc",
    instructionVi: "Hỏi giờ hiện tại và nói một mốc giờ có phút hoặc rưỡi.",
    promptJapanese: "いま ___ ですか。\n___じ ___です。\n___じはんです。",
    expectedPattern: "なんじ|じ|ふん|はん",
  },
  speakingPrompt: "Hỏi và nói giờ: いま なんじですか, ～じ, ～ふん, はん.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi giờ",
      guideVi: "いま なんじですか。",
      modelJa: "いまなんじですか。",
      aiReply: "なんじですか。",
      acceptPattern: "なんじ",
      hintVi: "Hỏi: bây giờ mấy giờ?",
    },
    {
      id: 2,
      taskVi: "Trả lời giờ",
      guideVi: "さんじです。",
      modelJa: "さんじです。",
      aiReply: "さんじです。",
      acceptPattern: "じです",
      hintVi: "Số + じです.",
    },
    {
      id: 3,
      taskVi: "Giờ sáng",
      guideVi: "ごぜん しちじです。",
      modelJa: "ごぜんしちじです。",
      aiReply: "ごぜん しちじです。",
      acceptPattern: "ごぜん",
      hintVi: "ごぜん + giờ.",
    },
    {
      id: 4,
      taskVi: "Giờ rưỡi",
      guideVi: "はちじ はんです。",
      modelJa: "はちじはんです。",
      aiReply: "はんです。",
      acceptPattern: "はん",
      praiseVi: "Hoàn thành!",
      hintVi: "～じはん = rưỡi.",
    },
  ],
};
