import type { Jpd2LessonSeed } from "./types.js";

/** Bài 6 · Tiết 1 — Rủ rê, mời mọc */
export const lesson6Tiet1Invite: Jpd2LessonSeed = {
  orderIndex: 9,
  slug: "bai-6-tiet-1-ru-re-moi-moc",
  title: "Tiết 1 — Rủ rê, mời mọc",
  description: "いっしょに Vませんか — rủ người khác cùng làm một việc — Bài 6, Tiết 1.",
  objective: "Rủ người khác cùng làm một việc bằng いっしょに Vませんか.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "こんしゅう", reading: "こんしゅう", meaning: "tuần này" },
    { word: "せんしゅう", reading: "せんしゅう", meaning: "tuần trước" },
    { word: "らいしゅう", reading: "らいしゅう", meaning: "tuần tới" },
    { word: "こんげつ", reading: "こんげつ", meaning: "tháng này" },
    { word: "せんげつ", reading: "せんげつ", meaning: "tháng trước" },
    { word: "らいげつ", reading: "らいげつ", meaning: "tháng sau" },
    { word: "カラオケ", reading: "カラオケ", meaning: "karaoke" },
    { word: "コンサート", reading: "コンサート", meaning: "buổi hòa nhạc" },
    { word: "しあい", reading: "しあい", meaning: "trận đấu" },
    { word: "セール", reading: "セール", meaning: "sale / giảm giá" },
    { word: "チケット", reading: "チケット", meaning: "vé" },
    { word: "ちず", reading: "ちず", meaning: "bản đồ" },
    { word: "ドライブ", reading: "ドライブ", meaning: "lái xe / đi chơi bằng xe" },
    { word: "みずぎ", reading: "みずぎ", meaning: "đồ bơi" },
    { word: "やきゅう", reading: "やきゅう", meaning: "bóng chày" },
    { word: "いっしょに", reading: "いっしょに", meaning: "cùng nhau" },
    { word: "いいですね", reading: "いいですね", meaning: "hay đấy / được đấy" },
    { word: "こうえん", reading: "こうえん", meaning: "công viên" },
    { word: "べんきょうします", reading: "べんきょうします", meaning: "học" },
    { word: "りょうり", reading: "りょうり", meaning: "nấu ăn / món ăn" },
    { word: "サッカー", reading: "サッカー", meaning: "bóng đá" },
    { word: "へや", reading: "へや", meaning: "phòng" },
    { word: "そうじします", reading: "そうじします", meaning: "dọn dẹp" },
  ],
  grammar: [
    {
      title: "Rủ cùng làm V",
      challengeLabel: "チャレンジ 1",
      pattern: "いっしょに Vませんか",
      meaningVi: "Làm V cùng tôi không?",
      usage: "Vませんか = mời / rủ. Thêm いっしょに = cùng nhau.",
      examples: [
        { segments: [{ text: "いっしょに べんきょうしませんか。" }], vi: "Học cùng tôi không?" },
        { segments: [{ text: "いっしょに サッカーを しませんか。" }], vi: "Cùng chơi bóng đá không?" },
        { segments: [{ text: "いっしょに へやを そうじしませんか。" }], vi: "Cùng dọn phòng không?" },
      ],
      drills: [
        {
          labelVi: "Học cùng nhau",
          modelJa: "いっしょにべんきょうしませんか。",
          segments: [{ text: "いっしょに べんきょうしませんか。" }],
        },
        {
          labelVi: "Cùng chơi bóng đá",
          modelJa: "いっしょにサッカーをしませんか。",
          segments: [{ text: "いっしょに サッカーを しませんか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "いっしょに べんきょうしませんか。" }] },
          choices: ["Học cùng tôi không?", "Đã học cùng nhau", "Muốn học", "Đang học"],
          answer: 0,
        },
      ],
    },
    {
      title: "Rủ đi đến N",
      challengeLabel: "チャレンジ 2",
      pattern: "いっしょに Nへ 行きませんか",
      meaningVi: "Đi đến N cùng tôi không?",
      examples: [
        {
          segments: [{ text: "マリーさん、いっしょに こうえんへ 行きませんか。" }],
          vi: "Mary, đi công viên cùng tôi không?",
        },
        {
          segments: [{ text: "いっしょに カラオケに 行きませんか。" }],
          vi: "Đi karaoke cùng tôi không?",
        },
      ],
      drills: [
        {
          labelVi: "Đi công viên",
          modelJa: "いっしょにこうえんへ行きませんか。",
          segments: [{ text: "いっしょに こうえんへ 行きませんか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "いっしょに こうえんへ 行きませんか。" }] },
          choices: ["Đi công viên cùng tôi không?", "Đã đi công viên", "Muốn đi công viên", "Không đi công viên"],
          answer: 0,
        },
      ],
    },
    {
      title: "Rủ cùng làm với N",
      challengeLabel: "チャレンジ 3",
      pattern: "いっしょに Nを Vませんか",
      meaningVi: "Cùng làm gì đó với N không?",
      examples: [
        { segments: [{ text: "いっしょに 料理を つくりませんか。" }], vi: "Cùng nấu ăn không?" },
        { segments: [{ text: "いっしょに サッカーを しませんか。" }], vi: "Cùng chơi bóng đá không?" },
      ],
      drills: [
        {
          labelVi: "Cùng nấu ăn",
          modelJa: "いっしょに料理をつくりませんか。",
          segments: [{ text: "いっしょに 料理を つくりませんか。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Rủ học cùng",
      situationVi: "Rủ bạn học cùng nhau.",
      lines: [
        { speaker: "A", segments: [{ text: "いっしょに べんきょうしませんか。" }], vi: "Học cùng tôi không?" },
        { speaker: "B", segments: [{ text: "いいですね。" }], vi: "Hay đấy." },
      ],
    },
    {
      title: "Rủ đi công viên",
      situationVi: "Rủ Mary đi công viên.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "マリーさん、いっしょに こうえんへ 行きませんか。" }],
          vi: "Mary, đi công viên cùng tôi không?",
        },
        { speaker: "B", segments: [{ text: "いいですね。" }], vi: "Hay đấy." },
      ],
    },
    {
      title: "Rủ nấu ăn",
      situationVi: "Rủ cùng nấu ăn.",
      lines: [
        { speaker: "A", segments: [{ text: "いっしょに 料理を つくりませんか。" }], vi: "Cùng nấu ăn không?" },
        { speaker: "B", segments: [{ text: "いいですね。" }], vi: "Hay đấy." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Rủ rê",
    instructionVi: "Rủ bạn cùng làm một việc bằng いっしょに Vませんか.",
    promptJapanese: "いっしょに ___ませんか。\nいいですね。",
    expectedPattern: "いっしょに|しませんか|行きませんか",
  },
  speakingPrompt: "いっしょに Vませんか · Nへ 行きませんか · Nを Vませんか.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Rủ học cùng",
      guideVi: "いっしょに べんきょうしませんか。",
      modelJa: "いっしょにべんきょうしませんか。",
      aiReply: "しませんか。",
      acceptPattern: "しませんか|べんきょう",
    },
    {
      id: 2,
      taskVi: "Rủ đi công viên",
      guideVi: "いっしょに こうえんへ 行きませんか。",
      modelJa: "いっしょにこうえんへ行きませんか。",
      aiReply: "行きませんか。",
      acceptPattern: "行きませんか|いきませんか",
    },
    {
      id: 3,
      taskVi: "Rủ nấu ăn",
      guideVi: "いっしょに 料理を つくりませんか。",
      modelJa: "いっしょに料理をつくりませんか。",
      aiReply: "つくりませんか。",
      acceptPattern: "つくりませんか|しませんか",
      praiseVi: "Hoàn thành!",
    },
  ],
};
