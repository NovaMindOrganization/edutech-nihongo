import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 5 — Vてください */
export const lesson7L5TeKudasai: Jpd2LessonSeed = {
  orderIndex: 20,
  slug: "bai-7-l6-v-te-kudasai",
  title: "Tiết 6 — Sai khiến và Yêu cầu lịch sự",
  description: "Vてください — nhờ vả và yêu cầu lịch sự — Bài 7, Tiết 6.",
  objective: "Biết cách nhờ người khác làm việc gì đó một cách nhẹ nhàng.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "砂糖", reading: "さとう", meaning: "đường" },
    { word: "塩", reading: "しお", meaning: "muối" },
    { word: "しょうゆ", reading: "しょうゆ", meaning: "xì dầu, nước tương" },
    { word: "コップ", reading: "コップ", meaning: "cái cốc" },
    { word: "お皿", reading: "おさら", meaning: "cái đĩa" },
    { word: "スプーン", reading: "スプーン", meaning: "cái thìa" },
    { word: "フォーク", reading: "フォーク", meaning: "cái dĩa, nĩa" },
    { word: "ナイフ", reading: "ナイフ", meaning: "con dao" },
    { word: "箸", reading: "はし", meaning: "đũa" },
    { word: "取ります", reading: "とります", meaning: "cầm, lấy" },
    { word: "書きます", reading: "かきます", meaning: "viết" },
    { word: "どの", reading: "どの", meaning: "nào (trước danh từ)" },
    { word: "どれ", reading: "どれ", meaning: "cái nào" },
    { word: "名前", reading: "なまえ", meaning: "tên" },
    { word: "開けます", reading: "あけます", meaning: "mở (cửa)" },
    { word: "閉めます", reading: "しめます", meaning: "đóng (cửa)" },
  ],
  grammar: [
    {
      title: "Vui lòng làm V",
      challengeLabel: "チャレンジ 1",
      pattern: "Vてください",
      meaningVi: "Hãy / Vui lòng làm V...",
      usage: "Vます → Vて + ください. 取ります → 取ってください.",
      examples: [
        { segments: [{ text: "名前を かいて ください。" }], vi: "Vui lòng viết tên vào đây." },
        { segments: [{ text: "塩を 取って ください。" }], vi: "Hãy lấy hộ tôi lọ muối." },
        { segments: [{ text: "ドアを 開けて ください。" }], vi: "Vui lòng mở cửa." },
      ],
      drills: [
        {
          labelVi: "Viết tên",
          modelJa: "名前をかいてください。",
          segments: [{ text: "名前を かいて ください。" }],
        },
        {
          labelVi: "Lấy muối",
          modelJa: "塩を取ってください。",
          segments: [{ text: "塩を 取って ください。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "名前を かいて ください。" }] },
          choices: ["Vui lòng viết tên", "Đã viết tên", "Tên là gì?", "Không viết tên"],
          answer: 0,
        },
      ],
    },
    {
      title: "どの N / どれ",
      challengeLabel: "チャレンジ 2",
      pattern: "どの N を Vますか ／ どれですか",
      meaningVi: "N nào / Cái nào?",
      examples: [
        { segments: [{ text: "どの皿を 取りますか。" }], vi: "Bạn lấy cái đĩa nào?" },
        { segments: [{ text: "あの青い皿です。" }], vi: "Cái đĩa màu xanh kia." },
      ],
      drills: [
        {
          labelVi: "Cái đĩa nào",
          modelJa: "どの皿を取りますか。",
          segments: [{ text: "どの皿を 取りますか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "どの皿を 取りますか。" }] },
          choices: ["Bạn lấy cái đĩa nào?", "Đĩa ở đâu?", "Có bao nhiêu đĩa?", "Đĩa đẹp không?"],
          answer: 0,
        },
      ],
    },
    {
      title: "Mời dùng bữa",
      challengeLabel: "チャレンジ 3",
      pattern: "どうぞ、Vてください",
      meaningVi: "Mời anh/chị V...",
      examples: [
        { segments: [{ text: "あたらしい りょうりです。どうぞ、たべてください。" }], vi: "Đây là món mới. Mời ăn thử." },
        { segments: [{ text: "いただきます！" }], vi: "Tôi xin phép!" },
      ],
    },
  ],
  dialogues: [
    {
      title: "Nhờ lấy đĩa",
      situationVi: "Trong bữa ăn tại nhà bạn.",
      lines: [
        { speaker: "A", segments: [{ text: "お皿を 取ってください。" }], vi: "Lấy hộ tôi cái đĩa với." },
        { speaker: "B", segments: [{ text: "どの皿ですか。" }], vi: "Cái đĩa nào ạ?" },
        { speaker: "A", segments: [{ text: "あの青い皿です。" }], vi: "Cái đĩa màu xanh kia." },
      ],
    },
    {
      title: "Mời ăn thử",
      situationVi: "Chủ nhà mời dùng món mới.",
      lines: [
        { speaker: "A", segments: [{ text: "あたらしい りょうりです。どうぞ、たべてください。" }], vi: "Đây là món mới. Mời ăn thử." },
        { speaker: "B", segments: [{ text: "いただきます！おいしいですね。" }], vi: "Tôi xin phép! Ngon quá nhỉ." },
      ],
    },
    {
      title: "Viết tên",
      situationVi: "Nhờ viết tên vào sổ.",
      lines: [
        { speaker: "A", segments: [{ text: "名前を かいて ください。" }], vi: "Vui lòng viết tên." },
        { speaker: "B", segments: [{ text: "はい。" }], vi: "Vâng." },
      ],
    },
  ],
  kanji: [],
  speakingPrompt: "Vてください · どの N · どうぞ たべてください.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Nhờ lấy muối",
      guideVi: "塩を 取って ください。",
      modelJa: "塩を取ってください。",
      aiReply: "ください。",
      acceptPattern: "取って|とって|ください",
    },
    {
      id: 2,
      taskVi: "Hỏi đĩa nào",
      guideVi: "どの皿ですか。",
      modelJa: "どの皿ですか。",
      aiReply: "ですか。",
      acceptPattern: "どの|皿",
    },
    {
      id: 3,
      taskVi: "Mời ăn",
      guideVi: "どうぞ、たべてください。",
      modelJa: "どうぞ、たべてください。",
      aiReply: "ください。",
      acceptPattern: "たべて|ください",
      praiseVi: "Hoàn thành!",
    },
  ],
};
