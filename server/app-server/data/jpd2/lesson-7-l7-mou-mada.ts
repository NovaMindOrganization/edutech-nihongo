import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 7 — もう / まだ */
export const lesson7L7MouMada: Jpd2LessonSeed = {
  orderIndex: 22,
  slug: "bai-7-l8-mou-mada",
  title: "Tiết 8 — Trạng thái hành động: Đã và Chưa",
  description: "もう Vましたか / まだ です — phân biệt đã và chưa — Bài 7, Tiết 8.",
  objective: "Phân biệt cách dùng もう và まだ trong câu hỏi và trả lời.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "もう", reading: "もう", meaning: "đã / rồi" },
    { word: "まだ", reading: "まだ", meaning: "vẫn chưa" },
    { word: "宿題", reading: "しゅくだい", meaning: "bài tập về nhà" },
    { word: "漢字", reading: "かんじ", meaning: "hán tự" },
    { word: "わかります", reading: "わかります", meaning: "hiểu, biết" },
    { word: "ひるごはん", reading: "ひるごはん", meaning: "bữa trưa" },
    { word: "たくさん", reading: "たくさん", meaning: "nhiều" },
    { word: "使います", reading: "つかいます", meaning: "dùng, sử dụng" },
    { word: "歌を歌います", reading: "うたをうたいます", meaning: "hát" },
    { word: "ギターを弾きます", reading: "ぎたーをひきます", meaning: "chơi đàn guitar" },
    { word: "電話をかけます", reading: "でんわをかけます", meaning: "gọi điện thoại" },
  ],
  grammar: [
    {
      title: "Đã làm V chưa?",
      challengeLabel: "チャレンジ 1",
      pattern: "もう Vましたか",
      meaningVi: "Đã làm V chưa?",
      examples: [
        { segments: [{ text: "もう 宿題を しましたか。" }], vi: "Đã làm bài tập chưa?" },
        { segments: [{ text: "もう 昼ごはんを 食べましたか。" }], vi: "Bạn đã ăn trưa chưa?" },
        { segments: [{ text: "はい、もう しました。" }], vi: "Rồi, đã làm rồi." },
      ],
      drills: [
        {
          labelVi: "Đã làm bài tập chưa",
          modelJa: "もう宿題をしましたか。",
          segments: [{ text: "もう 宿題を しましたか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "もう 昼ごはんを 食べましたか。" }] },
          choices: ["Đã ăn trưa chưa?", "Đang ăn trưa", "Muốn ăn trưa", "Chưa ăn trưa"],
          answer: 0,
        },
      ],
    },
    {
      title: "Vẫn chưa",
      challengeLabel: "チャレンジ 2",
      pattern: "いいえ、まだ です",
      meaningVi: "Không, vẫn chưa",
      examples: [
        { segments: [{ text: "もう 宿題を しましたか。" }], vi: "Đã làm bài tập chưa?" },
        { segments: [{ text: "いいえ、まだ です。" }], vi: "Chưa, vẫn chưa." },
      ],
      drills: [
        {
          labelVi: "Vẫn chưa",
          modelJa: "いいえ、まだです。",
          segments: [{ text: "いいえ、まだ です。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "いいえ、まだ です。" }] },
          choices: ["Chưa, vẫn chưa", "Rồi, đã xong", "Đang làm", "Không muốn làm"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hiểu / biết cái gì",
      challengeLabel: "チャレンジ 3",
      pattern: "N は N が わかります",
      meaningVi: "Hiểu / biết cái gì",
      examples: [
        { segments: [{ text: "わたしは 漢字が わかります。" }], vi: "Tôi hiểu chữ Hán." },
        { segments: [{ text: "わたしは 漢字が あまり わかりません。" }], vi: "Tôi không hiểu chữ Hán lắm." },
      ],
      drills: [
        {
          labelVi: "Hiểu kanji",
          modelJa: "漢字がわかります。",
          segments: [{ text: "漢字が わかります。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "あります / います — 犬が ___。" }] },
          choices: ["います", "あります", "します", "きます"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Bài tập về nhà",
      situationVi: "Hỏi đã làm bài tập chưa.",
      lines: [
        { speaker: "A", segments: [{ text: "もう 宿題を しましたか。" }], vi: "Đã làm bài tập chưa?" },
        { speaker: "B", segments: [{ text: "いいえ、まだ です。" }], vi: "Chưa, vẫn chưa." },
      ],
    },
    {
      title: "Ăn trưa chưa",
      situationVi: "Ở nhà bạn, hỏi đã ăn trưa.",
      lines: [
        { speaker: "A", segments: [{ text: "もう 昼ごはんを 食べましたか。" }], vi: "Đã ăn trưa chưa?" },
        { speaker: "B", segments: [{ text: "いいえ、まだ です。" }], vi: "Chưa." },
        { speaker: "A", segments: [{ text: "じゃ、いっしょに 食べましょう。" }], vi: "Vậy cùng ăn nhé." },
      ],
    },
    {
      title: "Hiểu kanji",
      situationVi: "Hỏi có hiểu kanji không.",
      lines: [
        { speaker: "A", segments: [{ text: "漢字が わかりますか。" }], vi: "Bạn hiểu kanji không?" },
        { speaker: "B", segments: [{ text: "はい、たくさん わかります。" }], vi: "Vâng, hiểu nhiều." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Tại nhà bạn",
    instructionVi:
      "Hoàn thành hội thoại tại nhà bạn: hỏi vị trí đồ, nhờ giúp, hỏi đã/chưa.",
    promptJapanese:
      "A：塩は どこに ありますか。\nB：___の 上に あります。\nA：お皿を 取って ください。\nB：どの皿ですか。\nA：___を コピーしましょうか。\nB：すみません、おねがいします。\nA：もう 昼ごはんを 食べましたか。\nB：いいえ、___ です。",
    expectedPattern: "上に|取って|ましょうか|まだ|あります",
  },
  speakingPrompt: "もう Vましたか · まだ です · わかります · あります/います.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Đã làm bài tập chưa",
      guideVi: "もう 宿題を しましたか。",
      modelJa: "もう宿題をしましたか。",
      aiReply: "しましたか。",
      acceptPattern: "もう|しましたか",
    },
    {
      id: 2,
      taskVi: "Vẫn chưa",
      guideVi: "いいえ、まだ です。",
      modelJa: "いいえ、まだです。",
      aiReply: "まだです。",
      acceptPattern: "まだ",
    },
    {
      id: 3,
      taskVi: "Hiểu kanji",
      guideVi: "漢字が わかります。",
      modelJa: "漢字がわかります。",
      aiReply: "わかります。",
      acceptPattern: "わかります|漢字",
      praiseVi: "Hoàn thành Bài 7!",
    },
  ],
};
