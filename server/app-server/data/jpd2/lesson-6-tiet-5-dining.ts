import type { Jpd2LessonSeed } from "./types.js";

/** Bài 6 · Tiết 5 — Rủ đi ăn và chọn món */
export const lesson6Tiet5Dining: Jpd2LessonSeed = {
  orderIndex: 13,
  slug: "bai-6-tiet-5-ru-di-an-va-chon-mon",
  title: "Tiết 5 — Rủ đi ăn và chọn món",
  description: "食べに 行きます · どうですか · そうしましょう — rủ đi ăn và chọn món — Bài 6, Tiết 5.",
  objective: "Rủ bạn đi ăn, hỏi ăn gì, đề xuất món ăn và thống nhất lựa chọn.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 50,
  vocabulary: [
    { word: "ひるごはん", reading: "ひるごはん", meaning: "bữa trưa" },
    { word: "食べに行きます", reading: "たべにいきます", meaning: "đi ăn" },
    { word: "日本料理", reading: "にほんりょうり", meaning: "món Nhật" },
    { word: "りょうり", reading: "りょうり", meaning: "món ăn" },
    { word: "おいしい", reading: "おいしい", meaning: "ngon" },
    { word: "きれい", reading: "きれい", meaning: "đẹp / sạch" },
    { word: "どうですか", reading: "どうですか", meaning: "thế nào?" },
    { word: "そうしましょう", reading: "そうしましょう", meaning: "quyết định vậy nhé" },
    { word: "何を食べますか", reading: "なにをたべますか", meaning: "ăn gì?" },
    { word: "いいですね", reading: "いいですね", meaning: "hay đấy" },
    { word: "いっしょに", reading: "いっしょに", meaning: "cùng nhau" },
    { word: "そして", reading: "そして", meaning: "và / hơn nữa" },
    { word: "レストラン", reading: "レストラン", meaning: "nhà hàng" },
    { word: "コンサート", reading: "コンサート", meaning: "buổi hòa nhạc" },
    { word: "かいぎ", reading: "かいぎ", meaning: "cuộc họp" },
  ],
  grammar: [
    {
      title: "Đi để làm V",
      challengeLabel: "チャレンジ 1",
      pattern: "Vます bỏ ます + に 行きます",
      meaningVi: "Đi để làm V",
      examples: [
        { segments: [{ text: "食べに 行きます。" }], vi: "Đi ăn." },
        {
          segments: [{ text: "いっしょに 昼ごはんを 食べに 行きませんか。" }],
          vi: "Đi ăn trưa cùng tôi không?",
        },
      ],
      drills: [
        {
          labelVi: "Rủ đi ăn trưa",
          modelJa: "いっしょに昼ごはんを食べに行きませんか。",
          segments: [{ text: "いっしょに 昼ごはんを 食べに 行きませんか。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "食べに 行きます。" }] },
          choices: ["Đi ăn", "Đã ăn", "Muốn ăn", "Đang ăn"],
          answer: 0,
        },
      ],
    },
    {
      title: "N thì thế nào?",
      challengeLabel: "チャレンジ 2",
      pattern: "N は どうですか ／ そうしましょう",
      meaningVi: "N thì thế nào? / Quyết định vậy nhé",
      examples: [
        { segments: [{ text: "日本料理は どうですか。" }], vi: "Món Nhật thì thế nào?" },
        { segments: [{ text: "いいです。そうしましょう。" }], vi: "Được. Quyết định vậy nhé." },
        { segments: [{ text: "何を 食べますか。" }], vi: "Ăn gì?" },
      ],
      drills: [
        {
          labelVi: "Đề xuất món Nhật",
          modelJa: "日本料理はどうですか。",
          segments: [{ text: "日本料理は どうですか。" }],
        },
        {
          labelVi: "Đồng ý",
          modelJa: "いいです。そうしましょう。",
          segments: [{ text: "いいです。そうしましょう。" }],
        },
      ],
      quiz: [
        {
          question: { segments: [{ text: "日本料理は どうですか。" }] },
          choices: ["Món Nhật thì thế nào?", "Đã ăn món Nhật", "Ghét món Nhật", "Món Nhật rất ngon"],
          answer: 0,
        },
      ],
    },
    {
      title: "Mô tả món ăn",
      challengeLabel: "チャレンジ 3",
      pattern: "Adjです。そして Adjです",
      meaningVi: "Vừa Adj, vừa Adj",
      examples: [
        { segments: [{ text: "おいしいです。そして、きれいです。" }], vi: "Ngon. Và đẹp/sạch sẽ." },
      ],
      drills: [
        {
          labelVi: "Ngon và đẹp",
          modelJa: "おいしいです。そして、きれいです。",
          segments: [{ text: "おいしいです。そして、きれいです。" }],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "Rủ đi ăn trưa",
      situationVi: "Rủ đi ăn trưa và chọn món.",
      lines: [
        {
          speaker: "A",
          segments: [{ text: "いっしょに 昼ごはんを 食べに 行きませんか。" }],
          vi: "Đi ăn trưa cùng tôi không?",
        },
        { speaker: "B", segments: [{ text: "いいですね。何を 食べますか。" }], vi: "Hay đấy. Ăn gì?" },
        { speaker: "A", segments: [{ text: "日本料理は どうですか。" }], vi: "Món Nhật thì thế nào?" },
        { speaker: "B", segments: [{ text: "いいです。そうしましょう。" }], vi: "Được. Quyết định vậy nhé." },
      ],
    },
    {
      title: "Nhận xét món ăn",
      situationVi: "Khen món Nhật ngon và đẹp.",
      lines: [
        { speaker: "A", segments: [{ text: "日本料理は どうですか。" }], vi: "Món Nhật thế nào?" },
        { speaker: "B", segments: [{ text: "おいしいです。そして、きれいです。" }], vi: "Ngon. Và đẹp/sạch sẽ." },
      ],
    },
    {
      title: "Rủ đi chơi và có sự kiện",
      situationVi: "Hội thoại rủ đi chơi kết hợp nói về sự kiện.",
      lines: [
        { speaker: "A", segments: [{ text: "マリーさん、いっしょに コンサートに 行きませんか。" }], vi: "Mary, đi concert cùng tôi không?" },
        { speaker: "B", segments: [{ text: "いいですね。行きましょう。" }], vi: "Hay đấy. Cùng đi nào." },
        { speaker: "A", segments: [{ text: "しんじゅくで コンサートが あります。" }], vi: "Ở Shinjuku có concert." },
        { speaker: "B", segments: [{ text: "そうですか。いいですね。" }], vi: "Thế à. Hay đấy." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Rủ bạn đi chơi / đi ăn",
    instructionVi:
      "Hoàn thành hội thoại rủ bạn: mời → đồng ý → nói sự kiện; hoặc rủ đi ăn → hỏi món → quyết định.",
    promptJapanese:
      "A：___さん、いっしょに ___ませんか。\nB：いいですね。___ましょう。\nA：___で ___が あります。\nB：そうですか。いいですね。\n\n— hoặc —\n\nA：いっしょに 昼ごはんを 食べに 行きませんか。\nB：いいですね。何を 食べますか。\nA：___は どうですか。\nB：いいです。そうしましょう。",
    expectedPattern: "しませんか|ましょう|あります|食べに|どうですか|そうしましょう",
  },
  speakingPrompt: "食べに 行きませんか · どうですか · そうしましょう · いいですね.",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Rủ đi ăn trưa",
      guideVi: "いっしょに 昼ごはんを 食べに 行きませんか。",
      modelJa: "いっしょに昼ごはんを食べに行きませんか。",
      aiReply: "行きませんか。",
      acceptPattern: "食べに|行きませんか",
    },
    {
      id: 2,
      taskVi: "Hỏi ăn gì",
      guideVi: "いいですね。何を 食べますか。",
      modelJa: "いいですね。何を食べますか。",
      aiReply: "食べますか。",
      acceptPattern: "食べますか|いいですね",
    },
    {
      id: 3,
      taskVi: "Đề xuất món Nhật",
      guideVi: "日本料理は どうですか。",
      modelJa: "日本料理はどうですか。",
      aiReply: "どうですか。",
      acceptPattern: "どうですか|日本料理",
    },
    {
      id: 4,
      taskVi: "Đồng ý",
      guideVi: "いいです。そうしましょう。",
      modelJa: "いいです。そうしましょう。",
      aiReply: "そうしましょう。",
      acceptPattern: "そうしましょう",
      praiseVi: "Hoàn thành Bài 6!",
    },
  ],
};
