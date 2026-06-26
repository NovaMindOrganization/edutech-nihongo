import type { Lesson } from "@prisma/client";

import { db } from "../config/db.js";
import { AppError } from "./app-error.js";

/** Enrolled students may open bonus/support lessons without sequential unlock. */
export async function assertStudentLessonAccess(
  userId: string,
  lesson: Pick<Lesson, "id" | "courseId" | "isBonus">,
) {
  const enrollment = await db.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.courseId } },
  });
  if (!enrollment) {
    throw new AppError("Not enrolled in course", 403, "NOT_ENROLLED");
  }

  if (lesson.isBonus) return;

  const progress = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });
  if (!progress || progress.status === "locked") {
    throw new AppError("Lesson is locked", 403, "LESSON_LOCKED");
  }
}
