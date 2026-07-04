import type { Jpd1LessonSeed } from "./types.js";

/** Bài 2 · Tiết 3 — ST3 */
export const lesson2Slot3Restaurant: Jpd1LessonSeed = {
  orderIndex: 7,
  slug: "bai-2-slot3-nha-hang-va-so-huu",
  title: "ST3 — Nhà hàng, gọi món và hỏi của ai",
  description: "Hỏi món ăn, gọi món trong nhà hàng và hỏi đồ vật của ai — Bài 2, Tiết 3.",
  objective:
    "Hỏi món làm từ gì, xuất xứ; gọi món (ひとつ／ふたつ ください); hỏi và nói sở hữu (だれの／の).",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 55,
  vocabulary: [
    { word: "レストラン", reading: "レストラン", meaning: "Nhà hàng" },
    { word: "さかな", reading: "さかな", meaning: "Cá" },
    { word: "やさい", reading: "やさい", meaning: "Rau" },
    { word: "にく", reading: "にく", meaning: "Thịt" },
    { word: "ぶたにく", reading: "ぶたにく", meaning: "Thịt heo" },
    { word: "ぎゅうにく", reading: "ぎゅうにく", meaning: "Thịt bò" },
    { word: "とりにく", reading: "とりにく", meaning: "Thịt gà" },
    { word: "たまご", reading: "たまご", meaning: "Trứng" },
    { word: "イチゴ", reading: "イチゴ", meaning: "Dâu" },
    { word: "リンゴ", reading: "リンゴ", meaning: "Táo" },
    { word: "カレー", reading: "カレー", meaning: "Cà ri" },
    { word: "とんかつ", reading: "とんかつ", meaning: "Thịt heo chiên xù" },
    { word: "おちゃ", reading: "おちゃ", meaning: "Trà" },
    { word: "こうちゃ", reading: "こうちゃ", meaning: "Hồng trà" },
    { word: "ビール", reading: "ビール", meaning: "Bia" },
    { word: "ワイン", reading: "ワイン", meaning: "Rượu vang" },
    { word: "コーヒー", reading: "コーヒー", meaning: "Cà phê" },
    { word: "ジュース", reading: "ジュース", meaning: "Nước ép" },
    { word: "りょうり", reading: "りょうり", meaning: "Món ăn" },
    { word: "スープ", reading: "スープ", meaning: "Súp" },
    { word: "ちゅうもん", reading: "ちゅうもん", meaning: "Gọi món / đặt món" },
    { word: "ごはん", reading: "ごはん", meaning: "Cơm" },
    { word: "さいふ", reading: "さいふ", meaning: "Ví" },
    { word: "カード", reading: "カード", meaning: "Thẻ" },
    { word: "スマホ", reading: "スマホ", meaning: "Điện thoại thông minh" },
    { word: "カメラ", reading: "カメラ", meaning: "Máy ảnh" },
    { word: "わたし", reading: "わたし", meaning: "Tôi" },
    { word: "だれ", reading: "だれ", meaning: "Ai" },
  ],
  grammar: [
    {
      title: "Món làm từ gì",
      challengeLabel: "チャレンジ 1",
      pattern: "N1 の N2 ／ これは なんの N ですか",
      meaningVi: "N2 làm từ N1 / Đây là N gì (làm từ gì)?",
      usage: "の nối nguyên liệu và món: イチゴのケーキ = bánh làm từ dâu.",
      examples: [
        { segments: [{ text: "イチゴの ケーキ" }], vi: "Bánh dâu" },
        { segments: [{ text: "これは なんの りょうりですか。" }], vi: "Đây là món gì?" },
        { segments: [{ text: "とんかつは ぶたにくの りょうりですよ。" }], vi: "Tonkatsu là món làm từ thịt heo." },
        { segments: [{ text: "やさいの スープです。" }], vi: "Là súp rau." },
      ],
      drills: [
        {
          labelVi: "Hỏi món gì",
          modelJa: "これはなんのりょうりですか。",
          segments: [{ text: "これは なんの りょうりですか。" }],
        },
        {
          labelVi: "Trả lời nguyên liệu",
          modelJa: "とんかつはぶたにくのりょうりです。",
          segments: [{ text: "とんかつは ぶたにくの りょうりです。" }],
        },
      ],
    },
    {
      title: "Nhiều nguyên liệu",
      challengeLabel: "チャレンジ 2",
      pattern: "N1 と N2 の N3",
      meaningVi: "N3 làm từ N1 và N2",
      usage: "と = và. にくとやさいのりょうり = món thịt và rau.",
      examples: [
        { segments: [{ text: "にくと やさいの りょうり" }], vi: "Món thịt và rau" },
      ],
      drills: [
        {
          labelVi: "Nói món kết hợp",
          modelJa: "にくとやさいのりょうりです。",
          segments: [{ text: "にくと やさいの りょうり です。" }],
        },
      ],
    },
    {
      title: "Tên tiếng Anh và xuất xứ",
      challengeLabel: "チャレンジ 3",
      pattern: "N1 は ～ごで N2 です ／ N1 の N2 ／ N は どこの N ですか",
      meaningVi: "N1 trong tiếng ~ là N2 / N2 xuất xứ N1 / N của nước nào?",
      usage: "えいごで = bằng tiếng Anh. フランスのワイン = rượu vang Pháp.",
      examples: [
        { segments: [{ text: "ぶたにくは えいごで Porkです。" }], vi: "Thịt heo tiếng Anh là Pork." },
        { segments: [{ text: "フランスの ワイン" }], vi: "Rượu vang Pháp" },
        { segments: [{ text: "これは どこの ビールですか。" }], vi: "Bia này của nước nào?" },
        { segments: [{ text: "それは アメリカの ビールです。" }], vi: "Đó là bia Mỹ." },
      ],
      drills: [
        {
          labelVi: "Hỏi xuất xứ",
          modelJa: "これはどこのビールですか。",
          segments: [{ text: "これは どこの ビールですか。" }],
        },
        {
          labelVi: "Trả lời xuất xứ",
          modelJa: "アメリカのビールです。",
          segments: [{ text: "アメリカの ビールです。" }],
        },
      ],
    },
    {
      title: "Gọi món",
      challengeLabel: "言ってみよう 1",
      pattern: "N を ひとつ／ふたつ… ください",
      meaningVi: "Cho tôi một / hai … N",
      usage: "ひとつ=1, ふたつ=2, みっつ=3, よっつ=4, いつつ=5. と nối nhiều món.",
      notes: "1つ=ひとつ, 2つ=ふたつ, 3つ=みっつ, 4つ=よっつ, 5つ=いつつ.",
      examples: [
        { segments: [{ text: "コーヒーを ひとつ ください。" }], vi: "Cho tôi một ly cà phê." },
        { segments: [{ text: "ビールを ふたつ ください。" }], vi: "Cho tôi hai chai bia." },
        {
          segments: [{ text: "コーヒーを ひとつと ビールを ふたつ ください。" }],
          vi: "Cho tôi một cà phê và hai bia.",
        },
        {
          segments: [
            { text: "A：すみません、ちゅうもんを おねがいします。" },
            { text: " B：はい、どうぞ。" },
          ],
          vi: "Xin lỗi, cho gọi món. — Vâng, mời ạ.",
        },
        {
          segments: [
            { text: "A：とんかつを ふたつ ください。" },
            { text: " B：とんかつを ふたつですね。かしこまりました。" },
          ],
          vi: "Cho tôi hai phần tonkatsu. — Hai tonkatsu ạ, vâng ạ.",
        },
      ],
      drills: [
        {
          labelVi: "Gọi một món",
          modelJa: "とんかつをひとつください。",
          segments: [{ text: "とんかつを ひとつ ください。" }],
        },
        {
          labelVi: "Gọi hai món",
          modelJa: "コーヒーをひとつとビールをふたつください。",
          segments: [{ text: "コーヒーを ひとつと ビールを ふたつ ください。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "ビールを ふたつ ください。" }] },
          choices: ["Cho hai chai bia", "Cho một chai bia", "Bia bao nhiêu tiền", "Bia của nước nào"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi của ai",
      challengeLabel: "言ってみよう 2",
      pattern: "だれの N ですか ／ N1 の N2 ／ N1 のです",
      meaningVi: "N của ai? / N2 của N1 / Là của N1",
      usage: "だれのさいふ = ví của ai. わたしのさいふ = ví của tôi. たなかさんのです = của anh Tanaka.",
      examples: [
        { segments: [{ text: "これは だれの さいふですか。" }], vi: "Đây là ví của ai?" },
        { segments: [{ text: "わたしの さいふです。" }], vi: "Là ví của tôi." },
        { segments: [{ text: "たなかさんのです。" }], vi: "Là của anh Tanaka." },
      ],
      drills: [
        {
          labelVi: "Hỏi ví của ai",
          modelJa: "これはだれのさいふですか。",
          segments: [{ text: "これは だれの さいふですか。" }],
        },
        {
          labelVi: "Trả lời sở hữu",
          modelJa: "わたしのさいふです。",
          segments: [{ text: "わたしの さいふです。" }],
          hintVi: "わたしの + danh từ + です.",
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "これは だれの さいふですか。" }] },
          choices: ["Ví của ai?", "Đây là ví", "Ví ở đâu", "Ví bao nhiêu tiền"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Hỏi món ăn",
      situationVi: "Hỏi tonkatsu và súp làm từ gì.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "とんかつは なんの りょうりですか。" }],
          vi: "Tonkatsu là món gì ạ?",
        },
        {
          speaker: "B",
          segments: [{ text: "とんかつは ぶたにくの りょうりですよ。" }],
          vi: "Tonkatsu là món làm từ thịt heo ạ.",
        },
        {
          speaker: "A",
          segments: [{ text: "これは なんの スープですか。" }],
          vi: "Đây là súp gì?",
        },
        { speaker: "B", segments: [{ text: "やさいの スープです。" }], vi: "Là súp rau." },
      ],
    },
    {
      title: "Xuất xứ và tiếng Anh",
      situationVi: "Hỏi tên tiếng Anh và xuất xứ bia.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "ぶたにくは えいごで なんですか。" }],
          vi: "Thịt heo tiếng Anh là gì?",
        },
        { speaker: "B", segments: [{ text: "Porkです。" }], vi: "Là Pork." },
        {
          speaker: "A",
          segments: [{ text: "これは どこの ビールですか。" }],
          vi: "Bia này của nước nào?",
        },
        { speaker: "B", segments: [{ text: "それは アメリカの ビールです。" }], vi: "Đó là bia Mỹ." },
      ],
    },
    {
      title: "Gọi món nhà hàng",
      situationVi: "Gọi món và xác nhận đơn.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "すみません、ちゅうもんを おねがいします。" }],
          vi: "Xin lỗi, cho tôi gọi món.",
        },
        { speaker: "B", segments: [{ text: "はい、どうぞ。" }], vi: "Vâng, mời ạ." },
        {
          speaker: "A",
          segments: [{ text: "とんかつを ふたつ ください。" }],
          vi: "Cho tôi hai phần tonkatsu.",
        },
        {
          speaker: "B",
          segments: [
            { text: "はい。とんかつを ふたつですね。" },
            { text: "かしこまりました。" },
            { text: "しょうしょう おまちください。" },
          ],
          vi: "Vâng. Hai tonkatsu ạ. Đã nhận. Xin chờ một chút.",
        },
      ],
    },
    {
      title: "Hỏi ví của ai",
      situationVi: "Nhặt được ví và hỏi chủ nhân.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "あ、さいふ！" }, { text: "これは だれの さいふですか。" }],
          vi: "À, ví! Đây là ví của ai?",
        },
        {
          speaker: "B",
          segments: [{ text: "それは わたしの さいふです。" }, { text: "ありがとうございます。" }],
          vi: "Đó là ví của tôi. Cảm ơn bạn.",
        },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Nhà hàng",
    instructionVi: "Hỏi một món làm từ gì, gọi món, và hỏi đồ vật của ai.",
    promptJapanese:
      "___は なんの りょうりですか。\n___を ふたつ ください。\nこれは だれの ___ですか。\nわたしの ___です。",
    expectedPattern: "なんの|ください|だれの|の",
  },
  speakingPrompt: "Hỏi món ăn, gọi món và hỏi sở hữu (だれの).",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi món gì",
      guideVi: "とんかつは なんの りょうりですか。",
      modelJa: "とんかつはなんのりょうりですか。",
      aiReply: "なんの りょうりですか。",
      acceptPattern: "なんの",
      hintVi: "Hỏi món làm từ gì.",
    },
    {
      id: 2,
      taskVi: "Trả lời nguyên liệu",
      guideVi: "ぶたにくの りょうりです。",
      modelJa: "ぶたにくのりょうりです。",
      aiReply: "ぶたにくの りょうりです。",
      acceptPattern: "のりょうり|の りょうり",
      hintVi: "Nguyên liệu + の + りょうり.",
    },
    {
      id: 3,
      taskVi: "Gọi món",
      guideVi: "とんかつを ふたつ ください。",
      modelJa: "とんかつをふたつください。",
      aiReply: "ふたつ ください。",
      acceptPattern: "ください",
      hintVi: "Món + を + số lượng + ください.",
    },
    {
      id: 4,
      taskVi: "Hỏi của ai",
      guideVi: "これは だれの さいふですか。",
      modelJa: "これはだれのさいふですか。",
      aiReply: "だれの さいふですか。",
      acceptPattern: "だれの",
      hintVi: "だれの + danh từ + ですか.",
    },
    {
      id: 5,
      taskVi: "Trả lời sở hữu",
      guideVi: "わたしの さいふです。",
      modelJa: "わたしのさいふです。",
      aiReply: "わたしの さいふです。",
      acceptPattern: "のさいふ|の さいふ",
      praiseVi: "Hoàn thành!",
      hintVi: "わたしの + danh từ + です.",
    },
  ],
};
