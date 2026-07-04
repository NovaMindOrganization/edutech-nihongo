import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 6 — Vましょうか */
export const lesson7L6MashouKa: Jpd2LessonSeed = {
  orderIndex: 21,
  slug: "bai-7-l7-v-mashou-ka",
  title: "Tiết 7 — Đề nghị giúp đỡ",
  description: "Vましょうか — đề nghị giúp đỡ người khác — Bài 7, Tiết 7.",
  objective: "Đề nghị giúp đỡ người khác và biết cách đáp lại (đồng ý).",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "手伝います", reading: "てつだいます", meaning: "giúp đỡ" },
    { word: "教えます", reading: "おしえます", meaning: "dạy, chỉ bảo" },
    { word: "持って行きます", reading: "もっていきます", meaning: "mang đi" },
    { word: "入れます", reading: "いれます", meaning: "cho vào, bỏ vào" },
    { word: "出します", reading: "だします", meaning: "lấy ra, nộp" },
    { word: "貸します", reading: "かします", meaning: "cho mượn" },
    { word: "荷物", reading: "にもつ", meaning: "hành lý" },
    { word: "しゃしん", reading: "しゃしん", meaning: "ảnh" },
    { word: "コピー", reading: "コピー", meaning: "bản sao / copy" },
    { word: "おねがいします", reading: "おねがいします", meaning: "xin nhờ / làm ơn" },
    { word: "もしもし", reading: "もしもし", meaning: "alo (điện thoại)" },
    { word: "迎えに行きます", reading: "むかえにいきます", meaning: "đi đón" },
  ],
  grammar: [
    {
      title: "Để tôi làm V giúp nhé?",
      challengeLabel: "チャレンジ 1",
      pattern: "Vましょうか",
      meaningVi: "Tôi làm V giúp bạn nhé?",
      usage: "Vます → bỏ ます + ましょうか. 取ります → 取りましょうか.",
      examples: [
        { segments: [{ text: "しゃしんを とりましょうか。" }], vi: "Để tôi chụp ảnh giúp bạn nhé?" },
        { segments: [{ text: "荷物を 持ちましょうか。" }], vi: "Để tôi mang hành lý giúp nhé?" },
        { segments: [{ text: "これを コピーしましょうか。" }], vi: "Để tôi copy cái này giúp anh/chị nhé?" },
      ],
      drills: [
        {
          labelVi: "Chụp ảnh giúp",
          modelJa: "しゃしんをとりましょうか。",
          segments: [{ text: "しゃしんを とりましょうか。" }],
        },
        {
          labelVi: "Mang hành lý",
          modelJa: "荷物を持ちましょうか。",
          segments: [{ text: "荷物を 持ちましょうか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "しゃしんを とりましょうか。" }] },
          choices: ["Để tôi chụp ảnh giúp nhé?", "Chụp ảnh cùng tôi không?", "Đã chụp ảnh", "Muốn chụp ảnh"],
          answer: 0,
        },
      ],
    },
    {
      title: "Đáp lại lời giúp",
      challengeLabel: "チャレンジ 2",
      pattern: "すみません、おねがいします",
      meaningVi: "Xin lỗi, phiền anh/chị giúp cho",
      examples: [
        { segments: [{ text: "すみません、おねがいします。" }], vi: "Xin lỗi, phiền anh/chị giúp cho." },
        { segments: [{ text: "いいえ、けっこうです。" }], vi: "Không, không cần đâu." },
      ],
      drills: [
        {
          labelVi: "Nhờ giúp",
          modelJa: "すみません、おねがいします。",
          segments: [{ text: "すみません、おねがいします。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Giúp copy",
      situationVi: "Đề nghị giúp đỡ tại văn phòng.",
      lines: [
        { speaker: "A", segments: [{ text: "これを コピーしましょうか。" }], vi: "Để tôi copy cái này giúp anh/chị nhé?" },
        { speaker: "B", segments: [{ text: "すみません、おねがいします。" }], vi: "Xin lỗi, phiền anh/chị giúp cho." },
      ],
    },
    {
      title: "Chụp ảnh",
      situationVi: "Đề nghị chụp ảnh cho bạn.",
      lines: [
        { speaker: "A", segments: [{ text: "しゃしんを とりましょうか。" }], vi: "Để tôi chụp ảnh giúp bạn nhé?" },
        { speaker: "B", segments: [{ text: "すみません、おねがいします。" }], vi: "Xin lỗi, phiền bạn." },
        { speaker: "A", segments: [{ text: "はい。" }], vi: "Vâng." },
      ],
    },
    {
      title: "Đi đón",
      situationVi: "Gọi điện đề nghị đi đón.",
      lines: [
        { speaker: "A", segments: [{ text: "もしもし。" }], vi: "Alo." },
        { speaker: "B", segments: [{ text: "もしもし。むかえに 行きましょうか。" }], vi: "Alo. Để tôi đi đón nhé?" },
        { speaker: "A", segments: [{ text: "すみません、おねがいします。" }], vi: "Xin lỗi, phiền bạn." },
      ],
    },
  ],
  kanji: [],
  speakingPrompt: "Vましょうか · おねがいします · もしもし.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Đề nghị chụp ảnh",
      guideVi: "しゃしんを とりましょうか。",
      modelJa: "しゃしんをとりましょうか。",
      aiReply: "ましょうか。",
      acceptPattern: "とりましょうか|ましょうか",
    },
    {
      id: 2,
      taskVi: "Nhờ giúp",
      guideVi: "すみません、おねがいします。",
      modelJa: "すみません、おねがいします。",
      aiReply: "おねがいします。",
      acceptPattern: "おねがい",
      praiseVi: "Hoàn thành!",
    },
  ],
};
