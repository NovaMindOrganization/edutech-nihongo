import type { Jpd1LessonSeed } from "./types.js";

/** Bài 1 · Tiết 5 — ST3 */
export const lesson3Hobby: Jpd1LessonSeed = {
  orderIndex: 4,
  slug: "bai-1-st3-so-thich",
  title: "Sở thích cá nhân",
  description: "Nói về sở thích — ST3, Tiết 5 (Bài 1).",
  objective: "Nói và hỏi sở thích; dùng しゅみは〜です, なんですか, と, も.",
  lessonType: "main",
  isBonus: false,
  estimatedMinutes: 40,
  vocabulary: [
    { word: "しゅみ", reading: "しゅみ", meaning: "Sở thích" },
    { word: "スポーツ", meaning: "Thể thao" },
    { word: "サッカー", meaning: "Bóng đá" },
    { word: "テニス", meaning: "Tennis" },
    { word: "バドミントン", meaning: "Cầu lông" },
    { word: "ゴルフ", meaning: "Golf" },
    { word: "やきゅう", reading: "やきゅう", meaning: "Bóng chày" },
    { word: "ピンポン", meaning: "Bóng bàn" },
    { word: "スケート", meaning: "Trượt băng" },
    { word: "スキー", meaning: "Trượt tuyết" },
    { word: "バスケットボール", meaning: "Bóng rổ" },
    { word: "バレーボール", meaning: "Bóng chuyền" },
    { word: "すいえい", reading: "すいえい", meaning: "Bơi lội" },
    { word: "ドライブ", meaning: "Lái xe" },
    { word: "おんがく", reading: "おんがく", meaning: "Âm nhạc" },
    { word: "え", reading: "え", meaning: "Vẽ / hội họa" },
    { word: "えいが", reading: "えいが", meaning: "Phim" },
    { word: "つり", reading: "つり", meaning: "Câu cá" },
    { word: "カラオケ", meaning: "Karaoke" },
    { word: "どくしょ", reading: "どくしょ", meaning: "Đọc sách" },
    { word: "りょこう", reading: "りょこう", meaning: "Du lịch" },
    { word: "りょうり", reading: "りょうり", meaning: "Nấu ăn" },
    { word: "なん", reading: "なん", meaning: "Cái gì" },
    { word: "あ（っ）", reading: "あっ", meaning: "A! Á!" },
    { word: "わあ、おなじですね", reading: "わあ、おなじですね", meaning: "Wow, giống nhau nhỉ" },
  ],
  grammar: [
    {
      title: "Nói sở thích",
      challengeLabel: "チャレンジ 1",
      pattern: "（わたしの）しゅみは N です",
      meaningVi: "Sở thích (của tôi) là N",
      usage: "Nói một sở thích bằng danh từ + です.",
      examples: [
        { segments: [{ text: "しゅみは サッカー です。" }], vi: "Sở thích là bóng đá." },
        { segments: [{ text: "しゅみは おんがく です。" }], vi: "Sở thích là âm nhạc." },
        { segments: [{ text: "しゅみは りょこう です。" }], vi: "Sở thích là du lịch." },
      ],
      drills: [
        {
          labelVi: "Sở thích — bóng đá",
          modelJa: "しゅみはサッカーです。",
          segments: [{ text: "しゅみは サッカー です。" }],
        },
        {
          labelVi: "Sở thích — du lịch",
          modelJa: "しゅみはりょこうです。",
          segments: [{ text: "しゅみは りょこう です。" }],
        },
        {
          labelVi: "Sở thích — đọc sách",
          modelJa: "しゅみはどくしょです。",
          segments: [{ text: "しゅみは どくしょ です。" }],
        },
      ],
    },
    {
      title: "Hỏi sở thích",
      challengeLabel: "チャレンジ 1",
      pattern: "しゅみは なん ですか",
      meaningVi: "Sở thích là gì?",
      usage: "なん = cái gì (vật/sự việc). Trả lời: N + です.",
      examples: [
        {
          segments: [
            { text: "A：しゅみは なん ですか。" },
            { text: " B：サッカー です。" },
            { text: " A：そうですか。" },
          ],
          vi: "Sở thích là gì? — Bóng đá. — Thế à.",
        },
      ],
      drills: [
        {
          labelVi: "Hỏi sở thích",
          modelJa: "しゅみはなんですか。",
          segments: [{ text: "しゅみは なん ですか。" }],
        },
        {
          labelVi: "Trả lời sở thích",
          modelJa: "すいえいです。",
          segments: [{ text: "すいえい です。" }],
          vi: "Bơi lội.",
        },
      ],
    },
    {
      title: "Hai sở thích (と)",
      challengeLabel: "チャレンジ 2",
      pattern: "しゅみは N1 と N2 です",
      meaningVi: "Sở thích là N1 và N2",
      usage: "と = và. Nối hai danh từ sở thích.",
      examples: [
        { segments: [{ text: "しゅみは りょこう と えいが です。" }], vi: "Sở thích là du lịch và phim." },
        { segments: [{ text: "しゅみは おんがく と スポーツ です。" }], vi: "Sở thích là âm nhạc và thể thao." },
      ],
      drills: [
        {
          labelVi: "Hai sở thích",
          modelJa: "しゅみはどくしょとえいがです。",
          segments: [{ text: "しゅみは どくしょ と えいが です。" }],
        },
        {
          labelVi: "Du lịch và nấu ăn",
          modelJa: "しゅみはりょこうとりょうりです。",
          segments: [{ text: "しゅみは りょこう と りょうり です。" }],
        },
      ],
    },
    {
      title: "Cũng thích (も)",
      challengeLabel: "チャレンジ 3",
      pattern: "わたしの しゅみ も N です",
      meaningVi: "Sở thích của tôi cũng là N",
      usage: "も = cũng. Dùng khi trùng sở thích.",
      examples: [
        {
          segments: [
            { text: "A：しゅみは りょうり です。" },
            { text: " B：あ、わたしの しゅみ も りょうり です。" },
          ],
          vi: "Sở thích là nấu ăn. — À, tôi cũng thích nấu ăn.",
        },
        {
          segments: [{ text: "わあ、おなじ ですね。" }],
          vi: "Wow, giống nhau nhỉ.",
        },
      ],
      drills: [
        {
          labelVi: "Sở thích giống nhau",
          modelJa: "わたしのしゅみもテニスです。",
          segments: [{ text: "わたしの しゅみ も テニス です。" }],
        },
        {
          labelVi: "Hội thoại đầy đủ",
          modelJa: "しゅみはサッカーです。あ、わたしのしゅみもサッカーです。わあ、おなじですね。",
          segments: [
            { text: "しゅみは サッカー です。" },
            { text: "あ、わたしの しゅみ も サッカー です。" },
            { text: "わあ、おなじ ですね。" },
          ],
        },
      ],
    },
  ],
  dialogues: [
    {
      title: "言ってみよう 1 — Hỏi sở thích",
      situationVi: "Hỏi sở thích bạn.",
      lines: [
        { speaker: "A", segments: [{ text: "Bさんの しゅみは なん ですか。" }], vi: "Sở thích bạn B là gì?" },
        { speaker: "B", segments: [{ text: "サッカー です。" }], vi: "Bóng đá." },
        { speaker: "A", segments: [{ text: "そうですか。" }], vi: "Thế à." },
      ],
    },
    {
      title: "言ってみよう 3 — Cùng sở thích",
      situationVi: "Phát hiện cùng sở thích.",
      lines: [
        { speaker: "A", segments: [{ text: "Bさんの しゅみは なん ですか。" }], vi: "Sở thích bạn là gì?" },
        { speaker: "B", segments: [{ text: "テニス です。" }], vi: "Tennis." },
        { speaker: "A", segments: [{ text: "あ、わたしの しゅみ も テニス です。" }, { text: "わあ、おなじ ですね。" }], vi: "À, tôi cũng thích tennis. Giống nhau nhỉ." },
      ],
    },
  ],
  kanji: [],
  finalTask: {
    title: "やってみよう — Sở thích",
    instructionVi: "Hỏi và trả lời sở thích; nói khi trùng sở thích với bạn.",
    promptJapanese: "しゅみは ___ です。\nしゅみは ___ ですか。はい、___ です。",
    expectedPattern: "しゅみ|なん|も|おなじ",
  },
  speakingPrompt: "Nói và hỏi sở thích (ST3).",
  speakingSteps: [
    {
      id: 1,
      taskVi: "Nói sở thích",
      guideVi: "しゅみは [sở thích] です。",
      modelJa: "しゅみはサッカーです。",
      aiReply: "しゅみは ___ です。",
      acceptPattern: "しゅみは.+です",
      hintVi: "Ví dụ: サッカー, りょこう, おんがく…",
    },
    {
      id: 2,
      taskVi: "Hỏi sở thích",
      guideVi: "しゅみは なん ですか。",
      modelJa: "しゅみはなんですか。",
      aiReply: "しゅみは なん ですか。",
      acceptPattern: "しゅみは.*なん",
      hintVi: "Hỏi: sở thích là gì?",
    },
    {
      id: 3,
      taskVi: "Hai sở thích",
      guideVi: "しゅみは A と B です。",
      modelJa: "しゅみはりょこうとえいがです。",
      aiReply: "しゅみは ___ と ___ です。",
      acceptPattern: "しゅみは.+と.+です",
      hintVi: "Dùng と giữa hai sở thích.",
    },
    {
      id: 4,
      taskVi: "Cũng thích",
      guideVi: "わたしの しゅみ も ___ です。",
      modelJa: "わたしのしゅみもサッカーです。",
      aiReply: "わたしの しゅみ も ___ です。",
      acceptPattern: "しゅみも.+です",
      hintVi: "Khi trùng sở thích với người khác.",
    },
  ],
};
