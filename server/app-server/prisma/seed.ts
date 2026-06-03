import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new PrismaClient();

// --- Dán hàm này bên ngoài hàm main() của prisma/seed.ts ---
async function seedRadicals(adminId: string) {
  const filePath = join(__dirname, "../data/214 Bộ Thủ Hán Tự Đầy Đủ.csv");
  const fileContent = readFileSync(filePath, "utf8");
  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");
  const dataLines = lines.slice(1);

  // Xóa dữ liệu cũ của bảng Radical trước khi nạp mới
  await db.radical.deleteMany({});
  console.log("[seed] Cleared existing radicals.");

  const radicals = [];
  for (const line of dataLines) {
    const cols = parseCsvLine(line.trim()); // Dùng luôn hàm parseCsvLine đã có sẵn ở đầu file seed.ts của bạn
    if (cols.length < 5) continue;

    const radicalIdStr = cols[0];
    const character = cols[1];
    const sinoVietnamese = cols[2];
    const meaning = cols[3];
    const strokeCount = parseInt(cols[4], 10);

    const radicalIndexMatch = radicalIdStr.match(/\d+/);
    if (!radicalIndexMatch) continue;

    const radicalIndex = parseInt(radicalIndexMatch[0], 10);

    radicals.push({
      radicalIndex,
      character,
      sinoVietnamese,
      meaning,
      strokeCount,
    });
  }

  // Khuyên dùng: Sử dụng createMany để đẩy data cực nhanh
  await db.radical.createMany({
    data: radicals,
  });

  console.log(`[seed] Seeded ${radicals.length} radicals successfully.`);
}

// --- Dán hàm này phía trên hàm main() của prisma/seed.ts ---
async function seedKanji(
  adminId: string,
  lessons: { id: string; orderIndex: number }[],
) {
  const kanjiPath = join(
    __dirname,
    "../data/Database_Kanji_and_Example_N5_Updated.csv",
  );
  const kanjiRows = loadCsv(kanjiPath);

  console.log(
    `[seed] Found ${kanjiRows.length} kanji rows in CSV. Processing...`,
  );

  let updatedKanjiCount = 0;

  function parseStrokeCount(value: string | undefined) {
    const raw = (value ?? "").trim();
    if (!raw) return null;

    const parsed = Number.parseFloat(raw.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return null;

    const normalized = Math.round(parsed);
    if (normalized < 1 || normalized > 80) return null;

    return normalized;
  }

  for (const row of kanjiRows) {
    const character = (row.Kanji || row.kanji || row.Character || "").trim();
    if (!character) continue;

    const targetKanji = await db.kanji.findFirst({ where: { character } });
    if (!targetKanji) continue;

    const updateData: {
      hanVietPronunciation?: string | null;
      strokeCount?: number | null;
    } = {};

    const hanVietPronunciation = (row["Han-Viet Pronunciation"] || "").trim();
    if (hanVietPronunciation && !targetKanji.hanVietPronunciation?.trim()) {
      updateData.hanVietPronunciation = hanVietPronunciation;
    }

    const parsedStrokeCount = parseStrokeCount(row.StrokeCount);
    if (
      parsedStrokeCount !== null &&
      Number.isFinite(parsedStrokeCount) &&
      targetKanji.strokeCount !== parsedStrokeCount
    ) {
      updateData.strokeCount = parsedStrokeCount;
    }

    if (Object.keys(updateData).length > 0) {
      await db.kanji.update({
        where: { id: targetKanji.id },
        data: updateData,
      });
      updatedKanjiCount += 1;
    }
  }

  console.log(
    `[seed] Updated ${updatedKanjiCount} kanji rows from Updated CSV.`,
  );
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

function loadCsv(path: string): Record<string, string>[] {
  const raw = readFileSync(path, "utf-8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((h, i) => [h.trim(), (cols[i] ?? "").trim()]),
    );
  });
}

