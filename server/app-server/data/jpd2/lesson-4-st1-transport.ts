import type { Jpd2LessonSeed } from "./types.js";

/** Bài 4 · Tiết 2 — ST1 phương tiện */
export const lesson4St1Transport: Jpd2LessonSeed = {
  orderIndex: 1,
  slug: "bai-4-st1-phuong-tien-va-thoi-gian-di-chuyen",
  title: "ST1 — Phương tiện và thời gian di chuyển",
  description: "Nói đi từ nơi này đến nơi khác bằng phương tiện gì và mất bao lâu — Bài 4, Tiết 2.",
  objective:
    "Dùng được から〜まで, phương tiện + で, ～くらいです và hỏi どのくらいですか / どのくらいかかりますか.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 55,
  vocabulary: [
    { word: "くるま", reading: "くるま", meaning: "ô tô" },
    { word: "しんかんせん", reading: "しんかんせん", meaning: "tàu Shinkansen" },
    { word: "でんしゃ", reading: "でんしゃ", meaning: "tàu điện" },
    { word: "ひこうき", reading: "ひこうき", meaning: "máy bay" },
    { word: "バス", reading: "バス", meaning: "xe buýt" },
    { word: "バイク", reading: "バイク", meaning: "xe máy" },
    { word: "あるいて", reading: "あるいて", meaning: "đi bộ" },
    { word: "えき", reading: "えき", meaning: "nhà ga" },
    { word: "～じかん", reading: "じかん", meaning: "~ tiếng" },
    { word: "～じかんはん", reading: "じかんはん", meaning: "~ tiếng rưỡi" },
    { word: "～ふん", reading: "ふん", meaning: "~ phút" },
    { word: "～ぷん", reading: "ぷん", meaning: "~ phút (biến âm)" },
    { word: "～くらい", reading: "くらい", meaning: "khoảng ~" },
    { word: "どのくらい", reading: "どのくらい", meaning: "bao lâu / khoảng bao nhiêu" },
    { word: "なんぷん", reading: "なんぷん", meaning: "mấy phút" },
    { word: "なんじかん", reading: "なんじかん", meaning: "mấy tiếng" },
    { word: "バンコク", reading: "バンコク", meaning: "Bangkok" },
    { word: "だいがく", reading: "だいがく", meaning: "đại học" },
  ],
  grammar: [
    {
      title: "Từ ~ đến ~",
      challengeLabel: "チャレンジ 1",
      pattern: "N1 から N2 まで",
      meaningVi: "Từ N1 đến N2",
      usage: "から = từ, まで = đến. ベトナムから にほんまで = từ Việt Nam đến Nhật.",
      examples: [
        { segments: [{ text: "ベトナムから にほんまで" }], vi: "Từ Việt Nam đến Nhật Bản" },
        { segments: [{ text: "うちから だいがくまで" }], vi: "Từ nhà đến đại học" },
        { segments: [{ text: "バンコクから アユタヤまで" }], vi: "Từ Bangkok đến Ayutthaya" },
      ],
      drills: [
        {
          labelVi: "Từ nhà đến trường",
          modelJa: "うちからだいがくまで",
          segments: [{ text: "うちから だいがくまで" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "うちから だいがくまで" }] },
          choices: ["Từ nhà đến trường", "Từ trường đến nhà", "Ở nhà", "Ở trường"],
          answer: 0,
        },
      ],
    },
    {
      title: "Phương tiện và thời gian",
      challengeLabel: "チャレンジ 2",
      pattern: "N1 から N2 まで 手段 で 時間 くらいです",
      meaningVi: "Từ N1 đến N2 bằng phương tiện mất khoảng thời gian",
      usage: "で chỉ phương tiện. くらい = khoảng.",
      notes:
        "1じかん, 2じかん… 1じかんはん=1h30. 15ふん=じゅうごふん. はん=30 phút trong giờ.",
      examples: [
        {
          segments: [{ text: "バンコクから アユタヤまで バスで １じかんはんくらいです。" }],
          vi: "Bangkok → Ayutthaya bằng xe buýt khoảng 1h30.",
        },
        {
          segments: [{ text: "うちから だいがくまで バイクで １じかんはんくらいです。" }],
          vi: "Nhà → trường bằng xe máy khoảng 1h30.",
        },
        {
          segments: [{ text: "うちから だいがくまで バスで ３０ぷんくらいです。" }],
          vi: "Nhà → trường bằng xe buýt khoảng 30 phút.",
        },
        {
          segments: [{ text: "ホーチミンから ダナンまで ひこうきで １じかんくらいです。" }],
          vi: "HCM → Đà Nẵng bằng máy bay khoảng 1 giờ.",
        },
        {
          segments: [{ text: "ベトナムから にほんまで ひこうきで ５じかんくらいです。" }],
          vi: "VN → Nhật bằng máy bay khoảng 5 giờ.",
        },
        {
          segments: [{ text: "うちから えきまで あるいて １５ふんくらいです。" }],
          vi: "Nhà → ga đi bộ khoảng 15 phút.",
        },
      ],
      drills: [
        {
          labelVi: "Đi bằng xe buýt 1h30",
          modelJa: "バスで1じかんはんくらいです。",
          segments: [{ text: "バスで １じかんはんくらいです。" }],
        },
        {
          labelVi: "Máy bay 5 tiếng",
          modelJa: "ひこうきで5じかんくらいです。",
          segments: [{ text: "ひこうきで ５じかんくらいです。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "バスで １じかんはんくらいです。" }] },
          choices: ["Khoảng 1h30 bằng xe buýt", "Khoảng 30 phút bằng xe buýt", "1 giờ đi bộ", "1h30 bằng máy bay"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi thời gian di chuyển",
      challengeLabel: "チャレンジ 3",
      pattern: "N1 から N2 まで どのくらいですか ／ どのくらいかかりますか",
      meaningVi: "Từ N1 đến N2 mất bao lâu?",
      usage: "どのくらいですか / どのくらいかかりますか đều hỏi thời gian.",
      examples: [
        {
          segments: [{ text: "とうきょうから アユタヤまで どのくらいですか。" }],
          vi: "Tokyo đến Ayutthaya mất bao lâu?",
        },
        { segments: [{ text: "どのくらいかかりますか。" }], vi: "Mất bao lâu ạ?" },
      ],
      drills: [
        {
          labelVi: "Hỏi thời gian",
          modelJa: "どのくらいかかりますか。",
          segments: [{ text: "どのくらいかかりますか。" }],
        },
        {
          labelVi: "Trả lời 6 tiếng",
          modelJa: "6じかんくらいです。",
          segments: [{ text: "６じかんくらいです。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Tokyo đến Ayutthaya",
      situationVi: "Hỏi thời gian đi từ Tokyo đến Ayutthaya (qua Bangkok).",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "とうきょうから アユタヤまで どのくらいですか。" }],
          vi: "Tokyo đến Ayutthaya mất bao lâu?",
        },
        {
          speaker: "B",
          segments: [{ text: "とうきょうから バンコクまで ６じかんくらいです。" }],
          vi: "Tokyo đến Bangkok khoảng 6 giờ.",
        },
        {
          speaker: "A",
          segments: [{ text: "バンコクから アユタヤまで どのくらいですか。" }],
          vi: "Bangkok đến Ayutthaya mất bao lâu?",
        },
        {
          speaker: "B",
          segments: [{ text: "バスで １じかんはんくらいです。" }],
          vi: "Bằng xe buýt khoảng 1h30.",
        },
        { speaker: "A", segments: [{ text: "そうですか。" }], vi: "Thế à." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Di chuyển",
    instructionVi: "Nói một chuyến đi: từ đâu đến đâu, bằng gì, mất khoảng bao lâu.",
    promptJapanese: "___から ___まで ___で ___くらいです。",
    expectedPattern: "から|まで|で|くらい|じかん|ぷん",
  },
  speakingPrompt: "Nói thời gian di chuyển: から〜まで, バスで, ～くらいです, どのくらいですか.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Hỏi bao lâu",
      guideVi: "どのくらいかかりますか。",
      modelJa: "どのくらいかかりますか。",
      aiReply: "どのくらいですか。",
      acceptPattern: "どのくらい",
    },
    {
      id: 2,
      taskVi: "Xe buýt 1h30",
      guideVi: "バスで １じかんはんくらいです。",
      modelJa: "バスで1じかんはんくらいです。",
      aiReply: "くらいです。",
      acceptPattern: "バス|くらい",
    },
    {
      id: 3,
      taskVi: "Máy bay 5 tiếng",
      guideVi: "ひこうきで ５じかんくらいです。",
      modelJa: "ひこうきで5じかんくらいです。",
      aiReply: "5じかんくらいです。",
      acceptPattern: "ひこうき|じかん",
    },
    {
      id: 4,
      taskVi: "Đi bộ 15 phút",
      guideVi: "あるいて １５ふんくらいです。",
      modelJa: "あるいて15ふんくらいです。",
      aiReply: "ふんくらいです。",
      acceptPattern: "あるいて|ふん",
      praiseVi: "Hoàn thành!",
    },
  ],
};
