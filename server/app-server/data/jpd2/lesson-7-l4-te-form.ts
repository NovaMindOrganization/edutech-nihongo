import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 4 — Thể Te */
export const lesson7L4TeForm: Jpd2LessonSeed = {
  orderIndex: 19,
  slug: "bai-7-l5-the-te",
  title: "Tiết 5 — Cách chia thể Te (V-te)",
  description: "Quy tắc Vます → Vて — chinh phục thể Te — Bài 7, Tiết 5.",
  objective: "Thuộc lòng quy tắc biến đổi động từ sang thể Te.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 55,
  vocabulary: [
    { word: "書きます", reading: "かきます", meaning: "viết" },
    { word: "飲みます", reading: "のみます", meaning: "uống" },
    { word: "遊びます", reading: "あそびます", meaning: "chơi" },
    { word: "来ます", reading: "きます", meaning: "đến" },
    { word: "買います", reading: "かいます", meaning: "mua" },
    { word: "待ちます", reading: "まちます", meaning: "đợi" },
    { word: "読みます", reading: "よみます", meaning: "đọc" },
    { word: "話します", reading: "はなします", meaning: "nói" },
    { word: "死にます", reading: "しにます", meaning: "chết" },
    { word: "呼びます", reading: "よびます", meaning: "gọi" },
    { word: "取ります", reading: "とります", meaning: "lấy" },
    { word: "作ります", reading: "つくります", meaning: "làm, tạo" },
  ],
  grammar: [
    {
      title: "Nhóm 1 — quy tắc Te",
      challengeLabel: "チャレンジ 1",
      pattern: "う/つ/る → って ／ む/ぶ/ぬ → んで ／ く → いて ／ ぐ → いで ／ す → して",
      meaningVi: "Chia thể Te nhóm 1",
      usage: "かきます→かいて · よみます→よんで · まちます→まって · はなします→はなして.",
      examples: [
        { segments: [{ text: "書きます → 書いて" }], vi: "viết → viết (Te)" },
        { segments: [{ text: "読みます → 読んで" }], vi: "đọc → đọc (Te)" },
        { segments: [{ text: "待ちます → 待って" }], vi: "đợi → đợi (Te)" },
      ],
      drills: [
        { labelVi: "viết → Te", modelJa: "書いて", segments: [{ text: "書いて" }] },
        { labelVi: "đọc → Te", modelJa: "読んで", segments: [{ text: "読んで" }] },
        { labelVi: "đợi → Te", modelJa: "待って", segments: [{ text: "待って" }] },
      ],
      quiz: [
        {
          question: { segments: [{ text: "書きます → ？" }] },
          choices: ["書いて", "書って", "書んで", "書えて"],
          answer: 0,
        },
        {
          question: { segments: [{ text: "読みます → ？" }] },
          choices: ["読んで", "読いて", "読って", "読みて"],
          answer: 0,
        },
      ],
    },
    {
      title: "Nhóm 2 — えます → えて",
      challengeLabel: "チャレンジ 2",
      pattern: "Vえます → Vえて",
      meaningVi: "たべます→たべて · みます→みて",
      examples: [
        { segments: [{ text: "食べます → 食べて" }], vi: "ăn → ăn (Te)" },
        { segments: [{ text: "見ます → 見て" }], vi: "xem → xem (Te)" },
      ],
      drills: [
        { labelVi: "ăn → Te", modelJa: "食べて", segments: [{ text: "食べて" }] },
        { labelVi: "uống → Te", modelJa: "飲んで", segments: [{ text: "飲んで" }] },
      ],
      quiz: [
        {
          question: { segments: [{ text: "飲みます → ？" }] },
          choices: ["飲んで", "飲いて", "飲って", "飲みて"],
          answer: 0,
        },
      ],
    },
    {
      title: "Nhóm 3 & bất quy tắc",
      challengeLabel: "チャレンジ 3",
      pattern: "します→して ／ きます→きて ／ いきます→いって",
      meaningVi: "Động từ đặc biệt",
      examples: [
        { segments: [{ text: "します → して" }], vi: "làm → làm (Te)" },
        { segments: [{ text: "来ます → 来て" }], vi: "đến → đến (Te)" },
        { segments: [{ text: "行きます → 行って" }], vi: "đi → đi (Te)" },
      ],
      drills: [
        { labelVi: "đến → Te", modelJa: "来て", segments: [{ text: "来て" }] },
        { labelVi: "chơi → Te", modelJa: "遊んで", segments: [{ text: "遊んで" }] },
      ],
      quiz: [
        {
          question: { segments: [{ text: "来ます → ？" }] },
          choices: ["来て", "きって", "来って", "きえて"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Luyện chia Te",
      situationVi: "Giáo viên kiểm tra chia thể Te.",
      lines: [
        { speaker: "A", segments: [{ text: "「書きます」の て形は？" }], vi: "Thể Te của 「書きます」?" },
        { speaker: "B", segments: [{ text: "書いて です。" }], vi: "書いて." },
        { speaker: "A", segments: [{ text: "「遊びます」は？" }], vi: "Còn 「遊びます」?" },
        { speaker: "B", segments: [{ text: "遊んで です。" }], vi: "遊んで." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "ミニチャレンジ — Thể Te",
    instructionVi: "Chuyển nhanh các động từ sau sang thể Te: かきます, のみます, あそびます, きます, たべます.",
    promptJapanese: "書きます → ___\n飲みます → ___\n遊びます → ___\n来ます → ___\n食べます → ___",
    expectedPattern: "書いて|飲んで|遊んで|来て|食べて",
  },
  speakingPrompt: "Vます → Vて: 書いて, 飲んで, 遊んで, 来て, 食べて.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "viết → Te",
      guideVi: "書きます → 書いて",
      modelJa: "書いて",
      aiReply: "書いて。",
      acceptPattern: "書いて|かいて",
    },
    {
      id: 2,
      taskVi: "uống → Te",
      guideVi: "飲みます → 飲んで",
      modelJa: "飲んで",
      aiReply: "飲んで。",
      acceptPattern: "飲んで|のんで",
    },
    {
      id: 3,
      taskVi: "chơi → Te",
      guideVi: "遊びます → 遊んで",
      modelJa: "遊んで",
      aiReply: "遊んで。",
      acceptPattern: "遊んで|あそんで",
    },
    {
      id: 4,
      taskVi: "đến → Te",
      guideVi: "来ます → 来て",
      modelJa: "来て",
      aiReply: "来て。",
      acceptPattern: "来て|きて",
      praiseVi: "Hoàn thành!",
    },
  ],
};
