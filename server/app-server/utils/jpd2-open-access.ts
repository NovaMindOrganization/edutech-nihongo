import { db } from "../config/db.js";

/** Chỉ bật khi test nội bộ: JPD2_UNLOCK_ALL_LESSONS=true */
export function isJpd2OpenAccessEnabled(): boolean {
  return process.env.JPD2_UNLOCK_ALL_LESSONS === "true";
}

export async function isJpd2OpenAccessCourse(courseId: string): Promise<boolean> {
  if (!isJpd2OpenAccessEnabled()) return false;
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { jlptLevel: true },
  });
  return course?.jlptLevel === "JPD2";
}
