import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new PrismaClient();

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
  const grammarPath = join(__dirname, "../data/grammar-n5.csv");
  const kanjiPath = join(
    __dirname,
    "../data/Database Kanji and Example - N5.csv",
  );

  const vocabRows = loadCsv(vocabPath);
  const grammarRows = loadCsv(grammarPath);
  const kanjiRows = loadCsv(kanjiPath);

  console.log(
    `[seed] Importing ${vocabRows.length} vocabulary, ${grammarRows.length} grammar, ${kanjiRows.length} kanji...`,
  );

  await db.vocabulary.deleteMany({ where: { jlptLevel: "N5" } });
  await db.grammar.deleteMany({ where: { jlptLevel: "N5" } });
  await db.kanji.deleteMany({ where: { jlptLevel: "N5" } });

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

  function splitMultiValue(value: string | undefined): string[] {
    if (!value || !value.trim() || value.trim() === "(không có)") return [];
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function parseKanjiExample(value: string | undefined) {
    if (!value || !value.trim()) return null;
    const match = value.match(/^(.*?)【(.*?)】(.*)$/);
    if (!match) {
      return { word: value.trim(), reading: null, meaning: value.trim() };
    }
    return {
      word: match[1].trim(),
      reading: match[2].trim() || null,
      meaning: match[3].trim() || match[1].trim(),
    };
  }

  const pendingGrammarLinks: Array<{
    grammarId: string;
    sourceLessonNumber: number | null;
  }> = [];

  const pendingKanjiLinks: Array<{
    kanjiId: string;
    sourceLessonNumber: number | null;
  }> = [];

  for (const row of kanjiRows) {
    const created = await db.kanji.upsert({
      where: { character: row.Kanji },
      create: {
        character: row.Kanji,
        hanVietPronunciation: row["Han-Viet Pronunciation"] || null,
        readingsKun: splitMultiValue(row.Kun),
        readingsOn: splitMultiValue(row.On),
        meaning: row.Meaning,
        memoryTip: row.MemoryTip || null,
        strokeCount: row.StrokeCount ? Number(row.StrokeCount) : null,
        jlptLevel: row.Level || "N5",
        radical: row["Bộ thủ chính"] || null,
        createdById: admin.id,
      },
      update: {
        hanVietPronunciation: row["Han-Viet Pronunciation"] || null,
        readingsKun: splitMultiValue(row.Kun),
        readingsOn: splitMultiValue(row.On),
        meaning: row.Meaning,
        memoryTip: row.MemoryTip || null,
        strokeCount: row.StrokeCount ? Number(row.StrokeCount) : null,
        jlptLevel: row.Level || "N5",
        radical: row["Bộ thủ chính"] || null,
      },
    });

    pendingKanjiLinks.push({
      kanjiId: created.id,
      sourceLessonNumber: row.Level === "N5" ? 1 : null,
    });

    const examples = [row["Word 1"], row["Word 2"], row["Word 3"]]
      .map((value, index) => ({
        parsed: parseKanjiExample(value),
        orderIndex: index,
      }))
      .filter((entry) => entry.parsed !== null);

    if (examples.length > 0) {
      await db.kanjiExample.createMany({
        data: examples.map(({ parsed, orderIndex }) => ({
          kanjiId: created.id,
          orderIndex,
          word: parsed!.word,
          reading: parsed!.reading,
          meaning: parsed!.meaning,
        })),
        skipDuplicates: true,
      });
    }
  }

  for (const row of grammarRows) {
    const examples =
      row.example_japanese && row.example_vi
        ? [
            {
              jp: row.example_japanese,
              reading: row.example_reading,
              vi: row.example_vi,
              en: row.example_en,
            },
          ]
        : undefined;

    const created = await db.grammar.create({
      data: {
        pattern: row.grammar,
        meaning: row.meaning_vi,
        meaningEn: row.meaning_en || null,
        structure: row.structure || null,
        grammarType: row.grammar_type || null,
        usageNote: row.usage_note || null,
        explanation: null,
        jlptLevel: row.jlpt || "N5",
        topic: null,
        exampleSentences: examples,
        sourceLesson:
          row.lesson && row.lesson !== "Extra" ? Number(row.lesson) : null,
        createdById: admin.id,
      },
    });

    pendingGrammarLinks.push({
      grammarId: created.id,
      sourceLessonNumber:
        row.lesson && row.lesson !== "Extra" ? Number(row.lesson) : null,
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
        data: vocabForLesson.map((v) => ({
          lessonId: lesson.id,
          vocabularyId: v.id,
        })),
        skipDuplicates: true,
      });
    }

    const grammarForLesson = pendingGrammarLinks.filter(
      (entry) => entry.sourceLessonNumber === num,
    );
    if (grammarForLesson.length > 0) {
      await db.lessonGrammar.createMany({
        data: grammarForLesson.map((g) => ({
          lessonId: lesson.id,
          grammarId: g.grammarId,
        })),
        skipDuplicates: true,
      });
    }
  }

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

  if (lesson1) {
    const kanjiForLesson1 = pendingKanjiLinks.filter(
      (entry) => entry.sourceLessonNumber === 1,
    );
    if (kanjiForLesson1.length > 0) {
      await db.lessonKanji.createMany({
        data: kanjiForLesson1.map((entry) => ({
          lessonId: lesson1.id,
          kanjiId: entry.kanjiId,
        })),
        skipDuplicates: true,
      });
    }
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

  console.log("[seed] Admin: admin@nihongocoach.com / Admin@123");
  console.log("[seed] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