async function main() {
  console.log("[seed] Starting...");

  const configs = [
    {
      key: "default_pass_threshold",
      value: "70",
      description: "Default MiniTest pass percentage",
    },
    {
      key: "guest_dict_rate_limit",
      value: "20",
      description: "Dictionary searches per hour for guests",
    },
    {
      key: "ai_speaking_daily_limit",
      value: "50",
      description: "Max AI speaking messages per day",
    },
    {
      key: "maintenance_mode",
      value: "false",
      description: "Toggle maintenance mode",
    },
  ];

  for (const c of configs) {
    await db.systemConfig.upsert({
      where: { key: c.key },
      create: c,
      update: { value: c.value, description: c.description },
    });
  }

  const adminHash = await bcrypt.hash("Admin@123", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@nihongocoach.com" },
    create: {
      email: "admin@nihongocoach.com",
      passwordHash: adminHash,
      role: "admin",
      displayName: "Admin",
    },
    update: { passwordHash: adminHash, role: "admin" },
  });

  const vocabPath = join(__dirname, "../data/vocabulary-n5.csv");

  const vocabRows = loadCsv(vocabPath);

  console.log(
    `[seed] Importing ${vocabRows.length} vocabulary, sample grammar...`,
  );

  await db.vocabulary.deleteMany({ where: { jlptLevel: "N5" } });
  await db.grammar.deleteMany({ where: { jlpt: "N5" } });

  const vocabBatchSize = 100;
  for (let i = 0; i < vocabRows.length; i += vocabBatchSize) {
    const batch = vocabRows.slice(i, i + vocabBatchSize);
    await db.vocabulary.createMany({
      data: batch.map((row) => ({
        word: row.word,
        reading: row.reading || null,
        meaning: row.meaning_vi,
        meaningEn: row.meaning_en || null,
        jlptLevel: row.jlpt || "N5",
        partOfSpeech: row.type || null,
        topic: row.type || null,
        createdById: admin.id,
      })),
    });
  }

  let course = await db.course.findFirst({
    where: { jlptLevel: "N5", title: "Japanese N5 — Complete Course" },
  });
  if (!course) {
    course = await db.course.create({
      data: {
        title: "Japanese N5 — Complete Course",
        jlptLevel: "N5",
        description:
          "Start your Japanese journey from absolute beginner to JLPT N5.",
        isPublished: true,
        createdById: admin.id,
      },
    });
  } else {
    course = await db.course.update({
      where: { id: course.id },
      data: { isPublished: true },
    });
  }

  const lessonTitles: Record<number, string> = {
    1: "Bài 1: Chào hỏi cơ bản",
    2: "Bài 2: Đồ vật",
    3: "Bài 3: Địa điểm",
    4: "Bài 4: Tính từ",
    5: "Bài 5: Thời gian",
  };

  const lessonNumbers = [
    ...new Set(
      vocabRows.map((r) => Number(r.lesson)).filter((n) => !Number.isNaN(n)),
    ),
  ].sort((a, b) => a - b);

  await db.lesson.deleteMany({ where: { courseId: course.id } });

  const lessons: { id: string; orderIndex: number }[] = [];
  for (const num of lessonNumbers.slice(0, 25)) {
    const lesson = await db.lesson.create({
      data: {
        courseId: course.id,
        title: lessonTitles[num] ?? `Bài ${num}`,
        orderIndex: num,
        passThreshold: 70,
      },
    });
    lessons.push({ id: lesson.id, orderIndex: num });

    await db.vocabulary.updateMany({
      where: {
        jlptLevel: "N5",
        word: {
          in: vocabRows
            .filter((r) => Number(r.lesson) === num)
            .map((r) => r.word),
        },
      },
      data: { courseId: course.id, lessonId: lesson.id },
    });

    const vocabForLesson = await db.vocabulary.findMany({
      where: { lessonId: lesson.id },
      select: { id: true },
    });
    if (vocabForLesson.length > 0) {
      await db.lessonVocabulary.createMany({
        data: vocabForLesson.map((v: { id: string }) => ({
          lessonId: lesson.id,
          vocabularyId: v.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  const lessonIdByNumber = new Map(lessons.map((l) => [l.orderIndex, l.id]));
  const grammarSamples = [
    {
      lessonNumber: 1,
      order: 1,
      title: "Câu khẳng định danh từ",
      jlpt: "N5",
      type: "basic",
      pattern: "N1 は N2 です。",
      meaningVi: "N1 là N2",
      usage: "Dùng để giới thiệu hoặc khẳng định.",
      notes: "は đọc là 'wa'.",
      examples: [
        { jp: "わたしは学生です。", vi: "Tôi là học sinh." },
        { jp: "キムさんは先生です。", vi: "Anh Kim là giáo viên." },
      ],
      quiz: [
        {
          question: "わたし ___ 学生です。",
          choices: ["は", "を", "に"],
          answer: 0,
        },
      ],
    },
    {
      lessonNumber: 1,
      order: 2,
      title: "Câu hỏi danh từ",
      jlpt: "N5",
      type: "basic",
      pattern: "N1 は N2 ですか。",
      meaningVi: "N1 có phải là N2 không?",
      usage: "Dùng để hỏi xác nhận thông tin.",
      notes: "か dùng ở cuối câu hỏi.",
      examples: [
        { jp: "あなたは学生ですか。", vi: "Bạn là học sinh không?" },
        {
          jp: "ミラーさんは先生ですか。",
          vi: "Anh Miller là giáo viên không?",
        },
      ],
      quiz: [
        {
          question: "ミラーさん ___ 先生ですか。",
          choices: ["は", "を", "に"],
          answer: 0,
        },
      ],
    },
    {
      lessonNumber: 2,
      order: 1,
      title: "Câu phủ định danh từ",
      jlpt: "N5",
      type: "basic",
      pattern: "N1 は N2 じゃありません。",
      meaningVi: "N1 không phải là N2.",
      usage: "Dùng để phủ định danh từ.",
      notes: "じゃありません là dạng phủ định lịch sự.",
      examples: [
        { jp: "わたしは先生じゃありません。", vi: "Tôi không phải giáo viên." },
        { jp: "ここは図書館じゃありません。", vi: "Đây không phải thư viện." },
      ],
      quiz: [
        {
          question: "わたしは先生 ___ 。",
          choices: ["じゃありません", "です", "でした"],
          answer: 0,
        },
      ],
    },
  ];

  for (const sample of grammarSamples) {
    const lessonId = lessonIdByNumber.get(sample.lessonNumber) ?? null;
    const created = await db.grammar.create({
      data: {
        title: sample.title,
        jlpt: sample.jlpt,
        type: sample.type,
        pattern: sample.pattern,
        meaningVi: sample.meaningVi,
        usage: sample.usage,
        notes: sample.notes,
        lessonId,
        order: sample.order,
        examples: sample.examples,
        quiz: sample.quiz,
        createdById: admin.id,
      },
    });

    if (lessonId) {
      await db.lessonGrammar.create({
        data: { lessonId, grammarId: created.id },
      });
    }
  }

  // Seed Kanji from CSV and link to lessons
  await seedKanji(admin.id, lessons);

  console.log(
    `[seed] Created ${lessons.length} lessons for course ${course.title}`,
  );

  // Mini-test questions from lesson vocabulary (3 MC per lesson)
  for (const lesson of lessons) {
    const vocab = await db.vocabulary.findMany({
      where: { lessonId: lesson.id, jlptLevel: "N5" },
      take: 3,
    });
    for (const v of vocab) {
      const q = await db.question.create({
        data: {
          questionText: `「${v.word}」の意味は？`,
          questionType: "multiple_choice",
          options: [
            { label: "A", text: v.meaning },
            { label: "B", text: " sai" },
            { label: "C", text: "わからない" },
          ],
          correctAnswer: v.meaning,
          jlptLevel: "N5",
          questionCategory: "文字語彙",
          createdById: admin.id,
        },
      });
      await db.lessonQuestion.create({
        data: { lessonId: lesson.id, questionId: q.id },
      });
    }
  }

  const dialogue1 = await db.conversation.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Chào hỏi — Bài 1",
      jlptLevel: "N5",
      dialogue: [
        {
          speaker: "A",
          text: "こんにちは。",
          reading: "konnichiwa",
          translation: "Xin chào.",
        },
        {
          speaker: "B",
          text: "こんにちは。はじめまして。",
          reading: "konnichiwa. hajimemashite.",
          translation: "Xin chào. Rất vui được gặp.",
        },
        {
          speaker: "A",
          text: "わたしは田中です。",
          reading: "watashi wa Tanaka desu.",
          translation: "Tôi là Tanaka.",
        },
      ],
      createdById: admin.id,
    },
    update: {},
  });

  const lesson1 = lessons.find((l) => l.orderIndex === 1);
  if (lesson1) {
    await db.lesson.update({
      where: { id: lesson1.id },
      data: {
        speakingPrompt:
          "Luyện chào hỏi và giới thiệu tên. Dùng です/ます. Gợi ý từ: こんにちは、はじめまして、わたしは〜です。",
      },
    });
    await db.lessonConversation.upsert({
      where: {
        lessonId_conversationId: {
          lessonId: lesson1.id,
          conversationId: dialogue1.id,
        },
      },
      create: { lessonId: lesson1.id, conversationId: dialogue1.id },
      update: {},
    });
  }

  // Placement + mock exam pool
  await db.placementQuestion.deleteMany();
  const placementQs = await db.question.findMany({ take: 15 });
  for (let i = 0; i < placementQs.length; i++) {
    await db.placementQuestion.create({
      data: { questionId: placementQs[i].id, sortOrder: i },
    });
  }

  let mockExam = await db.mockExam.findFirst({
    where: { jlptLevel: "N5", title: "JLPT N5 Mock Exam" },
  });
  if (!mockExam) {
    mockExam = await db.mockExam.create({
      data: {
        title: "JLPT N5 Mock Exam",
        jlptLevel: "N5",
        durationMinutes: 90,
        createdById: admin.id,
      },
    });
  }

  const examId = mockExam.id;
  const allQ = await db.question.findMany({
    where: { jlptLevel: "N5" },
    take: 20,
  });
  for (const q of allQ) {
    await db.mockExamQuestion.upsert({
      where: {
        mockExamId_questionId: { mockExamId: examId, questionId: q.id },
      },
      create: {
        mockExamId: examId,
        questionId: q.id,
        section: q.questionCategory ?? "文字語彙",
      },
      update: {},
    });
  }

  await db.systemConfig.upsert({
    where: { key: "llm_system_prompt" },
    create: {
      key: "llm_system_prompt",
      value:
        'You are a friendly Japanese language tutor. Respond in Japanese appropriate to student level. Return ONLY valid JSON: {"AI_Reply": "...", "Correction": "...or null"}',
    },
    update: {},
  });

  const { enrollAndInitProgress } =
    await import("../services/lesson.service.js");
  await enrollAndInitProgress(admin.id, course.id);
  console.log("[seed] Admin enrolled in N5 course (test student flows)");

  await db.studySet.updateMany({
    where: { isPublic: true },
    data: { moderationStatus: "approved", moderatedAt: new Date() },
  });

  await seedRadicals(admin.id);

  console.log("[seed] Admin: admin@nihongocoach.com / Admin@123");
  console.log("[seed] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
