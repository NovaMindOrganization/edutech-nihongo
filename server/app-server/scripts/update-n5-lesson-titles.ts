/**
 * Chỉ cập nhật title 25 lesson N5 (không xóa lesson / không mất progress).
 *
 *   pnpm run db:seed:lesson-titles
 */
import { PrismaClient } from "@prisma/client";

import { N5_COURSE_TITLE, N5_LESSON_TITLES } from "../data/n5-lesson-titles.js";

const db = new PrismaClient();

async function main() {
  const course = await db.course.findFirst({
    where: { jlptLevel: "N5", title: N5_COURSE_TITLE },
    select: { id: true, title: true },
  });

  if (!course) {
    console.error(`[lesson-titles] Không tìm thấy course "${N5_COURSE_TITLE}". Chạy db:seed trước.`);
    process.exit(1);
  }

  let updated = 0;
  for (let orderIndex = 1; orderIndex <= 25; orderIndex++) {
    const title = N5_LESSON_TITLES[orderIndex] ?? `Bài ${orderIndex}`;
    const result = await db.lesson.updateMany({
      where: { courseId: course.id, orderIndex },
      data: { title },
    });
    if (result.count > 0) {
      updated += result.count;
      console.log(`  - Bài ${orderIndex}: ${title}`);
    } else {
      console.warn(`  - Bài ${orderIndex}: chưa có lesson trong DB (bỏ qua)`);
    }
  }

  console.log(`[lesson-titles] Đã cập nhật ${updated} lesson cho course "${course.title}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void db.$disconnect());
