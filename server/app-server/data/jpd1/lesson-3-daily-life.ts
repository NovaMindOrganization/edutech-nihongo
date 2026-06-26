import type { Jpd1LessonSeed, Jpd1KanjiSeed } from "./types.js";

const weekdayKanji: Jpd1KanjiSeed[] = [
  { character: "月", hanViet: "Nguyệt", meaning: "tháng / mặt trăng", readingsOn: ["ゲツ"], readingsKun: ["つき"], examples: [{ word: "月曜日", reading: "げつようび", meaning: "thứ Hai" }] },
  { character: "火", hanViet: "Hỏa", meaning: "lửa", readingsOn: ["カ"], readingsKun: ["ひ"], examples: [{ word: "火曜日", reading: "かようび", meaning: "thứ Ba" }] },
  { character: "水", hanViet: "Thủy", meaning: "nước", readingsOn: ["スイ"], readingsKun: ["みず"], examples: [{ word: "水曜日", reading: "すいようび", meaning: "thứ Tư" }] },
  { character: "木", hanViet: "Mộc", meaning: "cây", readingsOn: ["モク"], readingsKun: ["き"], examples: [{ word: "木曜日", reading: "もくようび", meaning: "thứ Năm" }] },
  { character: "金", hanViet: "Kim", meaning: "vàng / tiền", readingsOn: ["キン"], readingsKun: ["かね"], examples: [{ word: "金曜日", reading: "きんようび", meaning: "thứ Sáu" }] },
  { character: "土", hanViet: "Thổ", meaning: "đất", readingsOn: ["ド"], readingsKun: ["つち"], examples: [{ word: "土曜日", reading: "どようび", meaning: "thứ Bảy" }] },
  { character: "曜", hanViet: "Diệu", meaning: "thứ (trong tuần)", readingsOn: ["ヨウ"], readingsKun: [], examples: [{ word: "曜日", reading: "ようび", meaning: "ngày trong tuần" }] },
  { character: "何", hanViet: "Hà", meaning: "gì", readingsOn: ["カ"], readingsKun: ["なに", "なん"], examples: [{ word: "何時", reading: "なんじ", meaning: "mấy giờ" }] },
  { character: "年", hanViet: "Niên", meaning: "năm", readingsOn: ["ネン"], readingsKun: ["とし"], examples: [{ word: "今年", reading: "ことし", meaning: "năm nay" }] },
  { character: "時", hanViet: "Thời", meaning: "giờ", readingsOn: ["ジ"], readingsKun: ["とき"], examples: [{ word: "一時", reading: "いちじ", meaning: "1 giờ" }] },
  { character: "間", hanViet: "Gian", meaning: "khoảng / giữa", readingsOn: ["カン"], readingsKun: ["あいだ"], examples: [{ word: "時間", reading: "じかん", meaning: "thời gian" }] },
  { character: "分", hanViet: "Phân", meaning: "phút", readingsOn: ["フン", "ブン"], readingsKun: ["わ"], examples: [{ word: "十分", reading: "じゅっぷん", meaning: "10 phút" }] },
];

