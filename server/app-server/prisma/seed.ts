import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcrypt";
import { PrismaClient, type User, type UserRole } from "@prisma/client";

import { N4_COURSE_TITLE, N4_LESSON_TITLES } from "../data/n4-lesson-titles.js";
import { N5_LESSON_TITLES } from "../data/n5-lesson-titles.js";
import { seedKanjiN4FromCsv } from "../scripts/seed-kanji-n4-from-csv.js";
import { seedKanjiN5FromCsv } from "../scripts/seed-kanji-n5-from-csv.js";
import {
  DEFAULT_N4_VOCAB_CSV,
  seedN4VocabularyFromCsv,
} from "../scripts/seed-vocabulary-n4-from-csv.js";
import {
  DEFAULT_N5_VOCAB_CSV,
  lessonNumbersFromVocabRows,
  loadCsvStream,
  seedN5VocabularyFromCsv,
} from "../scripts/seed-vocabulary-n5-from-csv.js";

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

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

function parseJsonField(value: string | undefined) {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  return JSON.parse(raw);
}

async function seedGrammarFromCsv(
  adminId: string,
  lessons: { id: string; orderIndex: number }[],
) {
  const grammarPath = join(__dirname, "../data/grammar-n5vsn4.csv");
  const grammarRows = loadCsv(grammarPath);
  const lessonIdByNumber = new Map(
    lessons.map((lesson) => [lesson.orderIndex, lesson.id]),
  );
  const jlptLevels = [
    ...new Set(grammarRows.map((row) => (row.jlpt ?? "").trim()).filter(Boolean)),
  ];

  if (jlptLevels.length > 0) {
    const existingGrammar = await db.grammar.findMany({
      where: { jlpt: { in: jlptLevels } },
      select: { id: true },
    });

    if (existingGrammar.length > 0) {
      await db.lessonGrammar.deleteMany({
        where: { grammarId: { in: existingGrammar.map((row) => row.id) } },
      });
    }

    await db.grammar.deleteMany({ where: { jlpt: { in: jlptLevels } } });
  }

  let created = 0;
  let linked = 0;

  for (const row of grammarRows) {
    const lessonNumber = Number.parseInt(row.lesson ?? "", 10);
    const order = Number.parseInt(row.order ?? "", 10);

    if (!Number.isInteger(lessonNumber) || !Number.isInteger(order)) {
      throw new Error(`Invalid lesson/order in grammar row: ${JSON.stringify(row)}`);
    }

    const title = (row.title ?? "").trim();
    const jlpt = (row.jlpt ?? "").trim();
    const pattern = (row.pattern ?? "").trim();
    const meaningVi = (row.meaning_vi ?? "").trim();

    if (!title || !jlpt || !pattern || !meaningVi) {
      throw new Error(`Missing required grammar data in row: ${JSON.stringify(row)}`);
    }

    const lessonId = lessonIdByNumber.get(lessonNumber) ?? null;
    const createdGrammar = await db.grammar.create({
      data: {
        title,
        jlpt,
        type: row.type || null,
        pattern,
        meaningVi,
        usage: row.usage || null,
        notes: row.notes || null,
        examples: parseJsonField(row.examples),
        quiz: parseJsonField(row.quiz),
        lessonId,
        order,
        createdById: adminId,
      },
    });
    created++;

    if (lessonId) {
      await db.lessonGrammar.create({
        data: { lessonId, grammarId: createdGrammar.id },
      });
      linked++;
    }
  }

  console.log(
    `[seed] Imported ${created} grammar rows from grammar-n5vsn4.csv, linked ${linked} to lessons.`,
  );
}

