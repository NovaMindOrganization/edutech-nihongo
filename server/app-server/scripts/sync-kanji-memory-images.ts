import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { loadEnvFile } from "node:process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { getS3Client } from "../utils/s3.js";
import {
  buildKanjiMemoryObjectKey,
  KANJI_MEMORY_BUCKET,
  normalizeKanjiMemoryStoragePath,
} from "../utils/kanji-memory-storage.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  loadEnvFile(join(__dirname, "../.env"));
} catch {
  // DATABASE_URL / MinIO may come from the environment.
}

export type SyncKanjiMemoryImagesOptions = {
  db?: PrismaClient;
  jlptLevel?: string;
  /** Chỉ ghi khi DB đang null (mặc định: false — luôn khớp file MinIO). */
  onlyIfMissing?: boolean;
};

async function listKanjiObjectKeys(): Promise<Set<string>> {
  const s3 = getS3Client();
  const keys = new Set<string>();
  let continuationToken: string | undefined;

  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: KANJI_MEMORY_BUCKET,
        ContinuationToken: continuationToken,
      }),
    );

    for (const item of page.Contents ?? []) {
      if (item.Key) keys.add(item.Key);
    }

    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

function resolveObjectKey(
  kanji: { id: string; slug: string; jlptLevel: string; memoryImageUrl: string | null },
  objectKeys: Set<string>,
): string | null {
  const candidates: string[] = [];

  if (kanji.slug) {
    candidates.push(buildKanjiMemoryObjectKey(kanji.jlptLevel, kanji.slug));
  }

  if (kanji.memoryImageUrl?.trim()) {
    candidates.push(normalizeKanjiMemoryStoragePath(kanji.memoryImageUrl));
  }

  candidates.push(
    `memory/${kanji.id}.webp`,
    `memory/${kanji.id}.png`,
    `memory/${kanji.id}.jpg`,
    `memory/${kanji.id}.jpeg`,
  );

  const seen = new Set<string>();
  for (const key of candidates) {
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (objectKeys.has(key)) return key;
  }

  if (kanji.slug) {
    const suffix = `/${kanji.slug}.webp`;
    for (const key of objectKeys) {
      if (key.endsWith(suffix) || key === `${kanji.slug}.webp`) {
        return key;
      }
    }
  }

  return null;
}

export async function syncKanjiMemoryImagesFromMinio(
  options: SyncKanjiMemoryImagesOptions = {},
) {
  const db = options.db ?? new PrismaClient();
  const ownsClient = !options.db;
  const jlptLevel = options.jlptLevel;
  const onlyIfMissing = options.onlyIfMissing ?? false;

  try {
    const objectKeys = await listKanjiObjectKeys();
    console.log(
      `[sync:kanji-images] Bucket "${KANJI_MEMORY_BUCKET}": ${objectKeys.size} object(s).`,
    );

    const kanjiRows = await db.kanji.findMany({
      where: jlptLevel ? { jlptLevel } : undefined,
      select: {
        id: true,
        character: true,
        slug: true,
        jlptLevel: true,
        memoryImageUrl: true,
      },
      orderBy: { character: "asc" },
    });

    let linked = 0;
    let skipped = 0;
    let missingFile = 0;

    for (const kanji of kanjiRows) {
      const objectKey = resolveObjectKey(kanji, objectKeys);
      if (!objectKey) {
        missingFile += 1;
        continue;
      }

      if (
        onlyIfMissing &&
        kanji.memoryImageUrl?.trim() &&
        normalizeKanjiMemoryStoragePath(kanji.memoryImageUrl) === objectKey
      ) {
        skipped += 1;
        continue;
      }

      const current = kanji.memoryImageUrl
        ? normalizeKanjiMemoryStoragePath(kanji.memoryImageUrl)
        : null;

      if (current === objectKey) {
        skipped += 1;
        continue;
      }

      await db.kanji.update({
        where: { id: kanji.id },
        data: { memoryImageUrl: objectKey },
      });
      linked += 1;
    }

    console.log(
      `[sync:kanji-images] Đã gắn ${linked} đường dẫn, giữ nguyên ${skipped}, không có file ${missingFile}/${kanjiRows.length} kanji.`,
    );

    return { linked, skipped, missingFile, total: kanjiRows.length };
  } finally {
    if (ownsClient) {
      await db.$disconnect();
    }
  }
}

async function main() {
  const onlyIfMissing = process.argv.includes("--only-if-missing");
  const jlptArg = process.argv.find((arg) => arg.startsWith("--jlpt="));
  const jlptLevel = jlptArg?.split("=")[1];

  await syncKanjiMemoryImagesFromMinio({ onlyIfMissing, jlptLevel });
}

const isDirectRun =
  import.meta.url === pathToFileURL(process.argv[1] ?? "").href;

if (isDirectRun) {
  main().catch((error) => {
    console.error("[sync:kanji-images] Lỗi:", error);
    process.exit(1);
  });
}
