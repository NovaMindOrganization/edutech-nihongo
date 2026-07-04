import type { Jpd2LessonSeed } from "./types.js";

/** Bài 4 · Tiết 6 — ST3 món ăn theo thời tiết */
export const lesson4St3FoodWeather: Jpd2LessonSeed = {
  orderIndex: 5,
  slug: "bai-4-st3-mon-an-va-hoat-dong-theo-thoi-tiet",
  title: "ST3 — Món ăn và hoạt động theo thời tiết",
  description: "Nói khi trời nóng/lạnh hoặc mùa hè thì ăn gì, làm gì — Bài 4, Tiết 6.",
  objective:
    "Hỏi và trả lời あついひ/さむいひ/なつに なにをたべますか・なにをしますか; dùng とても おいしいです.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "あついひ", reading: "あついひ", meaning: "ngày nóng" },
    { word: "さむいひ", reading: "さむいひ", meaning: "ngày lạnh" },
    { word: "なつ", reading: "なつ", meaning: "mùa hè" },
    { word: "サムゲタン", reading: "サムゲタン", meaning: "gà hầm sâm Hàn Quốc" },
    { word: "おいしい", reading: "おいしい", meaning: "ngon" },
    { word: "あまい", reading: "あまい", meaning: "ngọt" },
    { word: "からい", reading: "からい", meaning: "cay" },
    { word: "にがい", reading: "にがい", meaning: "đắng" },
    { word: "すっぱい", reading: "すっぱい", meaning: "chua" },
    { word: "つめたい", reading: "つめたい", meaning: "lạnh / mát lạnh" },
    { word: "たべます", reading: "たべます", meaning: "ăn" },
    { word: "します", reading: "します", meaning: "làm" },
    { word: "かんこく", reading: "かんこく", meaning: "Hàn Quốc" },
    { word: "なに", reading: "なに", meaning: "cái gì" },
    { word: "とても", reading: "とても", meaning: "rất" },
  ],
  grammar: [
    {
      title: "Ăn gì khi trời nóng",
      challengeLabel: "チャレンジ 1",
      pattern: "Nで あついひ なにをたべますか ／ Nをたべます",
      meaningVi: "Ở N, ngày nóng thì ăn gì? / Ăn N",
      usage: "で chỉ nơi. あついひ = ngày nóng.",
      examples: [
        {
          segments: [{ text: "A：かんこくで あついひ なにをたべますか。" }, { text: " B：サムゲタンを たべます。" }],
          vi: "Ở Hàn, ngày nóng ăn gì? — Gà hầm sâm.",
        },
        {
          segments: [{ text: "とても おいしいです。" }],
          vi: "Rất ngon.",
        },
      ],
      drills: [
        {
          labelVi: "Hỏi ăn gì",
          modelJa: "あついひなにをたべますか。",
          segments: [{ text: "あついひ なにを たべますか。" }],
        },
        {
          labelVi: "Ăn samgyetang",
          modelJa: "サムゲタンをたべます。",
          segments: [{ text: "サムゲタンを たべます。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "かんこくで あついひ なにをたべますか。" }] },
          choices: ["Ở Hàn ngày nóng ăn gì?", "Ở Hàn ngày lạnh làm gì?", "Hàn Quốc ở đâu?", "Samgyetang là gì"],
          answer: 0,
        },
      ],
    },
    {
      title: "Làm gì theo thời tiết",
      challengeLabel: "チャレンジ 2",
      pattern: "あついひ/さむいひ なにをしますか ／ なつに なにをしますか",
      meaningVi: "Ngày nóng/lạnh làm gì? / Mùa hè làm gì?",
      examples: [
        { segments: [{ text: "あついひ なにをしますか。" }], vi: "Ngày nóng làm gì?" },
        { segments: [{ text: "さむいひ なにをしますか。" }], vi: "Ngày lạnh làm gì?" },
        { segments: [{ text: "なつに なにをしますか。" }], vi: "Mùa hè làm gì?" },
      ],
      drills: [
        {
          labelVi: "Hỏi mùa hè",
          modelJa: "なつになにをしますか。",
          segments: [{ text: "なつに なにを しますか。" }],
        },
        {
          labelVi: "Rất ngon",
          modelJa: "とてもおいしいです。",
          segments: [{ text: "とても おいしいです。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "とても おいしいです。" }] },
          choices: ["Rất ngon", "Rất cay", "Rất lạnh", "Không ngon"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Món ăn ngày nóng ở Hàn",
      situationVi: "Hỏi món ăn khi trời nóng ở Hàn Quốc.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "かんこくで あついひ なにをたべますか。" }],
          vi: "Ở Hàn ngày nóng ăn gì?",
        },
        { speaker: "B", segments: [{ text: "サムゲタンを たべます。" }], vi: "Ăn gà hầm sâm." },
        { speaker: "B", segments: [{ text: "とても おいしいです。" }], vi: "Rất ngon." },
      ],
    },
    {
      title: "Hoạt động theo mùa",
      situationVi: "Hỏi làm gì vào ngày nóng, lạnh và mùa hè.",
      lines: [
        { speaker: "A", segments: [{ text: "あついひ なにをしますか。" }], vi: "Ngày nóng làm gì?" },
        { speaker: "B", segments: [{ text: "うみへ いきます。" }], vi: "Đi biển." },
        { speaker: "A", segments: [{ text: "さむいひ なにをしますか。" }], vi: "Ngày lạnh làm gì?" },
        { speaker: "B", segments: [{ text: "おんせんへ いきます。" }], vi: "Đi suối nước nóng." },
        { speaker: "A", segments: [{ text: "なつに なにをしますか。" }], vi: "Mùa hè làm gì?" },
        { speaker: "B", segments: [{ text: "はなみを します。" }], vi: "Ngắm hoa." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Ăn uống theo thời tiết",
    instructionVi: "Hỏi và trả lời một món ăn ngày nóng và một hoạt động mùa hè.",
    promptJapanese: "___で あついひ なにをたべますか。\n___を たべます。\nなつに なにをしますか。",
    expectedPattern: "たべます|します|あつい|なつ|おいしい",
  },
  speakingPrompt: "Ăn uống theo thời tiết: あついひ なにをたべますか, なつに なにをしますか.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi ăn gì ngày nóng",
      guideVi: "あついひ なにをたべますか。",
      modelJa: "あついひなにをたべますか。",
      aiReply: "たべますか。",
      acceptPattern: "たべますか|あつい",
    },
    {
      id: 2,
      taskVi: "Trả lời món ăn",
      guideVi: "サムゲタンを たべます。",
      modelJa: "サムゲタンをたべます。",
      aiReply: "たべます。",
      acceptPattern: "たべます",
    },
    {
      id: 3,
      taskVi: "Rất ngon",
      guideVi: "とても おいしいです。",
      modelJa: "とてもおいしいです。",
      aiReply: "おいしいです。",
      acceptPattern: "おいしい",
    },
    {
      id: 4,
      taskVi: "Mùa hè làm gì",
      guideVi: "なつに なにをしますか。",
      modelJa: "なつになにをしますか。",
      aiReply: "しますか。",
      acceptPattern: "なつ|しますか",
      praiseVi: "Hoàn thành!",
    },
  ],
};
