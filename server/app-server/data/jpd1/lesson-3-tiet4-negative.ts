import type { Jpd1LessonSeed } from "./types.js";

/** Bài 3 · Tiết 4 */
export const lesson3Tiet4Negative: Jpd1LessonSeed = {
  orderIndex: 12,
  slug: "bai-3-tiet-4-phu-dinh-va-lam-gi-o-dau",
  title: "ST4 — Phủ định động từ và làm gì ở đâu",
  description: "Vません, 場所で N を Vます — phủ định và nói làm gì ở đâu — Bài 3, Tiết 4.",
  objective: "Dùng Vません phủ định; nói làm hành động tại địa điểm (場所で N を Vます).",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "おさけ", reading: "おさけ", meaning: "Rượu" },
    { word: "ごはん", reading: "ごはん", meaning: "Cơm" },
    { word: "ラーメン", reading: "ラーメン", meaning: "Mì ramen" },
    { word: "みず", reading: "みず", meaning: "Nước" },
    { word: "あさくさ", reading: "あさくさ", meaning: "Asakusa" },
    { word: "よこはま", reading: "よこはま", meaning: "Yokohama" },
    { word: "きっさてん", reading: "きっさてん", meaning: "Quán cà phê" },
    { word: "コーヒー", reading: "コーヒー", meaning: "Cà phê" },
    { word: "かんこく", reading: "かんこく", meaning: "Hàn Quốc" },
    { word: "はかた", reading: "はかた", meaning: "Hakata" },
    { word: "あおもり", reading: "あおもり", meaning: "Aomori" },
    { word: "おべんとう", reading: "おべんとう", meaning: "Cơm hộp" },
    { word: "スキー", reading: "スキー", meaning: "Trượt tuyết" },
  ],
  grammar: [
    {
      title: "Phủ định Vません",
      challengeLabel: "チャレンジ 1",
      pattern: "Vます → Vません ／ N を Vません",
      meaningVi: "Không làm / Không làm gì với N",
      usage: "Đổi ます thành ません. たべます → たべません.",
      examples: [
        { segments: [{ text: "こうえんへ いきません。" }], vi: "Không đi công viên." },
        { segments: [{ text: "くにへ かえりません。" }], vi: "Không về nước." },
        { segments: [{ text: "ごはんを たべません。" }], vi: "Không ăn cơm." },
        { segments: [{ text: "おさけを のみません。" }], vi: "Không uống rượu." },
      ],
      drills: [
        {
          labelVi: "Phủ định — không ăn cơm",
          modelJa: "ごはんをたべません。",
          segments: [{ text: "ごはんを たべません。" }],
        },
        {
          labelVi: "Phủ định — không về",
          modelJa: "くにへかえりません。",
          segments: [{ text: "くにへ かえりません。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "ごはんを たべません。" }] },
          choices: ["Không ăn cơm", "Ăn cơm", "Mua cơm", "Ăn cơm ở đâu"],
          answer: 0,
        },
      ],
    },
    {
      title: "Làm gì ở đâu",
      challengeLabel: "チャレンジ 2",
      pattern: "場所で N を Vます",
      meaningVi: "Làm N ở địa điểm",
      usage: "で đánh dấu nơi diễn ra hành động. こうえんで おべんとうを たべます.",
      examples: [
        { segments: [{ text: "こうえんで おべんとうを たべます。" }], vi: "Ăn cơm hộp ở công viên." },
        { segments: [{ text: "ほっかいどうで スキーを します。" }], vi: "Trượt tuyết ở Hokkaido." },
        { segments: [{ text: "きっさてんで コーヒーを のみます。" }], vi: "Uống cà phê ở quán cà phê." },
      ],
      drills: [
        {
          labelVi: "Ăn ở công viên",
          modelJa: "こうえんでおべんとうをたべます。",
          segments: [{ text: "こうえんで おべんとうを たべます。" }],
        },
        {
          labelVi: "Uống cà phê ở quán",
          modelJa: "きっさてんでコーヒーをのみます。",
          segments: [{ text: "きっさてんで コーヒーを のみます。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "こうえんで おべんとうを たべます。" }] },
          choices: ["Ăn cơm hộp ở công viên", "Mua cơm hộp ở công viên", "Không ăn ở công viên", "Đi công viên"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Phủ định và kế hoạch",
      situationVi: "Hỏi có về nước không và kế hoạch du lịch.",
      lines: [
        { speaker: "A", segments: [{ text: "くにへ かえりますか。" }], vi: "Bạn về nước không?" },
        { speaker: "B", segments: [{ text: "いいえ、かえりません。" }], vi: "Không, tôi không về." },
        { speaker: "A", segments: [{ text: "なにを しますか。" }], vi: "Vậy làm gì?" },
        {
          speaker: "B",
          segments: [{ text: "ほっかいどうへ いきます。" }, { text: "ほっかいどうで スキーを します。" }],
          vi: "Đi Hokkaido. Trượt tuyết ở Hokkaido.",
        },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Phủ định và địa điểm",
    instructionVi: "Nói một việc không làm (ません) và một việc làm ở địa điểm (で).",
    promptJapanese: "___へ いきません。\n___で ___を ___ます。",
    expectedPattern: "ません|で|を",
  },
  speakingPrompt: "Dùng Vません và 場所で N を Vます.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Phủ định — không về",
      guideVi: "くにへ かえりません。",
      modelJa: "くにへかえりません。",
      aiReply: "かえりません。",
      acceptPattern: "ません",
      hintVi: "Động từ + ません.",
    },
    {
      id: 2,
      taskVi: "Hỏi có về không",
      guideVi: "くにへ かえりますか。",
      modelJa: "くにへかえりますか。",
      aiReply: "かえりますか。",
      acceptPattern: "ますか",
      hintVi: "Hỏi có/không.",
    },
    {
      id: 3,
      taskVi: "Đi Hokkaido",
      guideVi: "ほっかいどうへ いきます。",
      modelJa: "ほっかいどうへいきます。",
      aiReply: "いきます。",
      acceptPattern: "へ.*いきます",
      hintVi: "Địa điểm + へ いきます.",
    },
    {
      id: 4,
      taskVi: "Trượt tuyết ở Hokkaido",
      guideVi: "ほっかいどうで スキーを します。",
      modelJa: "ほっかいどうでスキーをします。",
      aiReply: "で スキーを します。",
      acceptPattern: "で.*します",
      praiseVi: "Hoàn thành!",
      hintVi: "場所 + で + N を Vます.",
    },
  ],
};
