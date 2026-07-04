import type { Jpd2KanjiSeed } from "./types.js";

/** Kanji Bài 6 — ưu tiên dữ liệu khớp N5/N4 trong hệ thống. */
export const KANJI_BAI6: Jpd2KanjiSeed[] = [
  {
    character: "今",
    hanViet: "kim",
    meaning: "bây giờ, hiện tại",
    readingsOn: ["コン", "キン"],
    readingsKun: ["いま"],
    examples: [
      { word: "今週", reading: "こんしゅう", meaning: "tuần này" },
      { word: "今月", reading: "こんげつ", meaning: "tháng này" },
      { word: "今日", reading: "きょう", meaning: "hôm nay" },
      { word: "今年", reading: "ことし", meaning: "năm nay" },
    ],
  },
  {
    character: "来",
    hanViet: "lai",
    meaning: "đến, tương lai",
    readingsOn: ["ライ"],
    readingsKun: ["く", "き"],
    examples: [
      { word: "来週", reading: "らいしゅう", meaning: "tuần sau" },
      { word: "来月", reading: "らいげつ", meaning: "tháng sau" },
      { word: "来年", reading: "らいねん", meaning: "năm sau" },
      { word: "来日", reading: "らいにち", meaning: "đến Nhật" },
    ],
  },
  {
    character: "帰",
    hanViet: "quy",
    meaning: "trở về",
    readingsOn: ["キ"],
    readingsKun: ["かえ"],
    examples: [
      { word: "帰ります", reading: "かえります", meaning: "về" },
      { word: "日帰り", reading: "ひがえり", meaning: "đi về trong ngày" },
      { word: "帰国", reading: "きこく", meaning: "về nước" },
    ],
  },
  {
    character: "会",
    hanViet: "hội",
    meaning: "gặp gỡ",
    readingsOn: ["カイ", "エ"],
    readingsKun: ["あ"],
    examples: [
      { word: "会います", reading: "あいます", meaning: "gặp" },
      { word: "会社", reading: "かいしゃ", meaning: "công ty" },
      { word: "飲み会", reading: "のみかい", meaning: "tiệc rượu" },
      { word: "会話", reading: "かいわ", meaning: "hội thoại" },
    ],
  },
  {
    character: "社",
    hanViet: "xã",
    meaning: "xã hội, công ty",
    readingsOn: ["シャ", "ジャ"],
    readingsKun: ["やしろ"],
    examples: [
      { word: "会社", reading: "かいしゃ", meaning: "công ty" },
      { word: "社会", reading: "しゃかい", meaning: "xã hội" },
      { word: "社員", reading: "しゃいん", meaning: "nhân viên công ty" },
    ],
  },
  {
    character: "聞",
    hanViet: "văn",
    meaning: "nghe",
    readingsOn: ["ブン", "モン"],
    readingsKun: ["き"],
    examples: [
      { word: "聞きます", reading: "ききます", meaning: "nghe, hỏi" },
      { word: "新聞", reading: "しんぶん", meaning: "tờ báo" },
    ],
  },
  {
    character: "読",
    hanViet: "độc",
    meaning: "đọc",
    readingsOn: ["ドク"],
    readingsKun: ["よ"],
    examples: [
      { word: "読みます", reading: "よみます", meaning: "đọc" },
      { word: "読書", reading: "どくしょ", meaning: "việc đọc sách" },
      { word: "読み物", reading: "よみもの", meaning: "tài liệu đọc" },
    ],
  },
  {
    character: "書",
    hanViet: "thư",
    meaning: "viết",
    readingsOn: ["ショ"],
    readingsKun: ["か"],
    examples: [
      { word: "書きます", reading: "かきます", meaning: "viết" },
      { word: "読書", reading: "どくしょ", meaning: "việc đọc sách" },
      { word: "辞書", reading: "じしょ", meaning: "từ điển" },
    ],
  },
  {
    character: "話",
    hanViet: "thoại",
    meaning: "nói chuyện",
    readingsOn: ["ワ"],
    readingsKun: ["はな"],
    examples: [
      { word: "話します", reading: "はなします", meaning: "nói chuyện" },
      { word: "会話", reading: "かいわ", meaning: "hội thoại" },
      { word: "電話", reading: "でんわ", meaning: "điện thoại" },
    ],
  },
  {
    character: "言",
    hanViet: "ngôn",
    meaning: "nói",
    readingsOn: ["ゲン", "ゴン"],
    readingsKun: ["い", "こと"],
    examples: [
      { word: "言います", reading: "いいます", meaning: "nói" },
      { word: "言葉", reading: "ことば", meaning: "từ vựng" },
      { word: "言語", reading: "げんご", meaning: "ngôn ngữ" },
    ],
  },
  {
    character: "貝",
    hanViet: "bối",
    meaning: "con sò",
    readingsOn: ["かい"],
    readingsKun: [],
    examples: [{ word: "貝", reading: "かい", meaning: "con sò" }],
  },
  {
    character: "田",
    hanViet: "điền",
    meaning: "ruộng",
    readingsOn: ["デン"],
    readingsKun: ["た"],
    examples: [
      { word: "田んぼ", reading: "たんぼ", meaning: "ruộng lúa" },
      { word: "水田", reading: "すいでん", meaning: "ruộng nước" },
      { word: "田中さん", reading: "たなかさん", meaning: "anh Tanaka" },
    ],
  },
  {
    character: "力",
    hanViet: "lực",
    meaning: "sức mạnh",
    readingsOn: ["リョク", "リキ"],
    readingsKun: ["ちから"],
    examples: [
      { word: "努力", reading: "どりょく", meaning: "nỗ lực" },
      { word: "力を貸します", reading: "ちからをかします", meaning: "giúp đỡ / cho mượn sức" },
    ],
  },
  {
    character: "門",
    hanViet: "môn",
    meaning: "cánh cổng",
    readingsOn: ["モン"],
    readingsKun: ["かど"],
    examples: [
      { word: "専門", reading: "せんもん", meaning: "chuyên môn" },
      { word: "大学の門", reading: "だいがくのもん", meaning: "cổng trường đại học" },
    ],
  },
  {
    character: "寺",
    hanViet: "tự",
    meaning: "chùa",
    readingsOn: ["ジ"],
    readingsKun: ["てら"],
    examples: [
      { word: "お寺", reading: "おてら", meaning: "ngôi chùa" },
      { word: "金閣寺", reading: "きんかくじ", meaning: "chùa Vàng" },
    ],
  },
];

