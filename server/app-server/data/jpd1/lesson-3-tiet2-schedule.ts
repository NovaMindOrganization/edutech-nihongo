import type { Jpd1LessonSeed } from "./types.js";

/** Bài 3 · Tiết 2 */
export const lesson3Tiet2Schedule: Jpd1LessonSeed = {
  orderIndex: 10,
  slug: "bai-3-tiet-2-lich-hoat-dong-va-ngay-nghi",
  title: "ST2 — Lịch hoạt động và ngày nghỉ",
  description: "Hỏi giờ mở cửa, thời gian hoạt động và ngày nghỉ — Bài 3, Tiết 2.",
  objective: "Hỏi được thời gian hoạt động của địa điểm (から〜まで) và ngày nghỉ (やすみは いつ).",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "ぎんこう", reading: "ぎんこう", meaning: "Ngân hàng" },
    { word: "たいいくかん", reading: "たいいくかん", meaning: "Nhà thể chất" },
    { word: "としょかん", reading: "としょかん", meaning: "Thư viện" },
    { word: "びょういん", reading: "びょういん", meaning: "Bệnh viện" },
    { word: "ゆうびんきょく", reading: "ゆうびんきょく", meaning: "Bưu điện" },
    { word: "テスト", reading: "テスト", meaning: "Bài kiểm tra" },
    { word: "じゅぎょう", reading: "じゅぎょう", meaning: "Giờ học / tiết học" },
    { word: "やすみ", reading: "やすみ", meaning: "Nghỉ" },
    { word: "ひるやすみ", reading: "ひるやすみ", meaning: "Nghỉ trưa" },
    { word: "やすみ時間", reading: "やすみじかん", meaning: "Giờ nghỉ" },
    { word: "だいがく", reading: "だいがく", meaning: "Đại học" },
  ],
  grammar: [
    {
      title: "Giờ mở cửa",
      challengeLabel: "チャレンジ 1",
      pattern: "N は N1 から N2 までです",
      meaningVi: "N từ N1 đến N2",
      usage: "から = từ, まで = đến. Dùng với giờ mở cửa.",
      examples: [
        { segments: [{ text: "としょかんは はちじから ごじまでです。" }], vi: "Thư viện từ 8 giờ đến 5 giờ." },
        { segments: [{ text: "ぎんこうは くじから よじまでです。" }], vi: "Ngân hàng từ 9 giờ đến 4 giờ." },
      ],
      drills: [
        {
          labelVi: "Nói giờ thư viện",
          modelJa: "としょかんははちじからごじまでです。",
          segments: [{ text: "としょかんは はちじから ごじまでです。" }],
        },
        {
          labelVi: "Nói giờ ngân hàng",
          modelJa: "ぎんこうはくじからよじまでです。",
          segments: [{ text: "ぎんこうは くじから よじまでです。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "としょかんは はちじから ごじまでです。" }] },
          choices: ["Từ 8 giờ đến 5 giờ", "Từ 9 giờ đến 4 giờ", "Từ 8 giờ đến 4 giờ", "Từ 9 giờ đến 5 giờ"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi giờ hoạt động",
      challengeLabel: "チャレンジ 2",
      pattern: "N は なんじから なんじまでですか",
      meaningVi: "N từ mấy giờ đến mấy giờ?",
      usage: "Hỏi thời gian mở cửa hoặc hoạt động của địa điểm.",
      examples: [
        { segments: [{ text: "としょかんは なんじから なんじまでですか。" }], vi: "Thư viện mở từ mấy giờ đến mấy giờ?" },
        {
          segments: [{ text: "A：なんじから なんじまでですか。" }, { text: " B：くじから ごじまでです。" }],
          vi: "Mở từ mấy giờ đến mấy giờ? — Từ 9 giờ đến 5 giờ.",
        },
      ],
      drills: [
        {
          labelVi: "Hỏi giờ mở cửa",
          modelJa: "なんじからなんじまでですか。",
          segments: [{ text: "なんじから なんじまでですか。" }],
        },
        {
          labelVi: "Trả lời",
          modelJa: "くじからごじまでです。",
          segments: [{ text: "くじから ごじまでです。" }],
        },
      ],
    },
    {
      title: "Ngày nghỉ và thứ trong tuần",
      challengeLabel: "チャレンジ 3",
      pattern: "やすみは いつですか ／ N の やすみは ～ようびです",
      meaningVi: "Nghỉ khi nào? / Ngày nghỉ của N là thứ ~",
      usage: "いつ = khi nào. ～ようび = thứ ~. と nối hai ngày.",
      notes:
        "げつようび=Thứ Hai, かようび=Thứ Ba, すいようび=Thứ Tư, もくようび=Thứ Năm, きんようび=Thứ Sáu, どようび=Thứ Bảy, にちようび=Chủ nhật.",
      examples: [
        { segments: [{ text: "やすみは いつですか。" }], vi: "Nghỉ khi nào?" },
        { segments: [{ text: "げつようびです。" }], vi: "Thứ Hai." },
        { segments: [{ text: "だいがくの やすみは にちようびです。" }], vi: "Ngày nghỉ của trường là Chủ nhật." },
        { segments: [{ text: "ぎんこうの やすみは どようびと にちようびです。" }], vi: "Ngân hàng nghỉ thứ Bảy và Chủ nhật." },
      ],
      drills: [
        {
          labelVi: "Hỏi ngày nghỉ",
          modelJa: "やすみはいつですか。",
          segments: [{ text: "やすみは いつですか。" }],
        },
        {
          labelVi: "Trả lời thứ",
          modelJa: "げつようびです。",
          segments: [{ text: "げつようびです。" }],
          hintVi: "Chọn thứ trong tuần.",
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "やすみは いつですか。" }] },
          choices: ["Nghỉ khi nào?", "Nghỉ ở đâu?", "Mấy giờ nghỉ?", "Nghỉ bao lâu?"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Hỏi giờ mở cửa",
      situationVi: "Hỏi thời gian hoạt động của cơ sở.",
      lines: [
        { speaker: "A", segments: [{ text: "なんじから なんじまでですか。" }], vi: "Mở từ mấy giờ đến mấy giờ ạ?" },
        { speaker: "B", segments: [{ text: "くじから ごじまでです。" }], vi: "Từ 9 giờ đến 5 giờ ạ." },
      ],
    },
    {
      title: "Hỏi ngày nghỉ",
      situationVi: "Hỏi ngày nghỉ của địa điểm.",
      lines: [
        { speaker: "A", segments: [{ text: "やすみは いつですか。" }], vi: "Nghỉ ngày nào ạ?" },
        { speaker: "B", segments: [{ text: "げつようびです。" }], vi: "Thứ Hai ạ." },
        {
          speaker: "A",
          segments: [{ text: "そうですか。" }, { text: "ありがとうございます。" }],
          vi: "Thế à. Cảm ơn ạ.",
        },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Lịch hoạt động",
    instructionVi: "Hỏi giờ mở cửa một địa điểm và hỏi ngày nghỉ.",
    promptJapanese:
      "___は なんじから なんじまでですか。\n___から ___までです。\nやすみは いつですか。\n___ようびです。",
    expectedPattern: "から|まで|なんじ|やすみ|ようび",
  },
  speakingPrompt: "Hỏi giờ mở cửa (から〜まで) và ngày nghỉ (やすみは いつ).",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi giờ mở cửa",
      guideVi: "としょかんは なんじから なんじまでですか。",
      modelJa: "としょかんはなんじからなんじまでですか。",
      aiReply: "なんじから なんじまでですか。",
      acceptPattern: "なんじから",
      hintVi: "Hỏi từ mấy giờ đến mấy giờ.",
    },
    {
      id: 2,
      taskVi: "Trả lời giờ",
      guideVi: "はちじから ごじまでです。",
      modelJa: "はちじからごじまでです。",
      aiReply: "から ごじまでです。",
      acceptPattern: "から.*まで",
      hintVi: "～から ～までです.",
    },
    {
      id: 3,
      taskVi: "Hỏi ngày nghỉ",
      guideVi: "やすみは いつですか。",
      modelJa: "やすみはいつですか。",
      aiReply: "いつですか。",
      acceptPattern: "やすみ.*いつ|いつですか",
      hintVi: "Nghỉ khi nào?",
    },
    {
      id: 4,
      taskVi: "Trả lời thứ",
      guideVi: "げつようびです。",
      modelJa: "げつようびです。",
      aiReply: "げつようびです。",
      acceptPattern: "ようび",
      praiseVi: "Hoàn thành!",
      hintVi: "Thứ trong tuần + ようび.",
    },
  ],
};