async function seedConversationsFromCsv(
  adminId: string,
  lessons: { id: string; orderIndex: number }[],
  filenames: string[],
) {
  const conversationRows: Record<string, string>[] = filenames.flatMap((filename) =>
    loadCsv(join(__dirname, "../data", filename)),
  );
  const lessonIdByNumber = new Map(
    lessons.map((lesson) => [lesson.orderIndex, lesson.id]),
  );
  const jlptLevels = [
    ...new Set(
      conversationRows.map((row) => (row.jlpt ?? "").trim()).filter(Boolean),
    ),
  ];

  if (jlptLevels.length > 0) {
    const existingConversations = await db.conversation.findMany({
      where: { jlptLevel: { in: jlptLevels } },
      select: { id: true },
    });

    if (existingConversations.length > 0) {
      await db.lessonConversation.deleteMany({
        where: {
          conversationId: { in: existingConversations.map((row) => row.id) },
        },
      });
    }

    await db.conversation.deleteMany({
      where: { jlptLevel: { in: jlptLevels } },
    });
  }

  let created = 0;
  let linked = 0;

  for (const row of conversationRows) {
    const lessonNumber = Number.parseInt(row.lessonId ?? "", 10);
    const title = (row.title ?? "").trim();
    const jlptLevel = (row.jlpt ?? "").trim();

    if (!Number.isInteger(lessonNumber) || !title || !jlptLevel) {
      throw new Error(
        `Missing required conversation data in row: ${JSON.stringify(row)}`,
      );
    }

    const lessonId = lessonIdByNumber.get(lessonNumber) ?? null;
    const createdConversation = await db.conversation.create({
      data: {
        title,
        jlptLevel,
        dialogue: parseJsonField(row.turns),
        createdById: adminId,
      },
    });
    created++;

    if (lessonId) {
      await db.lessonConversation.create({
        data: { lessonId, conversationId: createdConversation.id },
      });
      linked++;
    }
  }

  console.log(
    `[seed] Imported ${created} conversations from ${filenames.join(", ")}, linked ${linked} to lessons.`,
  );
}

async function seedStudySets(ownerId: string) {
  const existing = await db.studySet.count({ where: { ownerId } });
  if (existing > 0) {
    console.log("[seed] Study sets already exist, skipping sample sets.");
    return;
  }

  const sampleSet = await db.studySet.create({
    data: {
      ownerId,
      title: "N5 Cộng đồng — Từ vựng & Ngữ pháp",
      description: "Bộ mẫu hỗn hợp từ vựng và ngữ pháp JLPT N5 cho cộng đồng.",
      isPublic: true,
      moderationStatus: "approved",
      moderatedAt: new Date(),
      tags: ["N5", "vocabulary", "grammar"],
      items: {
        create: [
          {
            contentType: "vocabulary",
            orderIndex: 0,
            content: {
              word: "こんにちは",
              reading: "konnichiwa",
              meaning: "Xin chào",
              exampleSentence: "こんにちは、元気ですか。",
              exampleTranslation: "Xin chào, bạn khỏe không?",
            },
          },
          {
            contentType: "vocabulary",
            orderIndex: 1,
            content: {
              word: "ありがとう",
              reading: "arigatou",
              meaning: "Cảm ơn",
            },
          },
          {
            contentType: "grammar",
            orderIndex: 2,
            content: {
              title: "です / だ",
              pattern: "A は B です",
              meaningVi: "A là B (lịch sự)",
              examples: [
                { jp: "私は学生です。", vi: "Tôi là học sinh." },
              ],
            },
          },
          {
            contentType: "kanji",
            orderIndex: 3,
            content: {
              character: "日",
              meaning: "ngày, mặt trời",
              readingsOn: ["ニチ", "ジツ"],
              readingsKun: ["ひ", "か"],
              hanViet: "nhật",
              examples: [{ word: "日本", reading: "にほん", meaning: "Nhật Bản" }],
            },
          },
        ],
      },
    },
  });

  try {
    const { generateAndStoreStudySetQuiz } =
      await import("../services/study-set-quiz.service.js");
    await generateAndStoreStudySetQuiz(sampleSet.id);
    console.log("[seed] Generated AI quiz for sample study set.");
  } catch (err) {
    console.warn("[seed] Quiz generation skipped (AI server may be offline):", err);
  }

  console.log("[seed] Created sample public study set.");
}

const TEST_USER_PASSWORD = "Student@123";

async function upsertSeedUser(
  email: string,
  password: string,
  role: UserRole,
  displayName: string,
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 12);
  return db.user.upsert({
    where: { email },
    create: { email, passwordHash, role, displayName },
    update: { passwordHash, role, displayName },
  });
}

