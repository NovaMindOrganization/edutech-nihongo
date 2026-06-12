import { pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { N4_COURSE_TITLE } from "../data/n4-lesson-titles.js";
import { seedMiniTestN5 } from "./seed-minitest-n5.js";

export async function seedMiniTestN4(
  options: Parameters<typeof seedMiniTestN5>[0] = {},
) {
  return seedMiniTestN5({
    ...options,
    jlptLevel: "N4",
    courseTitle: N4_COURSE_TITLE,
    logPrefix: "[seed:minitest-n4]",
  });
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const db = new PrismaClient();
  seedMiniTestN4({ db, replaceExisting: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:minitest-n4] Lỗi:", err);
      process.exit(1);
    })
    .finally(() => db.$disconnect());
}
