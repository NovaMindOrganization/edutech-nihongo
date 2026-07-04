import type { Jpd1LessonSeed } from "./types.js";

/** Bài 2 · Tiết 1 — ST1 */
export const lesson2Slot1Location: Jpd1LessonSeed = {
  orderIndex: 5,
  slug: "bai-2-slot1-hoi-vi-tri-va-tang",
  title: "ST1 — Hỏi vị trí và tầng",
  description: "Hỏi vị trí đồ vật, cửa hàng và tầng trong tòa nhà — Bài 2, Tiết 1.",
  objective:
    "Hỏi được vị trí nơi chốn, đồ vật hoặc cửa hàng; trả lời bằng ここ／そこ／あそこ và hỏi tầng (なんかい).",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "ATM", meaning: "ATM" },
    { word: "エスカレーター", reading: "エスカレーター", meaning: "Thang cuốn" },
    { word: "エレベーター", reading: "エレベーター", meaning: "Thang máy" },
    { word: "きつえんじょ", reading: "きつえんじょ", meaning: "Phòng hút thuốc" },
    { word: "トイレ", reading: "トイレ", meaning: "Nhà vệ sinh" },
    { word: "レジ", reading: "レジ", meaning: "Quầy tính tiền" },
    { word: "きっさてん", reading: "きっさてん", meaning: "Quán cà phê" },
    { word: "スーパー", reading: "スーパー", meaning: "Siêu thị" },
    { word: "ひゃくえんショップ", reading: "ひゃくえんショップ", meaning: "Cửa hàng 100 yên" },
    { word: "レストラン", reading: "レストラン", meaning: "Nhà hàng" },
    { word: "ちか", reading: "ちか", meaning: "Tầng hầm" },
    { word: "カメラ", reading: "カメラ", meaning: "Máy ảnh" },
    { word: "けいたいでんわ", reading: "けいたいでんわ", meaning: "Điện thoại di động" },
    { word: "でんしじしょ", reading: "でんしじしょ", meaning: "Từ điển điện tử" },
    { word: "パソコン", reading: "パソコン", meaning: "Máy tính cá nhân" },
    { word: "くつ", reading: "くつ", meaning: "Giày" },
    { word: "けしゴム", reading: "けしゴム", meaning: "Cục tẩy" },
    { word: "ペン", reading: "ペン", meaning: "Bút" },
    { word: "ほん", reading: "ほん", meaning: "Sách" },
    { word: "あぶら", reading: "あぶら", meaning: "Dầu ăn" },
    { word: "ケーキ", reading: "ケーキ", meaning: "Bánh kem" },
    { word: "こめ", reading: "こめ", meaning: "Gạo" },
    { word: "たまご", reading: "たまご", meaning: "Trứng" },
    { word: "パン", reading: "パン", meaning: "Bánh mì" },
    { word: "みず", reading: "みず", meaning: "Nước" },
    { word: "いらっしゃいませ", reading: "いらっしゃいませ", meaning: "Xin chào quý khách" },
    { word: "てんいん", reading: "てんいん", meaning: "Nhân viên cửa hàng" },
    { word: "ほんや", reading: "ほんや", meaning: "Hiệu sách" },
    { word: "～かい", reading: "かい", meaning: "Tầng ~", memoryTip: "Gắn sau số: 5かい = tầng 5." },
  ],
  grammar: [
    {
      title: "Hỏi vị trí",
      challengeLabel: "チャレンジ 1",
      pattern: "N は どこですか",
      meaningVi: "N ở đâu?",
      usage: "どこ = ở đâu. Dùng khi muốn biết vị trí đồ vật hoặc nơi chốn.",
      notes: "ここ = chỗ này · そこ = chỗ đó · あそこ = chỗ kia · どこ = ở đâu",
      examples: [
        { segments: [{ text: "トイレは どこですか。" }], vi: "Nhà vệ sinh ở đâu?" },
        { segments: [{ text: "エスカレーターは どこですか。" }], vi: "Thang cuốn ở đâu?" },
      ],
      drills: [
        {
          labelVi: "Hỏi vị trí toilet",
          modelJa: "トイレはどこですか。",
          segments: [{ text: "トイレは どこですか。" }],
          hintVi: "Thay トイレ bằng từ khác nếu muốn.",
        },
        {
          labelVi: "Hỏi vị trí ATM",
          modelJa: "ATMはどこですか。",
          segments: [{ text: "ATMは どこですか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "トイレは どこですか。" }] },
          choices: [
            "Nhà vệ sinh ở đâu?",
            "Nhà vệ sinh là gì?",
            "Nhà vệ sinh mấy giờ?",
            "Đây là nhà vệ sinh",
          ],
          answer: 0,
        },
      ],
    },
    {
      title: "Chỉ vị trí (thân mật)",
      challengeLabel: "チャレンジ 2",
      pattern: "N は ここ／そこ／あそこ です",
      meaningVi: "N ở đây / đó / đằng kia",
      usage: "ここ gần người nói; そこ gần người nghe; あそこ xa cả hai.",
      examples: [
        { segments: [{ text: "トイレは ここです。" }], vi: "Nhà vệ sinh ở đây." },
        { segments: [{ text: "ATMは そこです。" }], vi: "ATM ở đó." },
        { segments: [{ text: "エスカレーターは あそこです。" }], vi: "Thang cuốn ở đằng kia." },
      ],
      drills: [
        {
          labelVi: "Trả lời — ở đằng kia",
          modelJa: "あそこです。",
          segments: [{ text: "あそこです。" }],
          vi: "Ở đằng kia.",
        },
        {
          labelVi: "Hỏi và trả lời",
          modelJa: "トイレはどこですか。ここですよ。",
          segments: [{ text: "トイレは どこですか。" }, { text: "ここですよ。" }],
          vi: "Toilet ở đâu? — Ở đây nhé.",
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "トイレは ここです。" }] },
          choices: ["Ở đây", "Ở đó", "Ở đằng kia", "Ở đâu"],
          answer: 0,
        },
      ],
    },
    {
      title: "Chỉ vị trí (lịch sự)",
      challengeLabel: "チャレンジ 3",
      pattern: "N は こちら／そちら／あちら です",
      meaningVi: "N ở phía này / phía đó / phía kia (lịch sự)",
      usage: "こちら・そちら・あちら lịch sự hơn ここ・そこ・あそこ. どちら = phía nào / ở đâu (lịch sự).",
      notes: "どちら = ở đâu / phía nào, lịch sự hơn どこ.",
      examples: [
        { segments: [{ text: "けいたいでんわは こちらです。" }], vi: "Điện thoại di động ở phía này." },
        { segments: [{ text: "カメラは そちらです。" }], vi: "Máy ảnh ở phía đó." },
        { segments: [{ text: "レストランは あちらです。" }], vi: "Nhà hàng ở phía kia." },
      ],
      drills: [
        {
          labelVi: "Chỉ vị trí lịch sự",
          modelJa: "レストランはあちらです。",
          segments: [{ text: "レストランは あちらです。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "レストランは あちらです。" }] },
          choices: ["Ở phía kia", "Ở phía này", "Ở phía đó", "Ở đâu"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi và nói tầng",
      challengeLabel: "チャレンジ 4",
      pattern: "N は なんかいですか ／ N は ～かいです",
      meaningVi: "N ở tầng mấy? / N ở tầng ~",
      usage: "なんかい = tầng mấy. Trả lời: số + かい.",
      notes:
        "Đọc tầng: 1かい=いっかい, 2かい=にかい, 3かい=さんがい, 4かい=よんかい, 5かい=ごかい, 6かい=ろっかい, 7かい=ななかい, 8かい=はっかい, 9かい=きゅうかい, 10かい=じゅっかい, 地下1かい=ちかいっかい.",
      examples: [
        { segments: [{ text: "レストランは なんかいですか。" }], vi: "Nhà hàng ở tầng mấy?" },
        { segments: [{ text: "レストランは ５かいです。" }], vi: "Nhà hàng ở tầng 5." },
        {
          segments: [{ text: "レストランは" }, { kanji: "五", reading: "ご" }, { text: "かいです。" }],
          vi: "Nhà hàng ở tầng 5 (kanji 五 — đã xem ở tiết Số đếm).",
        },
        {
          segments: [{ text: "A：サカイでんきは なんかいですか。" }, { text: " B：よんかいです。" }],
          vi: "Sakai Denki ở tầng mấy? — Tầng 4.",
        },
      ],
      drills: [
        {
          labelVi: "Hỏi tầng nhà hàng",
          modelJa: "レストランはなんかいですか。",
          segments: [{ text: "レストランは なんかいですか。" }],
        },
        {
          labelVi: "Trả lời tầng 4",
          modelJa: "よんかいです。",
          segments: [{ text: "よんかいです。" }],
          vi: "Tầng 4.",
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "5かい を どう よみますか。" }] },
          choices: ["ごかい", "いつかい", "ごがい", "ろっかい"],
          answer: 0,
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Hỏi thang cuốn",
      situationVi: "Trong trung tâm thương mại, hỏi vị trí thang cuốn.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "すみません、エスカレーターは どこですか。" }],
          vi: "Xin lỗi, thang cuốn ở đâu ạ?",
        },
        { speaker: "B", segments: [{ text: "あそこです。" }], vi: "Ở đằng kia ạ." },
      ],
    },
    {
      title: "Hỏi nhà vệ sinh",
      situationVi: "Hỏi và được chỉ vị trí toilet.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "あのう、すみません。" }, { text: "トイレは どこですか。" }],
          vi: "Xin lỗi, nhà vệ sinh ở đâu ạ?",
        },
        {
          speaker: "B",
          segments: [{ text: "トイレですか。" }, { text: "トイレは ここですよ。" }],
          vi: "Toilet ạ? Toilet ở đây nhé.",
        },
        { speaker: "A", segments: [{ text: "どうも ありがとうございます。" }], vi: "Cảm ơn nhiều ạ." },
      ],
    },
    {
      title: "Hỏi tầng cửa hàng",
      situationVi: "Hỏi cửa hàng điện máy Sakai Denki ở tầng mấy.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "すみません、サカイでんきは なんかいですか。" }],
          vi: "Xin lỗi, Sakai Denki ở tầng mấy ạ?",
        },
        { speaker: "B", segments: [{ text: "よんかいです。" }], vi: "Tầng 4 ạ." },
        { speaker: "A", segments: [{ text: "そうですか。" }, { text: "ありがとうございます。" }], vi: "Thế à. Cảm ơn ạ." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Vị trí và tầng",
    instructionVi: "Hỏi vị trí một đồ vật, trả lời vị trí, và hỏi một cửa hàng ở tầng mấy.",
    promptJapanese:
      "すみません、___は どこですか。\n___は ___です。\n___は なんかいですか。\n___かいです。",
    expectedPattern: "どこ|ここ|そこ|あそこ|なんかい|かい",
  },
  speakingPrompt: "Hỏi và chỉ vị trí đồ vật, cửa hàng; hỏi tầng (なんかい).",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi thang cuốn",
      guideVi: "すみません、エスカレーターは どこですか。",
      modelJa: "すみません、エスカレーターはどこですか。",
      aiReply: "エスカレーターは どこですか。",
      acceptPattern: "どこですか",
      hintVi: "Hỏi: thang cuốn ở đâu?",
    },
    {
      id: 2,
      taskVi: "Trả lời vị trí",
      guideVi: "あそこです。",
      modelJa: "あそこです。",
      aiReply: "あそこです。",
      acceptPattern: "あそこ|ここ|そこ",
      hintVi: "Chỉ vị trí: ここ／そこ／あそこ.",
    },
    {
      id: 3,
      taskVi: "Hỏi toilet",
      guideVi: "トイレは どこですか。",
      modelJa: "トイレはどこですか。",
      aiReply: "トイレは どこですか。",
      acceptPattern: "トイレ.*どこ",
      hintVi: "Hỏi nhà vệ sinh.",
    },
    {
      id: 4,
      taskVi: "Hỏi tầng",
      guideVi: "レストランは なんかいですか。",
      modelJa: "レストランはなんかいですか。",
      aiReply: "なんかいですか。",
      acceptPattern: "なんかい",
      hintVi: "Hỏi tầng mấy.",
    },
    {
      id: 5,
      taskVi: "Trả lời tầng",
      guideVi: "5かいです。",
      modelJa: "5かいです。",
      aiReply: "ごかいです。",
      acceptPattern: "かいです",
      hintVi: "Trả lời số + かいです。",
      praiseVi: "Hoàn thành!",
    },
  ],
};