/** Kanji mới Bài 7 (không trùng Bài 6). */
export const KANJI_BAI7: Jpd2KanjiSeed[] = [
  {
    character: "肉",
    hanViet: "nhục",
    meaning: "thịt",
    readingsOn: ["ニク"],
    readingsKun: [],
    examples: [
      { word: "牛肉", reading: "ぎゅうにく", meaning: "thịt bò" },
      { word: "豚肉", reading: "ぶたにく", meaning: "thịt heo" },
      { word: "鶏肉", reading: "とりにく", meaning: "thịt gà" },
    ],
  },
  {
    character: "料",
    hanViet: "liệu",
    meaning: "nguyên liệu, phí",
    readingsOn: ["リョウ"],
    readingsKun: [],
    examples: [
      { word: "料理", reading: "りょうり", meaning: "món ăn / nấu ăn" },
      { word: "料金", reading: "りょうきん", meaning: "phí, giá" },
    ],
  },
  {
    character: "理",
    hanViet: "lý",
    meaning: "lý lẽ",
    readingsOn: ["リ"],
    readingsKun: [],
    examples: [
      { word: "料理", reading: "りょうり", meaning: "món ăn" },
      { word: "理由", reading: "りゆう", meaning: "lý do" },
    ],
  },
  {
    character: "野",
    hanViet: "dã",
    meaning: "cánh đồng, hoang dã",
    readingsOn: ["ヤ"],
    readingsKun: ["の"],
    examples: [
      { word: "野菜", reading: "やさい", meaning: "rau củ" },
      { word: "野原", reading: "のはら", meaning: "cánh đồng" },
    ],
  },
  {
    character: "半",
    hanViet: "bán",
    meaning: "một nửa",
    readingsOn: ["ハン"],
    readingsKun: ["なか"],
    examples: [
      { word: "1時半", reading: "いちじはん", meaning: "1 giờ rưỡi" },
      { word: "半分", reading: "はんぶん", meaning: "một nửa" },
      { word: "半額", reading: "はんがく", meaning: "nửa giá" },
    ],
  },
  {
    character: "大",
    hanViet: "đại",
    meaning: "lớn",
    readingsOn: ["ダイ", "タイ"],
    readingsKun: ["おお"],
    examples: [
      { word: "大学", reading: "だいがく", meaning: "đại học" },
      { word: "大きい", reading: "おおきい", meaning: "to, lớn" },
      { word: "大人", reading: "おとな", meaning: "người lớn" },
    ],
  },
  {
    character: "小",
    hanViet: "tiểu",
    meaning: "nhỏ",
    readingsOn: ["ショウ"],
    readingsKun: ["ちい", "こ", "お"],
    examples: [
      { word: "小学生", reading: "しょうがくせい", meaning: "học sinh tiểu học" },
      { word: "小さい", reading: "ちいさい", meaning: "nhỏ" },
    ],
  },
];
