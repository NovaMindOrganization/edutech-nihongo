import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 3 — Phân loại động từ */
export const lesson7L3VerbGroups: Jpd2LessonSeed = {
  orderIndex: 18,
  slug: "bai-7-l4-nhom-dong-tu",
  title: "Tiết 4 — Phân loại Động từ Nhóm 1, 2, 3",
  description: "Nhận diện 3 nhóm động từ — chuẩn bị chia thể Te — Bài 7, Tiết 4.",
  objective: "Nhận diện và phân loại động từ vào 3 nhóm để chuẩn bị chia thể.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "書きます", reading: "かきます", meaning: "viết" },
    { word: "聞きます", reading: "ききます", meaning: "nghe, hỏi" },
    { word: "切ります", reading: "きります", meaning: "cắt, gọt" },
    { word: "置きます", reading: "おきます", meaning: "đặt, để" },
    { word: "洗います", reading: "あらいます", meaning: "rửa, giặt" },
    { word: "食べます", reading: "たべます", meaning: "ăn" },
    { word: "見ます", reading: "みます", meaning: "xem" },
    { word: "行きます", reading: "いきます", meaning: "đi" },
    { word: "します", reading: "します", meaning: "làm" },
    { word: "来ます", reading: "きます", meaning: "đến" },
    { word: "使います", reading: "つかいます", meaning: "dùng, sử dụng" },
    { word: "取ります", reading: "とります", meaning: "cầm, lấy" },
    { word: "教えます", reading: "おしえます", meaning: "dạy, chỉ bảo" },
    { word: "手伝います", reading: "てつだいます", meaning: "giúp đỡ" },
  ],
  grammar: [
    {
      title: "Nhóm 1 — hàng i (う)",
      challengeLabel: "チャレンジ 1",
      pattern: "かきます · ききます · いきます · のみます...",
      meaningVi: "Kết thúc います (trừ いきます)",
      usage: "かきます→かいて · ききます→きいて · いきます→いって (bất quy tắc).",
      notes: "Nhóm lớn nhất. Âm cuối trước ます thường là き/ぎ/し/ち/に/び/み/り.",
      examples: [
        { segments: [{ text: "書きます → 書いて" }], vi: "viết → viết (thể Te)" },
        { segments: [{ text: "聞きます → 聞いて" }], vi: "nghe → nghe (thể Te)" },
      ],
      drills: [
        { labelVi: "Nhóm 1: viết", modelJa: "書きます", segments: [{ text: "書きます" }] },
        { labelVi: "Nhóm 1: nghe", modelJa: "聞きます", segments: [{ text: "聞きます" }] },
      ],
      quiz: [
        {
          question: { segments: [{ text: "書きます thuộc nhóm nào?" }] },
          choices: ["Nhóm 1 (hàng i)", "Nhóm 2 (hàng e)", "Nhóm 3 (します/きます)", "Không chia được"],
          answer: 0,
        },
      ],
    },
    {
      title: "Nhóm 2 — hàng e + đặc biệt",
      challengeLabel: "チャレンジ 2",
      pattern: "たべます · みます · きます · いれます...",
      meaningVi: "Kết thúc えます",
      usage: "たべます→たべて · みます→みて · きます→きて · いれます→いれて.",
      examples: [
        { segments: [{ text: "食べます → 食べて" }], vi: "ăn → ăn (thể Te)" },
        { segments: [{ text: "見ます → 見て" }], vi: "xem → xem (thể Te)" },
      ],
      drills: [
        { labelVi: "Nhóm 2: ăn", modelJa: "食べます", segments: [{ text: "食べます" }] },
      ],
      quiz: [
        {
          question: { segments: [{ text: "食べます thuộc nhóm nào?" }] },
          choices: ["Nhóm 2 (hàng e)", "Nhóm 1 (hàng i)", "Nhóm 3", "Nhóm đặc biệt します"],
          answer: 0,
        },
      ],
    },
    {
      title: "Nhóm 3 — します / きます",
      challengeLabel: "チャレンジ 3",
      pattern: "します → して ／ きます → きて",
      meaningVi: "Hai động từ đặc biệt",
      examples: [
        { segments: [{ text: "します → して" }], vi: "làm → làm (thể Te)" },
        { segments: [{ text: "来ます → 来て" }], vi: "đến → đến (thể Te)" },
      ],
      drills: [
        { labelVi: "Nhóm 3: làm", modelJa: "します→して", segments: [{ text: "します → して" }] },
      ],
      quiz: [
        {
          question: { segments: [{ text: "します → ？" }] },
          choices: ["して", "しって", "しまして", "しえて"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Ôn động từ đã học",
      situationVi: "Giáo viên hỏi nhóm động từ.",
      lines: [
        { speaker: "A", segments: [{ text: "「書きます」は 何グループですか。" }], vi: "「書きます」 thuộc nhóm nào?" },
        { speaker: "B", segments: [{ text: "グループ１です。" }], vi: "Nhóm 1." },
        { speaker: "A", segments: [{ text: "「食べます」は？" }], vi: "Còn 「食べます」?" },
        { speaker: "B", segments: [{ text: "グループ２です。" }], vi: "Nhóm 2." },
      ],
    },
  ],
  kanji: [],
  speakingPrompt: "Nhóm 1 (い) · Nhóm 2 (え) · Nhóm 3 (して/きて).",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Nhóm của 書きます",
      guideVi: "グループ１です。",
      modelJa: "グループ1です。",
      aiReply: "グループ1。",
      acceptPattern: "グループ|1|いち",
    },
    {
      id: 2,
      taskVi: "Nhóm của 食べます",
      guideVi: "グループ２です。",
      modelJa: "グループ2です。",
      aiReply: "グループ2。",
      acceptPattern: "グループ|2|に",
      praiseVi: "Hoàn thành!",
    },
  ],
};
