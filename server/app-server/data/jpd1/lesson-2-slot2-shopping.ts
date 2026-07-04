import type { Jpd1LessonSeed } from "./types.js";

/** Bài 2 · Tiết 2 — ST2 */
export const lesson2Slot2Shopping: Jpd1LessonSeed = {
  orderIndex: 6,
  slug: "bai-2-slot2-hoi-gia-va-mua-do",
  title: "ST2 — Hỏi giá và mua đồ",
  description: "Hỏi giá, dùng これ／それ／あれ và mua đồ trong cửa hàng — Bài 2, Tiết 2.",
  objective:
    "Hỏi được giá (いくら), xác định đồ vật bằng これ／それ／あれ và đặt mua bằng ～をください.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "いくら", reading: "いくら", meaning: "Bao nhiêu tiền" },
    { word: "えん", reading: "えん", meaning: "Yên" },
    { word: "ドル", reading: "ドル", meaning: "Đô la" },
    { word: "ドン", reading: "ドン", meaning: "Đồng" },
    { word: "かばん", reading: "かばん", meaning: "Cặp / túi" },
    { word: "ズボン", reading: "ズボン", meaning: "Quần" },
    { word: "Tシャツ", reading: "Tシャツ", meaning: "Áo thun" },
    { word: "とけい", reading: "とけい", meaning: "Đồng hồ" },
    { word: "これ", reading: "これ", meaning: "Cái này", memoryTip: "Gần người nói." },
    { word: "それ", reading: "それ", meaning: "Cái đó", memoryTip: "Gần người nghe." },
    { word: "あれ", reading: "あれ", meaning: "Cái kia", memoryTip: "Xa cả hai người." },
    { word: "この", reading: "この", meaning: "~ này", memoryTip: "Đứng trước danh từ: このかばん." },
    { word: "その", reading: "その", meaning: "~ đó" },
    { word: "あの", reading: "あの", meaning: "~ kia" },
    { word: "なん", reading: "なん", meaning: "Cái gì" },
    { word: "かぎ", reading: "かぎ", meaning: "Chìa khóa" },
    { word: "まど", reading: "まど", meaning: "Cửa sổ" },
    { word: "でんしじしょ", reading: "でんしじしょ", meaning: "Từ điển điện tử" },
  ],
  grammar: [
    {
      title: "Hỏi giá",
      challengeLabel: "チャレンジ 1",
      pattern: "N は いくらですか",
      meaningVi: "N bao nhiêu tiền?",
      usage: "いくら = bao nhiêu tiền. Trả lời: số + えん／ドル／ドン + です.",
      examples: [
        { segments: [{ text: "このTシャツは いくらですか。" }], vi: "Áo thun này bao nhiêu tiền?" },
        { segments: [{ text: "３０００えんです。" }], vi: "3000 yên ạ." },
        { segments: [{ text: "３５ドルです。" }], vi: "35 đô la." },
        { segments: [{ text: "きゅうまんごせんドンです。" }], vi: "95.000 đồng." },
      ],
      drills: [
        {
          labelVi: "Hỏi giá áo thun",
          modelJa: "このTシャツはいくらですか。",
          segments: [{ text: "このTシャツは いくらですか。" }],
        },
        {
          labelVi: "Trả lời giá",
          modelJa: "3000えんです。",
          segments: [{ text: "３０００えんです。" }],
          hintVi: "Số + えんです。",
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "このTシャツは いくらですか。" }] },
          choices: [
            "Áo thun này bao nhiêu tiền?",
            "Áo thun này ở đâu?",
            "Đây là áo thun",
            "Áo thun này của ai?",
          ],
          answer: 0,
        },
      ],
    },
    {
      title: "これ／それ／あれ",
      challengeLabel: "チャレンジ 2",
      pattern: "これ／それ／あれ は N です",
      meaningVi: "Đây / đó / kia là N",
      usage: "これ gần người nói · それ gần người nghe · あれ xa cả hai. それも = cái đó cũng là.",
      notes: "この／その／あの + danh từ: このかばん, そのとけい, あのTシャツ.",
      examples: [
        { segments: [{ text: "これは かばんです。" }], vi: "Đây là cặp." },
        { segments: [{ text: "それも かばんです。" }], vi: "Cái đó cũng là cặp." },
        { segments: [{ text: "あれは ズボンです。" }], vi: "Cái kia là quần." },
      ],
      drills: [
        {
          labelVi: "Nói cái này là cặp",
          modelJa: "これはかばんです。",
          segments: [{ text: "これは かばんです。" }],
        },
        {
          labelVi: "Dùng あの + danh từ",
          modelJa: "あのTシャツはいくらですか。",
          segments: [{ text: "あのTシャツは いくらですか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "これは かばんです。" }] },
          choices: ["Đây là cặp", "Đó là cặp", "Kia là cặp", "Cặp ở đâu"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi và xác nhận đồ vật",
      challengeLabel: "チャレンジ 3",
      pattern: "これは なんですか ／ これは N ですか",
      meaningVi: "Đây là cái gì? / Đây có phải là N không?",
      usage: "Trả lời khẳng định: はい、そうです。 Phủ định: いいえ、ちがいます。",
      examples: [
        { segments: [{ text: "これは なんですか。" }], vi: "Đây là cái gì?" },
        {
          segments: [{ text: "これは でんしじしょですか。" }, { text: " はい、そうです。" }],
          vi: "Đây có phải từ điển điện tử không? — Vâng, đúng vậy.",
        },
        { segments: [{ text: "いいえ、ちがいます。" }], vi: "Không, không phải." },
      ],
      drills: [
        {
          labelVi: "Hỏi cái gì",
          modelJa: "これはなんですか。",
          segments: [{ text: "これは なんですか。" }],
        },
        {
          labelVi: "Xác nhận",
          modelJa: "はい、そうです。",
          segments: [{ text: "はい、そうです。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "これは なんですか。" }] },
          choices: ["Đây là cái gì?", "Đây có phải không?", "Cái này của ai?", "Cái này bao nhiêu tiền?"],
          answer: 0,
        },
      ],
    },
    {
      title: "Mua đồ",
      challengeLabel: "言ってみよう",
      pattern: "N を ください",
      meaningVi: "Cho tôi N / tôi lấy N",
      usage: "Dùng これを／それを／あれを ください khi chọn món mua.",
      examples: [
        { segments: [{ text: "じゃ、それを ください。" }], vi: "Vậy cho tôi cái đó." },
        { segments: [{ text: "これを ください。" }], vi: "Cho tôi cái này." },
      ],
      drills: [
        {
          labelVi: "Mua áo thun",
          modelJa: "じゃ、それをください。",
          segments: [{ text: "じゃ、それを ください。" }],
          vi: "Vậy cho tôi cái đó.",
        },
        {
          labelVi: "Hỏi giá rồi mua",
          modelJa: "これはいくらですか。じゃ、これをください。",
          segments: [{ text: "これは いくらですか。" }, { text: "じゃ、これを ください。" }],
          hintVi: "Hỏi giá trước, rồi ください.",
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "じゃ、それを ください。" }] },
          choices: ["Cho tôi cái đó", "Cái đó bao nhiêu tiền", "Đó là cái gì", "Cái đó ở đâu"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Hỏi giá trong cửa hàng",
      situationVi: "Khách hỏi giá áo thun và đồng hồ.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "すみません、これは いくらですか。" }],
          vi: "Xin lỗi, cái này bao nhiêu tiền ạ?",
        },
        { speaker: "B", segments: [{ text: "４０００えんです。" }], vi: "4000 yên ạ." },
        {
          speaker: "A",
          segments: [{ text: "あのTシャツは いくらですか。" }],
          vi: "Áo thun kia bao nhiêu tiền ạ?",
        },
        { speaker: "B", segments: [{ text: "３０００えんです。" }], vi: "3000 yên ạ." },
      ],
    },
    {
      title: "So sánh giá và mua",
      situationVi: "So sánh giá hai áo thun rồi chọn mua.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "すみません。このTシャツは いくらですか。" }],
          vi: "Xin lỗi. Áo thun này bao nhiêu tiền?",
        },
        { speaker: "B", segments: [{ text: "３０００えんです。" }], vi: "3000 yên ạ." },
        {
          speaker: "A",
          segments: [{ text: "そうですか。そのTシャツは いくらですか。" }],
          vi: "Thế à. Áo thun đó bao nhiêu?",
        },
        { speaker: "B", segments: [{ text: "２０００えんです。" }], vi: "2000 yên ạ." },
        { speaker: "A", segments: [{ text: "じゃ、それを ください。" }], vi: "Vậy cho tôi cái đó." },
      ],
    },
    {
      title: "Mua đồ giá cao",
      situationVi: "Hỏi giá hai món và chọn mua.",
      lines: [
        { speaker: "A", segments: [{ text: "これは いくらですか。" }], vi: "Cái này bao nhiêu tiền?" },
        { speaker: "C", segments: [{ text: "にまんえんです。" }], vi: "20.000 yên ạ." },
        { speaker: "A", segments: [{ text: "それは いくらですか。" }], vi: "Cái đó bao nhiêu?" },
        { speaker: "C", segments: [{ text: "にまん ごせんえんです。" }], vi: "25.000 yên ạ." },
        { speaker: "A", segments: [{ text: "じゃ、これを ください。" }], vi: "Vậy cho tôi cái này." },
        { speaker: "C", segments: [{ text: "ありがとうございました。" }], vi: "Cảm ơn quý khách." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Mua sắm",
    instructionVi: "Hỏi giá hai món đồ, so sánh và chọn mua một món bằng ください.",
    promptJapanese:
      "すみません、___は いくらですか。\n___えんです。\n___は いくらですか。\nじゃ、___を ください。",
    expectedPattern: "いくら|えん|ください|これ|それ",
  },
  speakingPrompt: "Hỏi giá, dùng これ／それ／あれ và mua bằng ～をください.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi giá",
      guideVi: "これは いくらですか。",
      modelJa: "これはいくらですか。",
      aiReply: "いくらですか。",
      acceptPattern: "いくら",
      hintVi: "Hỏi: bao nhiêu tiền?",
    },
    {
      id: 2,
      taskVi: "Trả lời giá",
      guideVi: "3000えんです。",
      modelJa: "3000えんです。",
      aiReply: "3000えんです。",
      acceptPattern: "えんです",
      hintVi: "Số + えんです。",
    },
    {
      id: 3,
      taskVi: "Hỏi cái kia",
      guideVi: "あのTシャツは いくらですか。",
      modelJa: "あのTシャツはいくらですか。",
      aiReply: "いくらですか。",
      acceptPattern: "あの.*いくら|いくらですか",
      hintVi: "Dùng あの + danh từ.",
    },
    {
      id: 4,
      taskVi: "Mua đồ",
      guideVi: "じゃ、それを ください。",
      modelJa: "じゃ、それをください。",
      aiReply: "それを ください。",
      acceptPattern: "ください",
      hintVi: "それを／これを + ください.",
    },
    {
      id: 5,
      taskVi: "Cảm ơn",
      guideVi: "ありがとうございました。",
      modelJa: "ありがとうございました。",
      aiReply: "ありがとうございました。",
      acceptPattern: "ありがとう",
      praiseVi: "Hoàn thành!",
      hintVi: "Cảm ơn sau khi mua.",
    },
  ],
};
