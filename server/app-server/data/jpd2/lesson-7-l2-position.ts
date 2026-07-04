import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 2 — Từ chỉ vị trí */
export const lesson7L2Position: Jpd2LessonSeed = {
  orderIndex: 16,
  slug: "bai-7-l2-vi-tri",
  title: "Tiết 2 — Trên, dưới, bên cạnh",
  description: "N1 の N2 に N3 が あります — mô tả vị trí tương đối — Bài 7, Tiết 2.",
  objective: "Mô tả chính xác vị trí tương đối giữa các vật.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "上", reading: "うえ", meaning: "trên" },
    { word: "下", reading: "した", meaning: "dưới" },
    { word: "中", reading: "なか", meaning: "trong" },
    { word: "外", reading: "そと", meaning: "ngoài" },
    { word: "前", reading: "まえ", meaning: "trước" },
    { word: "後", reading: "うしろ", meaning: "sau" },
    { word: "隣", reading: "となり", meaning: "bên cạnh" },
    { word: "間", reading: "あいだ", meaning: "ở giữa" },
    { word: "近く", reading: "ちかく", meaning: "gần" },
    { word: "箱", reading: "はこ", meaning: "hộp" },
    { word: "手紙", reading: "てがみ", meaning: "thư" },
    { word: "写真", reading: "しゃしん", meaning: "ảnh" },
    { word: "電子レンジ", reading: "でんしれんじ", meaning: "lò vi sóng" },
    { word: "置きます", reading: "おきます", meaning: "đặt, để" },
  ],
  grammar: [
    {
      title: "Vị trí tương đối",
      challengeLabel: "チャレンジ 1",
      pattern: "N1 の N2 に N3 が あります/います",
      meaningVi: "Ở (vị trí) của N1 có N3",
      usage: "N2 = うえ/した/なか/まえ/うしろ/となり/あいだ/ちかく...",
      examples: [
        { segments: [{ text: "箱の中に 手紙や 写真が あります。" }], vi: "Trong hộp có thư và ảnh." },
        { segments: [{ text: "テーブルの 上に 花が あります。" }], vi: "Trên bàn có hoa." },
        { segments: [{ text: "冷蔵庫の となりに 電子レンジが あります。" }], vi: "Bên cạnh tủ lạnh có lò vi sóng." },
      ],
      drills: [
        {
          labelVi: "Trong hộp có thư",
          modelJa: "箱の中に手紙があります。",
          segments: [{ text: "箱の中に 手紙が あります。" }],
        },
        {
          labelVi: "Trên bàn có hoa",
          modelJa: "テーブルの上に花があります。",
          segments: [{ text: "テーブルの 上に 花が あります。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "箱の中に 手紙が あります。" }] },
          choices: ["Trong hộp có thư", "Thư ở trên hộp", "Hộp ở trong thư", "Không có thư"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi vị trí cụ thể",
      challengeLabel: "チャレンジ 2",
      pattern: "N は どこに ありますか ／ N1 の どこに ありますか",
      meaningVi: "N ở đâu? / Ở chỗ nào của N1?",
      examples: [
        { segments: [{ text: "塩は どこに ありますか。" }], vi: "Muối ở đâu?" },
        { segments: [{ text: "テーブルの 上に あります。" }], vi: "Ở trên bàn." },
      ],
      drills: [
        {
          labelVi: "Muối ở đâu",
          modelJa: "塩はどこにありますか。",
          segments: [{ text: "塩は どこに ありますか。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Tìm muối trong bếp",
      situationVi: "Ở nhà bạn, hỏi muối để nấu ăn.",
      lines: [
        { speaker: "A", segments: [{ text: "塩は どこに ありますか。" }], vi: "Muối ở đâu?" },
        { speaker: "B", segments: [{ text: "冷蔵庫の 上に あります。" }], vi: "Ở trên tủ lạnh." },
      ],
    },
    {
      title: "Trong hộp",
      situationVi: "Mô tả đồ trong hộp.",
      lines: [
        { speaker: "A", segments: [{ text: "箱の中に なにが ありますか。" }], vi: "Trong hộp có gì?" },
        { speaker: "B", segments: [{ text: "手紙や 写真が あります。" }], vi: "Có thư và ảnh." },
      ],
    },
  ],
  kanji: [],
  speakingPrompt: "N1 の うえ/した/なか に N が あります · どこに ありますか.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Trên bàn có hoa",
      guideVi: "テーブルの 上に 花が あります。",
      modelJa: "テーブルの上に花があります。",
      aiReply: "あります。",
      acceptPattern: "上に|あります",
    },
    {
      id: 2,
      taskVi: "Trong hộp có thư",
      guideVi: "箱の中に 手紙が あります。",
      modelJa: "箱の中に手紙があります。",
      aiReply: "あります。",
      acceptPattern: "中に|あります",
      praiseVi: "Hoàn thành!",
    },
  ],
};
