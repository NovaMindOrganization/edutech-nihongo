import type { Jpd2LessonSeed } from "./types.js";

/** Bài 4 · Tiết 5 — ST3 thời tiết */
export const lesson4St3Weather: Jpd2LessonSeed = {
  orderIndex: 4,
  slug: "bai-4-st3-thoi-tiet-va-mua",
  title: "ST3 — Thời tiết và mùa",
  description: "Nói thời tiết, khí hậu và mức độ nóng/lạnh theo tháng — Bài 4, Tiết 5.",
  objective:
    "Dùng được tính từ thời tiết, てんきがいい/わるい, とても/すこし/あまり và hỏi ～がつ Adj ですか, どうですか.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "あめ", reading: "あめ", meaning: "mưa" },
    { word: "ゆき", reading: "ゆき", meaning: "tuyết" },
    { word: "ひ", reading: "ひ", meaning: "ngày / mặt trời" },
    { word: "メロン", reading: "メロン", meaning: "dưa lưới" },
    { word: "あたたかい", reading: "あたたかい", meaning: "ấm áp" },
    { word: "すずしい", reading: "すずしい", meaning: "mát mẻ" },
    { word: "あつい", reading: "あつい", meaning: "nóng" },
    { word: "さむい", reading: "さむい", meaning: "lạnh" },
    { word: "てんきがいい", reading: "てんきがいい", meaning: "thời tiết đẹp" },
    { word: "てんきがわるい", reading: "てんきがわるい", meaning: "thời tiết xấu" },
    { word: "いちねんじゅう", reading: "いちねんじゅう", meaning: "suốt một năm" },
    { word: "あまり", reading: "あまり", meaning: "không... lắm" },
    { word: "すこし", reading: "すこし", meaning: "hơi / một chút" },
    { word: "とても", reading: "とても", meaning: "rất" },
    { word: "どう", reading: "どう", meaning: "thế nào" },
    { word: "そうですね", reading: "そうですね", meaning: "đúng vậy / vậy nhỉ" },
    { word: "ペキン", reading: "ペキン", meaning: "Bắc Kinh" },
    { word: "プサン", reading: "プサン", meaning: "Busan" },
    { word: "とうきょう", reading: "とうきょう", meaning: "Tokyo" },
    { word: "～がつ", reading: "がつ", meaning: "tháng ~", memoryTip: "８がつ = tháng 8." },
  ],
  grammar: [
    {
      title: "Nhận xét thời tiết",
      challengeLabel: "チャレンジ 1",
      pattern: "Adj ですね ／ そうですね",
      meaningVi: "Nhỉ / đúng vậy nhỉ",
      usage: "ですね đồng tình. そうですね = đúng vậy.",
      examples: [
        {
          segments: [{ text: "A：まいにち あついですね。" }, { text: " B：そうですね。" }],
          vi: "Hằng ngày nóng nhỉ. — Đúng vậy.",
        },
        {
          segments: [{ text: "A：さむいですね。" }, { text: " B：そうですね。" }],
          vi: "Lạnh nhỉ. — Vậy nhỉ.",
        },
      ],
      drills: [
        {
          labelVi: "Nóng nhỉ",
          modelJa: "あついですね。",
          segments: [{ text: "あついですね。" }],
        },
        {
          labelVi: "Đồng ý",
          modelJa: "そうですね。",
          segments: [{ text: "そうですね。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "あついですね。" }] },
          choices: ["Nóng nhỉ", "Lạnh nhỉ", "Mát nhỉ", "Mưa nhỉ"],
          answer: 0,
        },
      ],
    },
    {
      title: "Thời tiết theo tháng",
      challengeLabel: "チャレンジ 2",
      pattern: "N は ～がつ Adj ですか ／ はい、Adj です",
      meaningVi: "N vào tháng ~ có Adj không?",
      examples: [
        { segments: [{ text: "ペキンは ８がつ あついですか。" }], vi: "Bắc Kinh tháng 8 có nóng không?" },
        { segments: [{ text: "はい、あついです。" }], vi: "Vâng, nóng." },
        { segments: [{ text: "プサンは ８がつ とても あついです。" }], vi: "Busan tháng 8 rất nóng." },
        { segments: [{ text: "とうきょうは １０がつ すこし あついです。" }], vi: "Tokyo tháng 10 hơi nóng." },
        { segments: [{ text: "とうきょうは １１がつ あまり あつくないです。" }], vi: "Tokyo tháng 11 không nóng lắm." },
      ],
      drills: [
        {
          labelVi: "Hỏi tháng 8",
          modelJa: "8がつあついですか。",
          segments: [{ text: "８がつ あついですか。" }],
        },
        {
          labelVi: "Rất nóng",
          modelJa: "とてもあついです。",
          segments: [{ text: "とても あついです。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "とうきょうは １１がつ あまり あつくないです。" }] },
          choices: ["Tokyo tháng 11 không nóng lắm", "Tokyo tháng 11 rất nóng", "Tokyo tháng 8 nóng", "Tokyo lạnh"],
          answer: 0,
        },
      ],
    },
    {
      title: "Mức độ với tính từ",
      challengeLabel: "チャレンジ 3",
      pattern: "とても / すこし / あまり + Adj",
      meaningVi: "Rất / hơi / không... lắm",
      notes: "あまり phải đi với phủ định: あまり あつくないです.",
      examples: [
        { segments: [{ text: "とても あついです。" }], vi: "Rất nóng." },
        { segments: [{ text: "すこし あついです。" }], vi: "Hơi nóng." },
        { segments: [{ text: "あまり あつくないです。" }], vi: "Không nóng lắm." },
        { segments: [{ text: "とうきょうは どうですか。" }], vi: "Tokyo thế nào?" },
      ],
      drills: [
        {
          labelVi: "Không nóng lắm",
          modelJa: "あまりあつくないです。",
          segments: [{ text: "あまり あつくないです。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Thời tiết hằng ngày",
      situationVi: "Trò chuyện về thời tiết nóng lạnh.",
      lines: [
        { speaker: "A", segments: [{ text: "まいにち あついですね。" }], vi: "Hằng ngày nóng nhỉ." },
        { speaker: "B", segments: [{ text: "そうですね。" }], vi: "Đúng vậy." },
        { speaker: "A", segments: [{ text: "ペキンは ８がつ あついですか。" }], vi: "Bắc Kinh tháng 8 nóng không?" },
        { speaker: "B", segments: [{ text: "はい、あついです。" }], vi: "Vâng, nóng." },
      ],
    },
    {
      title: "Tokyo thế nào",
      situationVi: "Hỏi khí hậu Tokyo các tháng.",
      lines: [
        { speaker: "A", segments: [{ text: "とうきょうは どうですか。" }], vi: "Tokyo thế nào?" },
        { speaker: "B", segments: [{ text: "１０がつは すこし あついです。" }], vi: "Tháng 10 hơi nóng." },
        { speaker: "B", segments: [{ text: "１１がつは あまり あつくないです。" }], vi: "Tháng 11 không nóng lắm." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Thời tiết",
    instructionVi: "Nhận xét thời tiết (ですね) và nói một tháng nóng/lạnh với とても hoặc あまり.",
    promptJapanese: "___ですね。\n___は ___がつ ___です。",
    expectedPattern: "あつい|さむい|ですね|とても|あまり|がつ",
  },
  speakingPrompt: "Thời tiết: あついですね, そうですね, とても/すこし/あまり, ～がつ.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Nóng nhỉ",
      guideVi: "あついですね。",
      modelJa: "あついですね。",
      aiReply: "ですね。",
      acceptPattern: "あつい",
    },
    {
      id: 2,
      taskVi: "Đồng ý",
      guideVi: "そうですね。",
      modelJa: "そうですね。",
      aiReply: "そうですね。",
      acceptPattern: "そうですね",
    },
    {
      id: 3,
      taskVi: "Rất nóng",
      guideVi: "とても あついです。",
      modelJa: "とてもあついです。",
      aiReply: "あついです。",
      acceptPattern: "とても",
    },
    {
      id: 4,
      taskVi: "Không nóng lắm",
      guideVi: "あまり あつくないです。",
      modelJa: "あまりあつくないです。",
      aiReply: "あつくないです。",
      acceptPattern: "あまり|ない",
      praiseVi: "Hoàn thành!",
    },
  ],
};
