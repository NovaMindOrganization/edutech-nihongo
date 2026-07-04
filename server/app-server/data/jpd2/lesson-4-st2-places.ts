import type { Jpd2LessonSeed } from "./types.js";

/** Bài 4 · Tiết 4 — ST2 có gì */
export const lesson4St2Places: Jpd2LessonSeed = {
  orderIndex: 3,
  slug: "bai-4-st2-noi-do-co-gi",
  title: "ST2 — Nơi đó có gì?",
  description: "Nói ở thành phố / quê hương có công trình, cảnh vật gì — Bài 4, Tiết 4.",
  objective: "Dùng được 場所に N が あります, なにが ありますか, どんな N ですか và そして.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "きょうかい", reading: "きょうかい", meaning: "nhà thờ" },
    { word: "おてら", reading: "おてら", meaning: "chùa" },
    { word: "かわ", reading: "かわ", meaning: "sông" },
    { word: "やま", reading: "やま", meaning: "núi" },
    { word: "ビル", reading: "ビル", meaning: "tòa nhà" },
    { word: "みどり", reading: "みどり", meaning: "cây xanh" },
    { word: "ところ", reading: "ところ", meaning: "nơi" },
    { word: "なに", reading: "なに", meaning: "cái gì" },
    { word: "おおきい", reading: "おおきい", meaning: "lớn" },
    { word: "ふるい", reading: "ふるい", meaning: "cũ" },
    { word: "きれい", reading: "きれい", meaning: "đẹp" },
    { word: "ゆうめい", reading: "ゆうめい", meaning: "nổi tiếng" },
    { word: "そして", reading: "そして", meaning: "và" },
    { word: "１区", reading: "いっく", meaning: "quận 1" },
    { word: "ビンズン", reading: "ビンズン", meaning: "Bình Dương" },
    { word: "フェ", reading: "フェ", meaning: "Huế" },
    { word: "テイニン", reading: "テイニン", meaning: "Tây Ninh" },
    { word: "ドンナイ", reading: "ドンナイ", meaning: "Đồng Nai" },
    { word: "スワンかわ", reading: "スワンかわ", meaning: "sông Swan" },
    { word: "モスクワ", reading: "モスクワ", meaning: "Moscow" },
    { word: "パース", reading: "パース", meaning: "Perth" },
  ],
  grammar: [
    {
      title: "Ở nơi chốn có N",
      challengeLabel: "チャレンジ 1",
      pattern: "場所 に N が あります",
      meaningVi: "Ở nơi chốn có N",
      usage: "に đánh dấu nơi tồn tại. が đánh dấu chủ thể có.",
      examples: [
        { segments: [{ text: "１区に きょうかいがあります。" }], vi: "Quận 1 có nhà thờ." },
        { segments: [{ text: "ビンズンに おおきいきょうかいがあります。" }], vi: "Bình Dương có nhà thờ lớn." },
        { segments: [{ text: "フェに ふるいおてらがあります。" }], vi: "Huế có chùa cổ." },
        { segments: [{ text: "テイニンに おおきいやまがあります。" }], vi: "Tây Ninh có núi lớn." },
      ],
      drills: [
        {
          labelVi: "Có nhà thờ quận 1",
          modelJa: "1区にきょうかいがあります。",
          segments: [{ text: "１区に きょうかいがあります。" }],
        },
        {
          labelVi: "Có chùa cổ ở Huế",
          modelJa: "フェにふるいおてらがあります。",
          segments: [{ text: "フェに ふるいおてらがあります。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "１区に きょうかいがあります。" }] },
          choices: ["Quận 1 có nhà thờ", "Quận 1 có chùa", "Nhà thờ ở quận 1", "Không có nhà thờ"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi có gì",
      challengeLabel: "チャレンジ 2",
      pattern: "場所 に なにが ありますか ／ どんな N ですか",
      meaningVi: "Ở nơi chốn có gì? / N như thế nào?",
      usage: "なにが ありますか hỏi có gì. どんな + N hỏi đặc điểm.",
      examples: [
        { segments: [{ text: "モスクワに なにがありますか。" }], vi: "Moscow có gì?" },
        { segments: [{ text: "きょうかいがあります。" }], vi: "Có nhà thờ." },
        { segments: [{ text: "どんな きょうかいですか。" }], vi: "Nhà thờ thế nào?" },
        { segments: [{ text: "おおきいきょうかいです。きれいです。" }], vi: "Nhà thờ lớn. Đẹp." },
      ],
      drills: [
        {
          labelVi: "Hỏi có gì",
          modelJa: "なにがありますか。",
          segments: [{ text: "なにがありますか。" }],
        },
        {
          labelVi: "Trả lời có sông",
          modelJa: "かわがあります。",
          segments: [{ text: "かわがあります。" }],
        },
      ],
    },
    {
      title: "Mô tả bằng そして",
      challengeLabel: "チャレンジ 3",
      pattern: "N は Adj です。そして Adj です",
      meaningVi: "N vừa Adj vừa Adj",
      examples: [
        {
          segments: [{ text: "スワンかわは おおきいです。そして きれいです。" }],
          vi: "Sông Swan lớn. Và đẹp.",
        },
        { segments: [{ text: "フェに おおきいかわがあります。" }], vi: "Huế có sông lớn." },
        { segments: [{ text: "ドンナイに ゆうめいなきょうかいがあります。" }], vi: "Đồng Nai có nhà thờ nổi tiếng." },
      ],
      drills: [
        {
          labelVi: "Sông lớn và đẹp",
          modelJa: "おおきいです。そして、きれいです。",
          segments: [{ text: "おおきいです。" }, { text: "そして きれいです。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Moscow có gì",
      situationVi: "Hỏi và mô tả nhà thờ ở Moscow.",
      lines: [
        { speaker: "A", segments: [{ text: "モスクワに なにがありますか。" }], vi: "Moscow có gì?" },
        { speaker: "B", segments: [{ text: "きょうかいがあります。" }], vi: "Có nhà thờ." },
        { speaker: "A", segments: [{ text: "どんな きょうかいですか。" }], vi: "Nhà thờ thế nào?" },
        { speaker: "B", segments: [{ text: "おおきいきょうかいです。きれいです。" }], vi: "Nhà thờ lớn. Đẹp." },
      ],
    },
    {
      title: "Sông Swan ở Perth",
      situationVi: "Hỏi Perth có gì và mô tả sông.",
      lines: [
        { speaker: "A", segments: [{ text: "パースに なにがありますか。" }], vi: "Perth có gì?" },
        { speaker: "B", segments: [{ text: "かわがあります。スワンかわです。" }], vi: "Có sông. Sông Swan." },
        {
          speaker: "B",
          segments: [{ text: "スワンかわは おおきいです。そして きれいです。" }],
          vi: "Sông Swan lớn. Và đẹp.",
        },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Nơi có gì",
    instructionVi: "Nói một địa điểm ở quê bạn có gì (があります) và mô tả ngắn.",
    promptJapanese: "___に ___があります。\n___です。",
    expectedPattern: "あります|きょうかい|かわ|やま|おおき|きれい",
  },
  speakingPrompt: "Hỏi và nói: なにがありますか, きょうかいがあります, そして きれいです.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi có gì",
      guideVi: "なにがありますか。",
      modelJa: "なにがありますか。",
      aiReply: "なにがありますか。",
      acceptPattern: "なに|ありますか",
    },
    {
      id: 2,
      taskVi: "Có nhà thờ",
      guideVi: "きょうかいがあります。",
      modelJa: "きょうかいがあります。",
      aiReply: "あります。",
      acceptPattern: "きょうかい|あります",
    },
    {
      id: 3,
      taskVi: "Nhà thờ lớn",
      guideVi: "おおきいきょうかいです。",
      modelJa: "おおきいきょうかいです。",
      aiReply: "おおきいです。",
      acceptPattern: "おおきい",
    },
    {
      id: 4,
      taskVi: "Lớn và đẹp",
      guideVi: "そして きれいです。",
      modelJa: "そして、きれいです。",
      aiReply: "きれいです。",
      acceptPattern: "きれい",
      praiseVi: "Hoàn thành!",
    },
  ],
};
