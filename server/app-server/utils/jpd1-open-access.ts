import { db } from "../config/db.js";

/** Chỉ bật khi test nội bộ: JPD1_UNLOCK_ALL_LESSONS=true */
export function isJpd1OpenAccessEnabled(): boolean {
  return process.env.JPD1_UNLOCK_ALL_LESSONS === "true";
}

export async function isJpd1OpenAccessCourse(courseId: string): Promise<boolean> {
  if (!isJpd1OpenAccessEnabled()) return false;
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { jlptLevel: true },
  });
  return course?.jlptLevel === "JPD1";
}
