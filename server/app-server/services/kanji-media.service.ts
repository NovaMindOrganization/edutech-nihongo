import {
  CreateBucketCommand,
  GetObjectCommand,
  type GetObjectCommandOutput,
  HeadBucketCommand,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

import { db } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { getS3Client } from "../utils/s3.js";
import {
  buildKanjiMemoryObjectKey,
  KANJI_MEMORY_BUCKET,
  normalizeKanjiMemoryStoragePath,
} from "../utils/kanji-memory-storage.js";
import { ensureKanjiStorageIdentity } from "./kanji.service.js";

const KANJI_BUCKET = KANJI_MEMORY_BUCKET;

function normalizeKanjiObjectKey(key: string) {
  return normalizeKanjiMemoryStoragePath(key);
}

async function ensureBucketExists() {
  const s3 = getS3Client();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: KANJI_BUCKET }));
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === "NotFound" ||
        error.name === "NoSuchBucket" ||
        error.$metadata.httpStatusCode === 404)
    ) {
      await s3.send(new CreateBucketCommand({ Bucket: KANJI_BUCKET }));
      return;
    }
    throw error;
  }
}

export async function uploadKanjiMemoryImage(params: {
  kanjiId: string;
  contentType: string;
  body: Buffer;
}) {
  if (!params.body.length) {
    throw new AppError("Image file is empty", 422, "VALIDATION_ERROR");
  }

  const kanjiIdentity = await ensureKanjiStorageIdentity(params.kanjiId);
  const objectKey = buildKanjiMemoryObjectKey(
    kanjiIdentity.jlptLevel,
    kanjiIdentity.slug,
  );
  const storagePath = objectKey;
  const s3 = getS3Client();
  await ensureBucketExists();
  const webpBody = await sharp(params.body, { failOnError: true })
    .rotate()
    .webp({ quality: 88, effort: 5 })
    .toBuffer();
  await s3.send(
    new PutObjectCommand({
      Bucket: KANJI_BUCKET,
      Key: objectKey,
      Body: webpBody,
      ContentType: "image/webp",
      CacheControl: "public, max-age=3600, must-revalidate",
    }),
  );

  const updatedKanji = await db.kanji.update({
    where: { id: params.kanjiId },
    data: {
      memoryImageUrl: storagePath,
      memoryImageUpdatedAt: new Date(),
    },
    include: {
      examples: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return {
    kanji: updatedKanji,
    bucket: KANJI_BUCKET,
    objectKey,
    storagePath,
    assetUrl: `/api/public/kanji/${encodeURIComponent(kanjiIdentity.slug)}/memory-image`,
  };
}

function getObjectKeyFromMemoryImageUrl(
  memoryImageUrl: string,
  kanjiId: string,
) {
  // Handle legacy rows that stored a full MinIO URL
  try {
    const url = new URL(memoryImageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf(KANJI_BUCKET);
    if (bucketIndex >= 0 && segments[bucketIndex + 1]) {
      return segments
        .slice(bucketIndex + 1)
        .map(decodeURIComponent)
        .join("/");
    }
  } catch {
    // Not a URL – it's already a storage path / object key.
  }

  return normalizeKanjiObjectKey(memoryImageUrl);
}

function resolveKanjiMemoryObjectKeys(kanji: {
  id: string;
  memoryImageUrl: string | null;
  slug: string;
  jlptLevel: string;
}): string[] {
  const keys = new Set<string>();
  if (kanji.memoryImageUrl) {
    keys.add(getObjectKeyFromMemoryImageUrl(kanji.memoryImageUrl, kanji.id));
  }
  if (kanji.slug) {
    keys.add(buildKanjiMemoryObjectKey(kanji.jlptLevel, kanji.slug));
  }
  return [...keys];
}

export type KanjiMemoryImageResult =
  | { notModified: true; etag?: string; cacheControl: string }
  | {
      body: NonNullable<GetObjectCommandOutput["Body"]>;
      contentType: string;
      contentLength?: number;
      cacheControl: string;
      etag?: string;
    };

async function getS3ObjectBody(
  objectKey: string,
  ifNoneMatch?: string,
) {
  const s3 = getS3Client();
  return s3.send(
    new GetObjectCommand({
      Bucket: KANJI_BUCKET,
      Key: objectKey,
      ...(ifNoneMatch ? { IfNoneMatch: ifNoneMatch } : {}),
    }),
  );
}

export async function getKanjiMemoryImage(
  identifier: string,
  ifNoneMatch?: string,
): Promise<KanjiMemoryImageResult> {
  const kanji = await db.kanji.findFirst({
    where: { 
      OR: [
        { slug: identifier },
        { id: identifier }
      ]
    },
    select: { id: true, memoryImageUrl: true, slug: true, jlptLevel: true },
  });
  if (!kanji) {
    throw new AppError("Kanji memory image not found", 404, "NOT_FOUND");
  }

  const objectKeys = resolveKanjiMemoryObjectKeys(kanji);
  if (!objectKeys.length) {
    throw new AppError("Kanji memory image not found", 404, "NOT_FOUND");
  }

  const cacheControl = "public, max-age=3600, must-revalidate";
  let lastNotFound: unknown;
  for (const objectKey of objectKeys) {
    try {
      const object = await getS3ObjectBody(objectKey, ifNoneMatch);
      if (object.$metadata.httpStatusCode === 304) {
        return {
          notModified: true,
          etag: object.ETag,
          cacheControl,
        };
      }
      if (!object.Body) {
        throw new AppError("Kanji memory image is empty", 404, "NOT_FOUND");
      }
      return {
        body: object.Body,
        contentType: object.ContentType ?? "image/webp",
        contentLength: object.ContentLength,
        cacheControl,
        etag: object.ETag,
      };
    } catch (error) {
      if (
        error instanceof S3ServiceException &&
        (error.name === "NoSuchKey" ||
          error.name === "NoSuchBucket" ||
          error.$metadata.httpStatusCode === 404)
      ) {
        lastNotFound = error;
        continue;
      }
      throw error;
    }
  }

  if (lastNotFound) {
    throw new AppError("Kanji memory image not found", 404, "NOT_FOUND");
  }
  throw new AppError("Kanji memory image not found", 404, "NOT_FOUND");
}
