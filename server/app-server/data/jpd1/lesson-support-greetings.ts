import type { Jpd1LessonSeed } from "./types.js";

export const lessonSupportGreetings: Jpd1LessonSeed = {
  orderIndex: 0,
  slug: "chao-hoi-co-ban",
  title: "Chào hỏi cơ bản",
  description: "Làm quen các câu chào và lịch sự giao tiếp hằng ngày.",
  objective: "Chào hỏi đúng thời điểm và dùng được các câu lịch sự cơ bản.",
  lessonType: "support",
  isBonus: true,
  estimatedMinutes: 20,
  vocabulary: [
    { word: "おはようございます", reading: "おはようございます", meaning: "Chào buổi sáng (lịch sự)", memoryTip: "Dùng trước trưa, với thầy cô hoặc người lớn." },
    { word: "おはよう", reading: "おはよう", meaning: "Chào buổi sáng (thân mật)", memoryTip: "Dùng với bạn bè, gia đình." },
    { word: "こんにちは", reading: "こんにちは", meaning: "Xin chào (ban ngày)", memoryTip: "Từ 10h–17h, không dùng buổi tối." },
    { word: "こんばんは", reading: "こんばんは", meaning: "Chào buổi tối", memoryTip: "Sau khi trời tối." },
    { word: "おやすみなさい", reading: "おやすみなさい", meaning: "Chúc ngủ ngon", memoryTip: "Trước khi đi ngủ." },
    { word: "さようなら", reading: "さようなら", meaning: "Tạm biệt", memoryTip: "Khi chia tay lâu dài." },
    { word: "はじめまして", reading: "はじめまして", meaning: "Rất vui được gặp bạn", memoryTip: "Lần đầu gặp mặt." },
    { word: "どうぞよろしくおねがいします", reading: "どうぞよろしくおねがいします", meaning: "Rất mong được giúp đỡ", memoryTip: "Kết thúc lời giới thiệu lịch sự." },
    { word: "どうもありがとうございます", reading: "どうもありがとうございます", meaning: "Cảm ơn rất nhiều", memoryTip: "Cảm ơn trang trọng." },
    { word: "どういたしまして", reading: "どういたしまして", meaning: "Không có gì", memoryTip: "Trả lời khi được cảm ơn." },
    { word: "いただきます", reading: "いただきます", meaning: "Xin mời (trước bữa ăn)", memoryTip: "Nói trước khi ăn." },
    { word: "ごちそうさまでした", reading: "ごちそうさまでした", meaning: "Cảm ơn bữa ăn", memoryTip: "Nói sau khi ăn xong." },
    { word: "いってきます", reading: "いってきます", meaning: "Tôi đi đây", memoryTip: "Khi rời nhà." },
    { word: "いってらっしゃい", reading: "いってらっしゃい", meaning: "Đi cẩn thận nhé", memoryTip: "Người ở nhà đáp lại." },
    { word: "ただいま", reading: "ただいま", meaning: "Tôi về rồi", memoryTip: "Khi về nhà." },
    { word: "おかえりなさい", reading: "おかえりなさい", meaning: "Chào mừng về", memoryTip: "Đáp lại ただいま." },
  ],
  grammar: [],
  dialogues: [
    {
      title: "Chào buổi sáng ở trường",
      situationVi: "Hai sinh viên gặp nhau buổi sáng trước lớp.",
      lines: [
        { speaker: "A", segments: [{ text: "おはようございます。" }], vi: "Chào buổi sáng." },
        { speaker: "B", segments: [{ text: "おはようございます。" }], vi: "Chào buổi sáng." },
        { speaker: "A", segments: [{ text: "きょうも がんばりましょう。" }], vi: "Hôm nay cùng cố gắng nhé." },
      ],
    },
    {
      title: "Lần đầu gặp mặt",
      situationVi: "Giới thiệu lần đầu trong lớp tiếng Nhật.",
      lines: [
        { speaker: "A", segments: [{ text: "はじめまして。" }], vi: "Rất vui được gặp bạn." },
        { speaker: "A", segments: [{ text: "どうぞよろしくおねがいします。" }], vi: "Rất mong được giúp đỡ." },
        { speaker: "B", segments: [{ text: "こちらこそ、よろしくおねがいします。" }], vi: "Tôi cũng vậy, rất mong được giúp đỡ." },
      ],
    },
  ],
  kanji: [],
  speakingPrompt: "Luyện chào hỏi theo thời điểm trong ngày: おはようございます, こんにちは, こんばんは.",
};
