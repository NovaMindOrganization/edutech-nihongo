import type { Jpd2LessonSeed } from "./types.js";

/** Bài 6 · Tiết 2 — Đồng ý và cùng làm */
export const lesson6Tiet2Agree: Jpd2LessonSeed = {
  orderIndex: 10,
  slug: "bai-6-tiet-2-dong-y-va-cung-lam",
  title: "Tiết 2 — Đồng ý và cùng làm",
  description: "Vましょう · いいですね — đồng ý lời mời và đáp lại tự nhiên — Bài 6, Tiết 2.",
  objective: "Đồng ý lời mời và đáp lại tự nhiên bằng Vましょう.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "こんばん", reading: "こんばん", meaning: "tối nay" },
    { word: "どようび", reading: "どようび", meaning: "thứ Bảy" },
    { word: "テニス", reading: "テニス", meaning: "tennis" },
    { word: "カラオケ", reading: "カラオケ", meaning: "karaoke" },
    { word: "りょうり", reading: "りょうり", meaning: "nấu ăn / món ăn" },
    { word: "そうじします", reading: "そうじします", meaning: "dọn dẹp" },
    { word: "いいですね", reading: "いいですね", meaning: "hay đấy" },
    { word: "しましょう", reading: "しましょう", meaning: "cùng làm nào" },
    { word: "行きましょう", reading: "いきましょう", meaning: "cùng đi nào" },
    { word: "こうえん", reading: "こうえん", meaning: "công viên" },
    { word: "べんきょうします", reading: "べんきょうします", meaning: "học" },
    { word: "いっしょに", reading: "いっしょに", meaning: "cùng nhau" },
  ],
  grammar: [
    {
      title: "Nào cùng V",
      challengeLabel: "チャレンジ 1",
      pattern: "Vましょう",
      meaningVi: "Nào cùng V",
      usage: "Vます → bỏ ます + ましょう. 行きます → 行きましょう.",
      examples: [
        { segments: [{ text: "行きましょう。" }], vi: "Cùng đi nào." },
        { segments: [{ text: "いっしょに しましょう。" }], vi: "Cùng làm nào." },
        { segments: [{ text: "テニスを しましょう。" }], vi: "Cùng chơi tennis nào." },
      ],
      drills: [
        {
          labelVi: "Cùng đi nào",
          modelJa: "行きましょう。",
          segments: [{ text: "行きましょう。" }],
        },
        {
          labelVi: "Cùng làm nào",
          modelJa: "いっしょにしましょう。",
          segments: [{ text: "いっしょに しましょう。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "行きましょう。" }] },
          choices: ["Cùng đi nào", "Đã đi rồi", "Muốn đi", "Không đi"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hay đấy. Cùng V nhé",
      challengeLabel: "チャレンジ 2",
      pattern: "いいですね。Vましょう",
      meaningVi: "Hay đấy. Cùng V nhé",
      examples: [
        {
          segments: [{ text: "いいですね。いっしょに しましょう。" }],
          vi: "Hay đấy. Cùng làm nào.",
        },
        {
          segments: [{ text: "いいですね。行きましょう。" }],
          vi: "Hay đấy. Cùng đi nào.",
        },
        { segments: [{ text: "ええ、いいですね。" }], vi: "Ừ, hay đấy." },
      ],
      drills: [
        {
          labelVi: "Đồng ý chơi tennis",
          modelJa: "いいですね。いっしょにしましょう。",
          segments: [{ text: "いいですね。いっしょに しましょう。" }],
        },
        {
          labelVi: "Đồng ý đi karaoke",
          modelJa: "いいですね。行きましょう。",
          segments: [{ text: "いいですね。行きましょう。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "いいですね。行きましょう。" }] },
          choices: ["Hay đấy. Cùng đi nào", "Không đi", "Đã đi rồi", "Muốn đi một mình"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Chơi tennis tối nay",
      situationVi: "Rủ chơi tennis và đồng ý.",
      lines: [
        { speaker: "A", segments: [{ text: "こんばん、いっしょに テニスを しませんか。" }], vi: "Tối nay chơi tennis cùng tôi không?" },
        { speaker: "B", segments: [{ text: "いいですね。いっしょに しましょう。" }], vi: "Hay đấy. Cùng chơi nào." },
      ],
    },
    {
      title: "Đi karaoke thứ Bảy",
      situationVi: "Rủ đi karaoke thứ Bảy.",
      lines: [
        { speaker: "A", segments: [{ text: "どようび、いっしょに カラオケに 行きませんか。" }], vi: "Thứ Bảy đi karaoke cùng tôi không?" },
        { speaker: "B", segments: [{ text: "いいですね。いっしょに 行きましょう。" }], vi: "Hay đấy. Cùng đi nào." },
      ],
    },
    {
      title: "Đi công viên",
      situationVi: "Rủ Mary đi công viên.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "マリーさん、いっしょに こうえんへ 行きませんか。" }],
          vi: "Mary, đi công viên cùng tôi không?",
        },
        { speaker: "B", segments: [{ text: "いいですね。行きましょう。" }], vi: "Hay đấy. Cùng đi nào." },
      ],
    },
    {
      title: "Học cùng",
      situationVi: "Rủ học và đồng ý ngắn gọn.",
      lines: [
        { speaker: "A", segments: [{ text: "いっしょに べんきょうしませんか。" }], vi: "Học cùng tôi không?" },
        { speaker: "B", segments: [{ text: "ええ、いいですね。" }], vi: "Ừ, hay đấy." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Đồng ý",
    instructionVi: "Đồng ý lời mời bằng いいですね。Vましょう.",
    promptJapanese: "いっしょに ___ませんか。\nいいですね。___ましょう。",
    expectedPattern: "いいですね|ましょう",
  },
  speakingPrompt: "いいですね · Vましょう · いっしょに しましょう.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Đồng ý chơi tennis",
      guideVi: "いいですね。いっしょに しましょう。",
      modelJa: "いいですね。いっしょにしましょう。",
      aiReply: "しましょう。",
      acceptPattern: "しましょう|いいですね",
    },
    {
      id: 2,
      taskVi: "Đồng ý đi karaoke",
      guideVi: "いいですね。行きましょう。",
      modelJa: "いいですね。行きましょう。",
      aiReply: "行きましょう。",
      acceptPattern: "行きましょう|いきましょう",
    },
    {
      id: 3,
      taskVi: "Đồng ý ngắn",
      guideVi: "ええ、いいですね。",
      modelJa: "ええ、いいですね。",
      aiReply: "いいですね。",
      acceptPattern: "いいですね",
      praiseVi: "Hoàn thành!",
    },
  ],
};