async function seedDemoAccounts(options: {
  n5CourseId: string;
  n4CourseId: string;
  adminId: string;
}) {
  const { enrollAndInitProgress } =
    await import("../services/lesson.service.js");

  const instructor = await upsertSeedUser(
    "instructor@nihongocoach.com",
    "Instructor@123",
    "instructor",
    "Giảng viên Demo",
  );

  const studentN5 = await upsertSeedUser(
    "student.n5@nihongocoach.com",
    TEST_USER_PASSWORD,
    "student",
    "Học viên N5",
  );

  const studentN4 = await upsertSeedUser(
    "student.n4@nihongocoach.com",
    TEST_USER_PASSWORD,
    "student",
    "Học viên N4",
  );

  // Admin không ghi danh khóa học — chỉ vận hành hệ thống.
  await db.userLessonProgress.deleteMany({
    where: { userId: options.adminId },
  });
  await db.courseEnrollment.deleteMany({
    where: { userId: options.adminId },
  });

  await enrollAndInitProgress(studentN5.id, options.n5CourseId, {
    skipAccessCheck: true,
  });
  await enrollAndInitProgress(studentN4.id, options.n4CourseId, {
    skipAccessCheck: true,
  });

  console.log("[seed] Demo accounts:");
  console.log("  admin     admin@nihongocoach.com / Admin@123");
  console.log("  instructor instructor@nihongocoach.com / Instructor@123");
  console.log(`  student N5 student.n5@nihongocoach.com / ${TEST_USER_PASSWORD} (enrolled N5)`);
  console.log(`  student N4 student.n4@nihongocoach.com / ${TEST_USER_PASSWORD} (enrolled N4)`);

  return { instructor, studentN5, studentN4 };
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
    {
      key: "n4_free_access",
      value: "true",
      description: "Temporary: enroll N4 without paid plan (set false to require payment)",
    },
    {
      key: "llm_provider",
      value: "gemini",
      description: "LLM provider: gemini | agent_router",
    },
    {
      key: "llm_gemini_model",
      value: "gemini-2.5-flash",
      description: "Gemini model id",
    },
    {
      key: "llm_gemini_api_key",
      value: "",
      description: "Google Gemini API key (set in admin)",
    },
    {
      key: "llm_openai_base_url",
      value: "https://agentrouter.org/v1",
      description: "OpenAI-compatible API base URL (AgentRouter)",
    },
    {
      key: "llm_openai_model",
      value: "claude-opus-4-6",
      description: "OpenAI-compatible model id (AgentRouter: claude-opus-4-6)",
    },
    {
      key: "llm_openai_api_key",
      value: "",
      description: "AgentRouter / OpenAI-compatible API key (set in admin)",
    },
    {
      key: "llm_temperature",
      value: "0.4",
      description: "LLM sampling temperature",
    },
    {
      key: "ocr_agent_router_vision_model",
      value: "claude-opus-4-6",
      description: "Agent Router vision model for OCR (not chat model)",
    },
    {
      key: "ocr_gemini_fallback_model",
      value: "gemini-2.5-flash-lite",
      description: "Gemini model for OCR vision when AR fails or provider=gemini",
    },
  ];

  const { setConfig } = await import("../services/config.service.js");
  for (const c of configs) {
    await db.systemConfig.upsert({
      where: { key: c.key },
      create: c,
      update: { value: c.value, description: c.description },
    });
    await setConfig(c.key, c.value);
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

  const vocabCsvRows = await loadCsvStream(DEFAULT_N5_VOCAB_CSV);
  const vocabLessonNumbers = lessonNumbersFromVocabRows(vocabCsvRows);

  console.log(
    `[seed] N5 vocabulary: ${vocabCsvRows.length} từ (bài ${vocabLessonNumbers[0] ?? "?"}–${vocabLessonNumbers[vocabLessonNumbers.length - 1] ?? "?"}), sample grammar...`,
  );

  await db.vocabulary.deleteMany({ where: { jlptLevel: "N5" } });

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

  const lessonNumbers = vocabLessonNumbers;

  await db.lesson.deleteMany({ where: { courseId: course.id } });

  const lessons: { id: string; orderIndex: number }[] = [];
  for (const num of lessonNumbers.slice(0, 25)) {
    const lesson = await db.lesson.create({
      data: {
        courseId: course.id,
        title: N5_LESSON_TITLES[num] ?? `Bài ${num}`,
        orderIndex: num,
        passThreshold: 70,
      },
    });
    lessons.push({ id: lesson.id, orderIndex: num });
  }

  let n4Course = await db.course.findFirst({
    where: { jlptLevel: "N4", title: N4_COURSE_TITLE },
  });
  if (!n4Course) {
    n4Course = await db.course.create({
      data: {
        title: N4_COURSE_TITLE,
        jlptLevel: "N4",
        description:
          "Continue from N5 and build practical intermediate grammar for JLPT N4.",
        isPublished: true,
        createdById: admin.id,
      },
    });
  } else {
    n4Course = await db.course.update({
      where: { id: n4Course.id },
      data: { isPublished: true },
    });
  }

  await db.lesson.deleteMany({ where: { courseId: n4Course.id } });

  const n4Lessons: { id: string; orderIndex: number }[] = [];
  const n4LessonNumbers = Object.keys(N4_LESSON_TITLES)
    .map(Number)
    .sort((a, b) => a - b);

  for (const num of n4LessonNumbers) {
    const lesson = await db.lesson.create({
      data: {
        courseId: n4Course.id,
        title: N4_LESSON_TITLES[num] ?? `Bài ${num}`,
        orderIndex: num,
        passThreshold: 70,
      },
    });
    n4Lessons.push({ id: lesson.id, orderIndex: num });
  }

  const allLessons = [...lessons, ...n4Lessons];

  await seedGrammarFromCsv(admin.id, allLessons);
  
  await seedN5VocabularyFromCsv({
    db,
    courseId: course.id,
    adminId: admin.id,
    csvPath: DEFAULT_N5_VOCAB_CSV,
    skipDelete: true,
  });

  await db.vocabulary.deleteMany({ where: { jlptLevel: "N4" } });
  await seedN4VocabularyFromCsv({
    db,
    courseId: n4Course.id,
    adminId: admin.id,
    csvPath: DEFAULT_N4_VOCAB_CSV,
    skipDelete: true,
  });

  // Seed Kanji from CSV and link to lessons
  await seedKanjiN5FromCsv({ db, adminId: admin.id });
  await seedKanjiN4FromCsv({
    db,
    adminId: admin.id,
    courseId: n4Course.id,
  });

  console.log(
    `[seed] Created ${lessons.length} N5 lessons for ${course.title} and ${n4Lessons.length} N4 lessons for ${n4Course.title}`,
  );

  await seedConversationsFromCsv(admin.id, allLessons, [
    "conversation-n5.csv",
    "conversation-n4.csv",
  ]);

  const lesson1 = lessons.find((l) => l.orderIndex === 1);
  if (lesson1) {
    await db.lesson.update({
      where: { id: lesson1.id },
      data: {
        speakingPrompt:
          "Luyện chào hỏi và giới thiệu tên. Dùng です/ます. Gợi ý từ: こんにちは、はじめまして、わたしは〜です。",
      },
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
        maxAttempts: 3,
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

  const existingN5Plan = await db.pricingPlan.findFirst({
    where: { name: "Gói N5 — Trọn khóa" },
  });
  if (!existingN5Plan) {
    await db.pricingPlan.create({
      data: {
        name: "Gói N5 — Trọn khóa",
        description: "Toàn bộ khóa Japanese N5 — Complete Course",
        price: 299000,
        durationDays: null,
        features: [
          "25 bài học tuần tự",
          "MiniTest mở khóa",
          "AI Speaking & OCR",
          "Truy cập trọn đời",
        ],
        isActive: true,
        isPopular: false,
        sortOrder: 0,
        courses: { create: [{ courseId: course.id }] },
      },
    });
    console.log("[seed] Created sample pricing plan (N5)");
  }

  const existingN4Plan = await db.pricingPlan.findFirst({
    where: { name: "Gói N4 — Trọn khóa" },
  });
  if (!existingN4Plan) {
    await db.pricingPlan.create({
      data: {
        name: "Gói N4 — Trọn khóa",
        description: "Toàn bộ khóa Japanese N4 — Complete Course",
        price: 399000,
        durationDays: null,
        features: [
          "25 bài học tuần tự",
          "MiniTest mở khóa",
          "AI Speaking & OCR",
          "Truy cập trọn đời",
        ],
        isActive: true,
        isPopular: false,
        sortOrder: 1,
        courses: { create: [{ courseId: n4Course.id }] },
      },
    });
    console.log("[seed] Created sample pricing plan (N4)");
  }

  const { instructor } = await seedDemoAccounts({
    adminId: admin.id,
    n5CourseId: course.id,
    n4CourseId: n4Course.id,
  });

  await seedStudySets(instructor.id);

  await db.studySet.updateMany({
    where: { isPublic: true },
    data: { moderationStatus: "approved", moderatedAt: new Date() },
  });

  await seedRadicals(admin.id);

  console.log("[seed] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
