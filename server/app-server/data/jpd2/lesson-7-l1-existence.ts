import type { Jpd2LessonSeed } from "./types.js";

/** Bài 7 · Tiết 1 — Tồn tại và vị trí */
export const lesson7L1Existence: Jpd2LessonSeed = {
  orderIndex: 15,
  slug: "bai-7-l1-ton-tai",
  title: "Tiết 1 — Có ai/cái gì ở đâu?",
  description: "N に N が あります/います — chỉ sự tồn tại và vị trí — Bài 7, Tiết 1.",
  objective: 'Sử dụng thành thạo cấu trúc "Có cái gì/ai đó ở đâu".',
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "改札", reading: "かいさつ", meaning: "cổng soát vé" },
    { word: "木", reading: "き", meaning: "cây, gỗ" },
    { word: "交番", reading: "こうばん", meaning: "đồn cảnh sát" },
    { word: "自動販売機", reading: "じどうはんばいき", meaning: "máy bán hàng tự động" },
    { word: "ポスト", reading: "ぽすと", meaning: "hộp thư" },
    { word: "花", reading: "はな", meaning: "hoa" },
    { word: "犬", reading: "いぬ", meaning: "con chó" },
    { word: "猫", reading: "ねこ", meaning: "con mèo" },
    { word: "椅子", reading: "いす", meaning: "cái ghế" },
    { word: "テーブル", reading: "テーブル", meaning: "cái bàn" },
    { word: "冷蔵庫", reading: "れいぞうこ", meaning: "tủ lạnh" },
    { word: "教室", reading: "きょうしつ", meaning: "lớp học" },
    { word: "学生", reading: "がくせい", meaning: "học sinh / sinh viên" },
    { word: "男の人", reading: "おとこのひと", meaning: "người đàn ông" },
    { word: "あります", reading: "あります", meaning: "có (vật)" },
    { word: "います", reading: "います", meaning: "có (người/vật sống)" },
    { word: "どこ", reading: "どこ", meaning: "ở đâu" },
  ],
  grammar: [
    {
      title: "Có N (vật / người)",
      challengeLabel: "チャレンジ 1",
      pattern: "N が あります ／ N が います",
      meaningVi: "Có N...",
      usage: "あります = vật. います = người, động vật.",
      examples: [
        { segments: [{ text: "椅子が あります。" }], vi: "Có cái ghế." },
        { segments: [{ text: "犬が います。" }], vi: "Có con chó." },
      ],
      drills: [
        { labelVi: "Có ghế", modelJa: "椅子があります。", segments: [{ text: "椅子が あります。" }] },
        { labelVi: "Có chó", modelJa: "犬がいます。", segments: [{ text: "犬が います。" }] },
      ],
      quiz: [
        {
          question: { segments: [{ text: "犬が います。" }] },
          choices: ["Có con chó", "Có cái ghế", "Không có chó", "Chó đã đi"],
          answer: 0,
        },
      ],
    },
    {
      title: "Ở đâu có N",
      challengeLabel: "チャレンジ 2",
      pattern: "Địa điểm に N が あります/います",
      meaningVi: "Ở địa điểm có N",
      examples: [
        { segments: [{ text: "教室に 学生が います。" }], vi: "Có học sinh trong lớp." },
        { segments: [{ text: "教室に 男の人が ４人 います。" }], vi: "Có 4 người đàn ông trong lớp." },
        { segments: [{ text: "駅に 自動販売機が あります。" }], vi: "Ở ga có máy bán hàng tự động." },
      ],
      drills: [
        {
          labelVi: "Có học sinh trong lớp",
          modelJa: "教室に学生がいます。",
          segments: [{ text: "教室に 学生が います。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "教室に 学生が います。" }] },
          choices: ["Có học sinh trong lớp", "Học sinh đi lớp", "Lớp không có ai", "Học sinh ở nhà"],
          answer: 0,
        },
      ],
    },
    {
      title: "Hỏi vị trí",
      challengeLabel: "チャレンジ 3",
      pattern: "N は どこに ありますか",
      meaningVi: "N ở đâu?",
      examples: [
        { segments: [{ text: "ポストは どこに ありますか。" }], vi: "Hộp thư ở đâu?" },
        { segments: [{ text: "交番は どこに ありますか。" }], vi: "Đồn cảnh sát ở đâu?" },
      ],
      drills: [
        {
          labelVi: "Hỏi hộp thư",
          modelJa: "ポストはどこにありますか。",
          segments: [{ text: "ポストは どこに ありますか。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Tìm hộp thư",
      situationVi: "Hỏi vị trí hộp thư trên phố.",
      lines: [
        { speaker: "A", segments: [{ text: "すみません。ポストは どこに ありますか。" }], vi: "Xin lỗi. Hộp thư ở đâu?" },
        { speaker: "B", segments: [{ text: "あそこに あります。" }], vi: "Ở đằng kia." },
      ],
    },
    {
      title: "Trong lớp học",
      situationVi: "Mô tả người trong lớp.",
      lines: [
        { speaker: "A", segments: [{ text: "教室に だれが いますか。" }], vi: "Trong lớp có ai?" },
        { speaker: "B", segments: [{ text: "男の人が ４人 います。" }], vi: "Có 4 người đàn ông." },
      ],
    },
    {
      title: "Trong nhà bạn",
      situationVi: "Vào nhà bạn, thấy chó và ghế.",
      lines: [
        { speaker: "A", segments: [{ text: "いぬが いますね。" }], vi: "Có chó nhỉ." },
        { speaker: "B", segments: [{ text: "はい。テーブルの となりに いすが あります。" }], vi: "Vâng. Bên cạnh bàn có ghế." },
      ],
    },
  ],
  kanji: [],
  speakingPrompt: "あります/います · どこに ありますか · 教室に 学生が います.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Có ghế",
      guideVi: "椅子が あります。",
      modelJa: "椅子があります。",
      aiReply: "あります。",
      acceptPattern: "あります|椅子",
    },
    {
      id: 2,
      taskVi: "Có chó",
      guideVi: "犬が います。",
      modelJa: "犬がいます。",
      aiReply: "います。",
      acceptPattern: "います|犬",
    },
    {
      id: 3,
      taskVi: "Hỏi hộp thư",
      guideVi: "ポストは どこに ありますか。",
      modelJa: "ポストはどこにありますか。",
      aiReply: "ありますか。",
      acceptPattern: "どこに|ありますか",
      praiseVi: "Hoàn thành!",
    },
  ],
};