export const lesson3DailyLife: Jpd1LessonSeed = {
  orderIndex: 4,
  slug: "cuoc-song-hang-ngay",
  title: "Bài 3: Cuộc sống hằng ngày",
  description: "Hỏi giờ, nói lịch sinh hoạt và thói quen hằng ngày.",
  objective:
    "Hỏi giờ, nói giờ mở cửa, ngày nghỉ, hoạt động hằng ngày và địa điểm.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 55,
  vocabulary: [
    { word: "ごぜん", reading: "ごぜん", meaning: "Buổi sáng (AM)" },
    { word: "ごご", reading: "ごご", meaning: "Buổi chiều (PM)" },
    { word: "ぎんこう", reading: "ぎんこう", meaning: "Ngân hàng" },
    { word: "たいいくかん", reading: "たいいくかん", meaning: "Nhà thi đấu" },
    { word: "としょかん", reading: "としょかん", meaning: "Thư viện" },
    { word: "びょういん", reading: "びょういん", meaning: "Bệnh viện" },
    { word: "ゆうびんきょく", reading: "ゆうびんきょく", meaning: "Bưu điện" },
    { word: "テスト", meaning: "Bài kiểm tra" },
    { word: "バーベキュー", meaning: "Tiệc nướng BBQ" },
    { word: "はなび", reading: "はなび", meaning: "Pháo hoa" },
    { word: "はなみ", reading: "はなみ", meaning: "Ngắm hoa" },
    { word: "さくら", reading: "さくら", meaning: "Hoa anh đào" },
    { word: "すし", reading: "すし", meaning: "Sushi" },
    { word: "おべんとう", reading: "おべんとう", meaning: "Cơm hộp" },
    { word: "おまつり", reading: "おまつり", meaning: "Lễ hội" },
    { word: "かいしゃ", reading: "かいしゃ", meaning: "Công ty" },
    { word: "コンビニ", meaning: "Cửa hàng tiện lợi" },
    { word: "ぎゅうにゅう", reading: "ぎゅうにゅう", meaning: "Sữa bò" },
    { word: "くだもの", reading: "くだもの", meaning: "Trái cây" },
    { word: "サラダ", meaning: "Salad" },
    { word: "チーズ", meaning: "Phô mai" },
    { word: "しんぶん", reading: "しんぶん", meaning: "Báo" },
    { word: "テレビ", meaning: "Tivi" },
    { word: "かいます", reading: "かいます", meaning: "mua", partOfSpeech: "verb" },
    { word: "ききます", reading: "ききます", meaning: "nghe", partOfSpeech: "verb" },
    { word: "はたらきます", reading: "はたらきます", meaning: "làm việc", partOfSpeech: "verb" },
    { word: "よみます", reading: "よみます", meaning: "đọc", partOfSpeech: "verb" },
    { word: "おきます", reading: "おきます", meaning: "thức dậy", partOfSpeech: "verb", memoryTip: "まいあさ おきます = dậy mỗi sáng." },
    { word: "ねます", reading: "ねます", meaning: "ngủ", partOfSpeech: "verb" },
    { word: "べんきょうします", reading: "べんきょうします", meaning: "học", partOfSpeech: "verb" },
    { word: "きます", reading: "きます", meaning: "đến", partOfSpeech: "verb" },
    { word: "いきます", reading: "いきます", meaning: "đi", partOfSpeech: "verb" },
    { word: "かえります", reading: "かえります", meaning: "về", partOfSpeech: "verb" },
    { word: "のみます", reading: "のみます", meaning: "uống", partOfSpeech: "verb" },
    { word: "たべます", reading: "たべます", meaning: "ăn", partOfSpeech: "verb" },
    { word: "みます", reading: "みます", meaning: "xem", partOfSpeech: "verb" },
    { word: "します", reading: "します", meaning: "làm", partOfSpeech: "verb" },
  ],
  grammar: [
    {
      title: "いま何時ですか",
      pattern: "いま 何時（なんじ）ですか",
      meaningVi: "Bây giờ là mấy giờ?",
      examples: [
        { segments: [{ text: "いま 何時ですか。" }], vi: "Bây giờ là mấy giờ?" },
        { segments: [{ text: "3じはんです。" }], vi: "3 giờ rưỡi." },
      ],
      quiz: [
        {
          question: { segments: [{ text: "ごぜん 8じ = ?" }] },
          choices: ["8 giờ sáng", "8 giờ tối", "8 phút", "8 giờ chiều"],
          answer: 0,
        },
      ],
    },
    {
      title: "N1 から N2 まで",
      pattern: "N1 から N2 まで",
      meaningVi: "từ N1 đến N2",
      examples: [
        { segments: [{ text: "ぎんこうは ごぜん9じから ごご3じまでです。" }], vi: "Ngân hàng mở từ 9h sáng đến 3h chiều." },
      ],
    },
    {
      title: "Vます",
      pattern: "動詞 + ます",
      meaningVi: "Thì lịch sự hiện tại",
      usage: "Động từ chia ます: べんきょうします, いきます.",
      examples: [
        { segments: [{ text: "まいにち、にほんごを べんきょうします。" }], vi: "Mỗi ngày tôi học tiếng Nhật." },
      ],
    },
    {
      title: "N を Vます",
      pattern: "N を Vます",
      meaningVi: "làm V với N",
      examples: [
        { segments: [{ text: "テレビを みます。" }], vi: "Tôi xem tivi." },
      ],
    },
    {
      title: "場所へ いきます",
      pattern: "場所 + へ + いきます",
      meaningVi: "đi đến địa điểm",
      examples: [
        { segments: [{ text: "がっこうへ いきます。" }], vi: "Tôi đi đến trường." },
      ],
    },
    {
      title: "まいにち / まいあさ",
      pattern: "まいにち / まいあさ / まいばん + Vます",
      meaningVi: "mỗi ngày / mỗi sáng / mỗi tối",
      examples: [
        { segments: [{ text: "まいあさ、6じに おきます。" }], vi: "Mỗi sáng tôi dậy lúc 6 giờ." },
      ],
    },
    {
      title: "Vません",
      pattern: "V + ません",
      meaningVi: "không làm V",
      examples: [
        { segments: [{ text: "きょうは べんきょうしません。" }], vi: "Hôm nay tôi không học." },
      ],
    },
    {
      title: "どこへも いきません",
      pattern: "どこへも + V + ません",
      meaningVi: "không đi đâu cả",
      examples: [
        { segments: [{ text: "どようびは どこへも いきません。" }], vi: "Thứ bảy tôi không đi đâu." },
      ],
    },
  ],
  dialogues: [
    {
      title: "Hỏi giờ mở cửa",
      situationVi: "Hỏi giờ mở cửa thư viện.",
      lines: [
        { speaker: "A", segments: [{ text: "としょかんは なんじから なんじまでですか。" }], vi: "Thư viện mở từ mấy giờ đến mấy giờ?" },
        { speaker: "B", segments: [{ text: "ごぜん8じから ごご5じまでです。" }], vi: "Từ 8h sáng đến 5h chiều." },
      ],
    },
    {
      title: "Lịch sinh hoạt",
      situationVi: "Hai bạn nói về thói quen hằng ngày.",
      lines: [
        { speaker: "A", segments: [{ text: "まいあさ、何時に おきますか。" }], vi: "Mỗi sáng bạn dậy lúc mấy giờ?" },
        { speaker: "B", segments: [{ text: "6じに おきます。" }], vi: "Tôi dậy lúc 6 giờ." },
        { speaker: "B", segments: [{ text: "それから がっこうへ いきます。" }], vi: "Sau đó tôi đi đến trường." },
        { speaker: "A", segments: [{ text: "よるは テレビを みますか。" }], vi: "Buổi tối bạn có xem tivi không?" },
        { speaker: "B", segments: [{ text: "はい、みます。11じに ねます。" }], vi: "Có, tôi xem. Tôi ngủ lúc 11 giờ." },
      ],
    },
  ],
  kanji: weekdayKanji,
  finalTask: {
    title: "Nói về lịch sinh hoạt",
    instructionVi: "Điền giờ và hoạt động của bạn vào đoạn mẫu.",
    promptJapanese:
      "まいあさ、___じに おきます。\n___じに がっこうへ いきます。\nまいにち、日本語を べんきょうします。\nよる、テレビを みます。\n___じに ねます。",
    expectedPattern: "おきます|がっこう|べんきょう|みます|ねます",
  },
  speakingPrompt: "Mô tả lịch sinh hoạt một ngày: dậy, đi học, học tiếng Nhật, xem tivi, đi ngủ.",
};
