import type { Jpd1LessonSeed } from "./types.js";

export const lesson1SelfIntro: Jpd1LessonSeed = {
  orderIndex: 2,
  slug: "gioi-thieu-ban-than",
  title: "Bài 1: Giới thiệu bản thân",
  description: "Học cách giới thiệu tên, quốc tịch, nghề nghiệp và sở thích.",
  objective:
    "Giới thiệu được tên, quốc tịch, nghề nghiệp, trường học, tuổi, sinh nhật và sở thích.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 45,
  vocabulary: [
    { word: "わたし", reading: "わたし", meaning: "Tôi", memoryTip: "Từ lịch sự, dùng với です." },
    { word: "（お）なまえ", reading: "なまえ", meaning: "Tên", memoryTip: "お làm câu lịch sự hơn." },
    { word: "（お）くに", reading: "くに", meaning: "Quốc gia" },
    { word: "にほん", reading: "にほん", meaning: "Nhật Bản" },
    { word: "ベトナム", meaning: "Việt Nam" },
    { word: "アメリカ", meaning: "Mỹ" },
    { word: "かんこく", reading: "かんこく", meaning: "Hàn Quốc" },
    { word: "ちゅうごく", reading: "ちゅうごく", meaning: "Trung Quốc" },
    { word: "イギリス", meaning: "Anh" },
    { word: "インド", meaning: "Ấn Độ" },
    { word: "インドネシア", meaning: "Indonesia" },
    { word: "タイ", meaning: "Thái Lan" },
    { word: "イタリア", meaning: "Ý" },
    { word: "オーストラリア", meaning: "Úc" },
    { word: "ロシア", meaning: "Nga" },
    { word: "ブラジル", meaning: "Brazil" },
    { word: "～じん", reading: "じん", meaning: "Người / quốc tịch", memoryTip: "Gắn sau tên nước: ベトナムじん." },
    { word: "（お）しごと", reading: "しごと", meaning: "Công việc" },
    { word: "せんせい", reading: "せんせい", meaning: "Thầy/cô giáo" },
    { word: "きょうし", reading: "きょうし", meaning: "Giáo viên" },
    { word: "がくせい", reading: "がくせい", meaning: "Học sinh, sinh viên" },
    { word: "がっこう", reading: "がっこう", meaning: "Trường học" },
    { word: "だいがく", reading: "だいがく", meaning: "Đại học", memoryTip: "FPTだいがく = Đại học FPT." },
    { word: "こうこう", reading: "こうこう", meaning: "Trường THPT" },
    { word: "にほんごがっこう", reading: "にほんごがっこう", meaning: "Trường tiếng Nhật" },
    { word: "かいしゃいん", reading: "かいしゃいん", meaning: "Nhân viên công ty" },
    { word: "たんじょうび", reading: "たんじょうび", meaning: "Sinh nhật" },
    { word: "いつ", reading: "いつ", meaning: "Khi nào" },
    { word: "～さい", reading: "さい", meaning: "Tuổi", memoryTip: "Số + さい: 20さい." },
    { word: "しゅみ", reading: "しゅみ", meaning: "Sở thích" },
    { word: "スポーツ", meaning: "Thể thao" },
    { word: "サッカー", meaning: "Bóng đá" },
    { word: "テニス", meaning: "Tennis" },
    { word: "バドミントン", meaning: "Cầu lông" },
    { word: "ゴルフ", meaning: "Golf" },
    { word: "やきゅう", reading: "やきゅう", meaning: "Bóng chày" },
    { word: "ピンポン", meaning: "Bóng bàn" },
    { word: "スキー", meaning: "Trượt tuyết" },
    { word: "すいえい", reading: "すいえい", meaning: "Bơi lội" },
    { word: "おんがく", reading: "おんがく", meaning: "Âm nhạc" },
  ],
  grammar: [
    {
      title: "N1 は N2 です",
      pattern: "N1 は N2 です",
      meaningVi: "N1 là N2",
      usage: "Câu khẳng định cơ bản. は đánh dấu chủ đề.",
      notes: "です kết thúc câu lịch sự.",
      examples: [
        { segments: [{ text: "わたしは " }, { kanji: "学生", reading: "がくせい" }, { text: "です。" }], vi: "Tôi là sinh viên." },
        { segments: [{ text: "わたしは ベトナムじんです。" }], vi: "Tôi là người Việt Nam." },
      ],
      quiz: [
        {
          question: { segments: [{ text: "わたしは がくせい___。" }] },
          choices: ["です", "ます", "だ", "います"],
          answer: 0,
        },
      ],
    },
    {
      title: "N1 は N2 ですか",
      pattern: "N1 は N2 ですか",
      meaningVi: "N1 có phải là N2 không?",
      usage: "Câu hỏi Có/Không.",
      examples: [
        { segments: [{ text: "あなたは がくせいですか。" }], vi: "Bạn có phải sinh viên không?" },
      ],
      quiz: [
        {
          question: { segments: [{ text: "しゅみは サッカーですか。—— はい、___。" }] },
          choices: ["そうです", "ちがいます", "ありません", "ください"],
          answer: 0,
        },
      ],
    },
    {
      title: "N1 は N2 じゃありません",
      pattern: "N1 は N2 じゃありません",
      meaningVi: "N1 không phải là N2",
      usage: "Phủ định lịch sự. Có thể nói ではありません.",
      examples: [
        { segments: [{ text: "わたしは せんせいじゃありません。" }], vi: "Tôi không phải giáo viên." },
      ],
    },
    {
      title: "N1 の N2",
      pattern: "N1 の N2",
      meaningVi: "N2 của N1",
      usage: "Nối danh từ: trường của ai, tên của ai.",
      examples: [
        { segments: [{ text: "FPTだいがくの がくせい" }], vi: "Sinh viên Đại học FPT." },
      ],
    },
    {
      title: "も",
      pattern: "N も",
      meaningVi: "cũng",
      usage: "Thay は khi nói 'cũng'.",
      examples: [
        { segments: [{ text: "わたしも がくせいです。" }], vi: "Tôi cũng là sinh viên." },
      ],
    },
    {
      title: "～さいです",
      pattern: "数字 + さいです",
      meaningVi: "… tuổi",
      examples: [
        { segments: [{ text: "わたしは 20さいです。" }], vi: "Tôi 20 tuổi." },
      ],
    },
    {
      title: "しゅみは N です",
      pattern: "しゅみは N です",
      meaningVi: "Sở thích là N",
      examples: [
        { segments: [{ text: "しゅみは おんがくです。" }], vi: "Sở thích là âm nhạc." },
      ],
    },
  ],
  dialogues: [
    {
      title: "Giới thiệu trong lớp",
      situationVi: "Sinh viên FPT giới thiệu bản thân lần đầu.",
      lines: [
        { speaker: "A", segments: [{ text: "はじめまして。" }], vi: "Rất vui được gặp bạn." },
        { speaker: "A", segments: [{ text: "わたしは ミンです。" }], vi: "Tôi là Minh." },
        { speaker: "A", segments: [{ text: "ベトナムじんです。" }], vi: "Tôi là người Việt Nam." },
        { speaker: "A", segments: [{ text: "FPTだいがくの がくせいです。" }], vi: "Tôi là sinh viên Đại học FPT." },
        { speaker: "B", segments: [{ text: "どうぞよろしくおねがいします。" }], vi: "Rất mong được giúp đỡ." },
      ],
    },
    {
      title: "Hỏi tuổi và sinh nhật",
      situationVi: "Hai bạn làm quen sau giờ học.",
      lines: [
        { speaker: "A", segments: [{ text: "たんじょうびは いつですか。" }], vi: "Sinh nhật bạn khi nào?" },
        { speaker: "B", segments: [{ text: "5がつ 10にちです。" }], vi: "Ngày 10 tháng 5." },
        { speaker: "A", segments: [{ text: "しゅみは なんですか。" }], vi: "Sở thích của bạn là gì?" },
        { speaker: "B", segments: [{ text: "しゅみは サッカーです。" }], vi: "Sở thích là bóng đá." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "Tự giới thiệu bản thân",
    instructionVi:
      "Viết hoặc nói đoạn giới thiệu hoàn chỉnh. Điền tên, tuổi, sinh nhật và sở thích của bạn.",
    promptJapanese:
      "はじめまして。\nわたしは ___ です。\nベトナムじんです。\nFPTだいがくの がくせいです。\n___さいです。\nたんじょうびは ___ です。\nしゅみは ___ です。\nどうぞよろしくおねがいします。",
    expectedPattern: "はじめまして|です|ベトナム|がくせい|さい|たんじょうび|しゅみ|よろしく",
  },
  speakingPrompt:
    "Hãy tự giới thiệu bản thân bằng tiếng Nhật: tên, quốc tịch, trường, tuổi, sở thích. Dùng です/ます.",
};
