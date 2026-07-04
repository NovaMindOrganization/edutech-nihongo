import type { Jpd2LessonSeed } from "./types.js";

/** Bài 6 · Tiết 3 — Từ chối lời mời lịch sự */
export const lesson6Tiet3Decline: Jpd2LessonSeed = {
  orderIndex: 11,
  slug: "bai-6-tiet-3-tu-choi-loi-moi-lich-su",
  title: "Tiết 3 — Từ chối lời mời lịch sự",
  description: "すみません、ちょっと… · ようじが あります — từ chối lời mời lịch sự — Bài 6, Tiết 3.",
  objective: "Từ chối lời mời mà không quá trực tiếp.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "すみません", reading: "すみません", meaning: "xin lỗi" },
    { word: "ちょっと", reading: "ちょっと", meaning: "hơi / một chút" },
    { word: "またこんど", reading: "またこんど", meaning: "hẹn lần sau" },
    { word: "ざんねん", reading: "ざんねん", meaning: "tiếc quá" },
    { word: "ようじ", reading: "ようじ", meaning: "việc bận / việc riêng" },
    { word: "やくそく", reading: "やくそく", meaning: "cuộc hẹn / lời hứa" },
    { word: "あります", reading: "あります", meaning: "có" },
    { word: "いそがしい", reading: "いそがしい", meaning: "bận" },
    { word: "あした", reading: "あした", meaning: "ngày mai" },
    { word: "かいもの", reading: "かいもの", meaning: "mua sắm" },
    { word: "レストラン", reading: "レストラン", meaning: "nhà hàng" },
    { word: "カラオケ", reading: "カラオケ", meaning: "karaoke" },
    { word: "はいります", reading: "はいります", meaning: "vào" },
  ],
  grammar: [
    {
      title: "Từ chối nhẹ nhàng",
      challengeLabel: "チャレンジ 1",
      pattern: "すみません、ちょっと…",
      meaningVi: "Xin lỗi, hơi...",
      usage: "Câu dở dang ちょっと… ngụ ý từ chối lịch sự, không cần nói thẳng.",
      examples: [
        { segments: [{ text: "すみません、ちょっと…。" }], vi: "Xin lỗi, hơi..." },
        { segments: [{ text: "すみません、あしたは ちょっと…。" }], vi: "Xin lỗi, ngày mai hơi..." },
      ],
      drills: [
        {
          labelVi: "Từ chối nhẹ",
          modelJa: "すみません、ちょっと…。",
          segments: [{ text: "すみません、ちょっと…。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "すみません、ちょっと…。" }] },
          choices: ["Xin lỗi, hơi... (từ chối nhẹ)", "Rất vui", "Đồng ý ngay", "Hẹn gặp lại"],
          answer: 0,
        },
      ],
    },
    {
      title: "Có việc bận",
      challengeLabel: "チャレンジ 2",
      pattern: "N が あります ／ すみません、N が ありますから",
      meaningVi: "Có N / Vì có N",
      examples: [
        { segments: [{ text: "ようじが あります。" }], vi: "Có việc bận." },
        { segments: [{ text: "すみません。ようじが あります。" }], vi: "Xin lỗi. Có việc bận." },
        { segments: [{ text: "いそがしいですから。" }], vi: "Vì bận." },
      ],
      drills: [
        {
          labelVi: "Có việc bận",
          modelJa: "ようじがあります。",
          segments: [{ text: "ようじが あります。" }],
        },
        {
          labelVi: "Vì bận",
          modelJa: "いそがしいですから。",
          segments: [{ text: "いそがしいですから。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "ようじが あります。" }] },
          choices: ["Có việc bận", "Rảnh", "Đi chơi", "Rất vui"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hẹn lần sau",
      challengeLabel: "チャレンジ 3",
      pattern: "またこんど",
      meaningVi: "Hẹn lần sau",
      examples: [
        { segments: [{ text: "そうですか。またこんど。" }], vi: "Thế à. Hẹn lần sau." },
        { segments: [{ text: "またこんど。" }], vi: "Hẹn lần sau." },
      ],
      drills: [
        {
          labelVi: "Hẹn lần sau",
          modelJa: "またこんど。",
          segments: [{ text: "またこんど。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Từ chối vào nhà hàng",
      situationVi: "Rủ vào nhà hàng nhưng từ chối nhẹ.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "いっしょに あそこの レストランに 入りませんか。" }],
          vi: "Vào nhà hàng kia cùng tôi không?",
        },
        { speaker: "B", segments: [{ text: "すみません、ちょっと…。" }], vi: "Xin lỗi, hơi..." },
      ],
    },
    {
      title: "Ngày mai bận",
      situationVi: "Rủ đi mua sắm ngày mai.",
      lines: [
        { speaker: "A", segments: [{ text: "あした、いっしょに 買い物に 行きませんか。" }], vi: "Ngày mai đi mua sắm cùng tôi không?" },
        { speaker: "B", segments: [{ text: "すみません、あしたは ちょっと…。" }], vi: "Xin lỗi, ngày mai hơi..." },
        { speaker: "B", segments: [{ text: "いそがしいですから。" }], vi: "Vì bận." },
      ],
    },
    {
      title: "Có việc bận",
      situationVi: "Rủ đi karaoke nhưng có việc.",
      lines: [
        { speaker: "A", segments: [{ text: "いっしょに カラオケに 行きませんか。" }], vi: "Đi karaoke cùng tôi không?" },
        { speaker: "B", segments: [{ text: "すみません。ようじが あります。" }], vi: "Xin lỗi. Có việc bận." },
        { speaker: "A", segments: [{ text: "そうですか。またこんど。" }], vi: "Thế à. Hẹn lần sau." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Từ chối lịch sự",
    instructionVi: "Từ chối lời mời bằng すみません、ちょっと… hoặc ようじが あります.",
    promptJapanese: "いっしょに ___ませんか。\nすみません、ちょっと…。\nまたこんど。",
    expectedPattern: "すみません|ちょっと|ようじ|こんど",
  },
  speakingPrompt: "すみません、ちょっと… · ようじが あります · またこんど.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Từ chối nhẹ",
      guideVi: "すみません、ちょっと…。",
      modelJa: "すみません、ちょっと…。",
      aiReply: "ちょっと…。",
      acceptPattern: "ちょっと|すみません",
    },
    {
      id: 2,
      taskVi: "Có việc bận",
      guideVi: "ようじが あります。",
      modelJa: "ようじがあります。",
      aiReply: "あります。",
      acceptPattern: "ようじ|あります",
    },
    {
      id: 3,
      taskVi: "Hẹn lần sau",
      guideVi: "またこんど。",
      modelJa: "またこんど。",
      aiReply: "こんど。",
      acceptPattern: "こんど",
      praiseVi: "Hoàn thành!",
    },
  ],
};
