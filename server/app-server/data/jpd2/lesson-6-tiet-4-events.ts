import type { Jpd2LessonSeed } from "./types.js";

/** Bài 6 · Tiết 4 — Sự kiện và số lượng */
export const lesson6Tiet4Events: Jpd2LessonSeed = {
  orderIndex: 12,
  slug: "bai-6-tiet-4-su-kien-va-so-luong",
  title: "Tiết 4 — Sự kiện và số lượng",
  description: "Place で N が あります · trợ số từ まい・ほん・つ — sự kiện và số lượng — Bài 6, Tiết 4.",
  objective: "Nói ở đâu có sự kiện gì, và dùng trợ số từ cơ bản.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "かいしゃ", reading: "かいしゃ", meaning: "công ty" },
    { word: "かいぎ", reading: "かいぎ", meaning: "cuộc họp" },
    { word: "コンサート", reading: "コンサート", meaning: "buổi hòa nhạc" },
    { word: "チケット", reading: "チケット", meaning: "vé" },
    { word: "かさ", reading: "かさ", meaning: "ô / dù" },
    { word: "ケーキ", reading: "ケーキ", meaning: "bánh" },
    { word: "まい", reading: "まい", meaning: "~ tấm / tờ (trợ số)" },
    { word: "ほん", reading: "ほん", meaning: "~ cây / cái dài (trợ số)" },
    { word: "つ", reading: "つ", meaning: "số lượng chung (trợ số)" },
    { word: "かいます", reading: "かいます", meaning: "mua" },
    { word: "あります", reading: "あります", meaning: "có" },
    { word: "あした", reading: "あした", meaning: "ngày mai" },
    { word: "あそこ", reading: "あそこ", meaning: "đằng kia" },
    { word: "いつ", reading: "いつ", meaning: "khi nào" },
  ],
  grammar: [
    {
      title: "Ở đâu có sự kiện",
      challengeLabel: "チャレンジ 1",
      pattern: "Place で N が あります",
      meaningVi: "Ở địa điểm có N / diễn ra N",
      examples: [
        { segments: [{ text: "あした 会社で 会議が あります。" }], vi: "Ngày mai ở công ty có cuộc họp." },
        { segments: [{ text: "こんしゅう コンサートが あります。" }], vi: "Tuần này có buổi hòa nhạc." },
      ],
      drills: [
        {
          labelVi: "Ngày mai có họp",
          modelJa: "あした会社で会議があります。",
          segments: [{ text: "あした 会社で 会議が あります。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "あした 会社で 会議が あります。" }] },
          choices: ["Ngày mai ở công ty có cuộc họp", "Hôm qua đã họp", "Không có họp", "Muốn đi họp"],
          answer: 0,
        },
      ],
    },
    {
      title: "Làm gì với số lượng N",
      challengeLabel: "チャレンジ 2",
      pattern: "N を số lượng Vます",
      meaningVi: "Làm gì với số lượng N",
      usage: "まい = tấm/tờ (vé, giấy). ほん/ぼん/ぽん = cây/cái dài (ô, bút). つ = số lượng chung.",
      examples: [
        { segments: [{ text: "コンサートのチケットを 買いました。" }], vi: "Đã mua vé hòa nhạc." },
        { segments: [{ text: "チケットを 2まい 買いました。" }], vi: "Đã mua 2 vé." },
        { segments: [{ text: "ケーキを 五つ 買います。" }], vi: "Mua 5 cái bánh." },
      ],
      drills: [
        {
          labelVi: "Mua 2 vé",
          modelJa: "チケットを2まい買いました。",
          segments: [{ text: "チケットを 2まい 買いました。" }],
        },
        {
          labelVi: "Mua 5 bánh",
          modelJa: "ケーキを五つ買います。",
          segments: [{ text: "ケーキを 五つ 買います。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "チケットを 2まい 買いました。" }] },
          choices: ["Đã mua 2 vé", "Có 2 vé", "Muốn mua vé", "Không mua vé"],
          answer: 0,
        },
      ],
    },
    {
      title: "Có số lượng N",
      challengeLabel: "チャレンジ 3",
      pattern: "N が số lượng あります",
      meaningVi: "Có số lượng N",
      examples: [
        { segments: [{ text: "あそこに 傘が 5本 あります。" }], vi: "Ở đằng kia có 5 cái ô." },
        { segments: [{ text: "チケットが 2まい あります。" }], vi: "Có 2 vé." },
      ],
      drills: [
        {
          labelVi: "Có 5 cái ô",
          modelJa: "あそこに傘が5本あります。",
          segments: [{ text: "あそこに 傘が 5本 あります。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Cuộc họp ngày mai",
      situationVi: "Nói về cuộc họp ở công ty.",
      lines: [
        { speaker: "A", segments: [{ text: "あした なにを しますか。" }], vi: "Ngày mai làm gì?" },
        { speaker: "B", segments: [{ text: "あした 会社で 会議が あります。" }], vi: "Ngày mai ở công ty có cuộc họp." },
        { speaker: "A", segments: [{ text: "そうですか。" }], vi: "Thế à." },
      ],
    },
    {
      title: "Mua vé hòa nhạc",
      situationVi: "Kể đã mua vé concert.",
      lines: [
        { speaker: "A", segments: [{ text: "コンサートのチケットを 買いましたか。" }], vi: "Đã mua vé hòa nhạc chưa?" },
        { speaker: "B", segments: [{ text: "はい、2まい 買いました。" }], vi: "Rồi, mua 2 vé." },
      ],
    },
    {
      title: "Có ô ở đằng kia",
      situationVi: "Chỉ số lượng đồ vật.",
      lines: [
        { speaker: "A", segments: [{ text: "あそこに なにが ありますか。" }], vi: "Ở đằng kia có gì?" },
        { speaker: "B", segments: [{ text: "傘が 5本 あります。" }], vi: "Có 5 cái ô." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Sự kiện & số lượng",
    instructionVi: "Nói có sự kiện ở đâu và số lượng đồ vật.",
    promptJapanese: "あした ___で ___が あります。\nチケットを ___まい 買いました。",
    expectedPattern: "あります|まい|本|つ",
  },
  speakingPrompt: "Place で N が あります · N を 2まい 買いました · N が 5本 あります.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Có cuộc họp",
      guideVi: "あした 会社で 会議が あります。",
      modelJa: "あした会社で会議があります。",
      aiReply: "あります。",
      acceptPattern: "会議|あります",
    },
    {
      id: 2,
      taskVi: "Mua 2 vé",
      guideVi: "チケットを 2まい 買いました。",
      modelJa: "チケットを2まい買いました。",
      aiReply: "買いました。",
      acceptPattern: "まい|買いました",
    },
    {
      id: 3,
      taskVi: "Có 5 cái ô",
      guideVi: "あそこに 傘が 5本 あります。",
      modelJa: "あそこに傘が5本あります。",
      aiReply: "あります。",
      acceptPattern: "本|あります",
      praiseVi: "Hoàn thành!",
    },
  ],
};
