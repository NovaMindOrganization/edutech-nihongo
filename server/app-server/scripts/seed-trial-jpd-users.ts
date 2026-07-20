/**
 * Seed trial students and enroll them in JPD1 (+ JPD2 when the course exists).
 *
 * Usage:
 *   pnpm run db:seed:trial-jpd-users
 */
import bcrypt from "bcrypt";

import { TRIAL_JPD_USER_PASSWORD, TRIAL_JPD_USERS } from "../data/trial-jpd-users.js";
import { db } from "../config/db.js";
import { enrollAndInitProgress } from "../services/lesson.service.js";

const COURSE_TARGETS = [
  { slug: "jpd1", label: "JPD1" },
  { slug: "jpd2", label: "JPD2" },
] as const;

async function findCourseBySlug(slug: string) {
  const upper = slug.toUpperCase();
  return db.course.findFirst({
    where: {
      OR: [{ slug }, { jlptLevel: upper }],
    },
    select: { id: true, title: true, slug: true, jlptLevel: true },
  });
}

async function unlockAllMainLessons(userId: string, courseId: string) {
  const lessons = await db.lesson.findMany({
    where: { courseId, isBonus: false },
    select: { id: true },
  });
  for (const lesson of lessons) {
    await db.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      create: { userId, lessonId: lesson.id, status: "active" },
      update: { status: "active" },
    });
  }
}

async function upsertTrialUser(displayName: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(TRIAL_JPD_USER_PASSWORD, 12);
  return db.user.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      passwordHash,
      role: "student",
      displayName: displayName.trim(),
    },
    update: {
      passwordHash,
      role: "student",
      displayName: displayName.trim(),
    },
    select: { id: true, email: true, displayName: true },
  });
}

async function main() {
  console.log("[seed:trial-jpd] Resolving JPD courses…");

  const courses: Array<{ id: string; title: string; label: string }> = [];
  for (const target of COURSE_TARGETS) {
    const course = await findCourseBySlug(target.slug);
    if (!course) {
      console.warn(
        `[seed:trial-jpd] Skip ${target.label}: course slug "${target.slug}" not found (run db:seed:jpd1 / db:seed:jpd2 first).`,
      );
      continue;
    }
    courses.push({ id: course.id, title: course.title, label: target.label });
    console.log(`[seed:trial-jpd] Found ${target.label}: ${course.title} (${course.id})`);
  }

  if (courses.length === 0) {
    throw new Error(
      "No JPD courses in database. Run: pnpm run db:seed:jpd1 (and db:seed:jpd2 if available).",
    );
  }

  const seen = new Set<string>();
  let created = 0;

  for (const entry of TRIAL_JPD_USERS) {
    const email = entry.email.trim().toLowerCase();
    if (seen.has(email)) {
      console.warn(`[seed:trial-jpd] Skip duplicate email: ${email}`);
      continue;
    }
    seen.add(email);

    const user = await upsertTrialUser(entry.displayName, email);
    created += 1;

    for (const course of courses) {
      await enrollAndInitProgress(user.id, course.id, { skipAccessCheck: true });
      await unlockAllMainLessons(user.id, course.id);
    }

    console.log(
      `[seed:trial-jpd] ${user.displayName} <${user.email}> → ${courses.map((c) => c.label).join(", ")}`,
    );
  }

  console.log("");
  console.log(`[seed:trial-jpd] Done — ${created} student(s).`);
  console.log(`[seed:trial-jpd] Password for all: ${TRIAL_JPD_USER_PASSWORD}`);
  console.log(
    `[seed:trial-jpd] Enrolled + unlocked all main lessons in: ${courses.map((c) => c.title).join(" | ")}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
