import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";

import { db } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { getS3Client } from "../utils/s3.js";
import { ensureKanjiExists } from "./kanji.service.js";

const KANJI_BUCKET = "kanji";

function extFromContentType(contentType: string) {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase();
  if (normalized === "image/jpeg" || normalized === "image/jpg") return "jpg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/gif") return "gif";
  throw new AppError("Unsupported image type", 415, "UNSUPPORTED_MEDIA_TYPE");
}

async function ensureBucketExists() {
  const s3 = getS3Client();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: KANJI_BUCKET }));
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === "NotFound" || error.name === "NoSuchBucket" || error.$metadata.httpStatusCode === 404)
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
  await ensureKanjiExists(params.kanjiId);
  if (!params.body.length) {
    throw new AppError("Image file is empty", 422, "VALIDATION_ERROR");
  }

  const ext = extFromContentType(params.contentType);
  const objectKey = `memory/${params.kanjiId}-${Date.now()}.${ext}`;
  const storagePath = `${KANJI_BUCKET}/${objectKey}`;
  const s3 = getS3Client();
  await ensureBucketExists();
  await s3.send(
    new PutObjectCommand({
      Bucket: KANJI_BUCKET,
      Key: objectKey,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: "private, max-age=3600",
    }),
  );

  const kanji = await db.kanji.update({
    where: { id: params.kanjiId },
    data: { memoryImageUrl: storagePath },
    include: {
      examples: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return {
    kanji,
    bucket: KANJI_BUCKET,
    objectKey,
    storagePath,
    assetUrl: `/api/public/kanji/${encodeURIComponent(params.kanjiId)}/memory-image`,
  };
}

function getObjectKeyFromMemoryImageUrl(memoryImageUrl: string, kanjiId: string) {
  try {
    const url = new URL(memoryImageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf(KANJI_BUCKET);
    if (bucketIndex >= 0 && segments[bucketIndex + 1]) {
      return segments.slice(bucketIndex + 1).map(decodeURIComponent).join("/");
    }
  } catch {
    // Accept older rows that may have stored just the object path.
  }

  if (memoryImageUrl.startsWith(`${KANJI_BUCKET}/`)) {
    return memoryImageUrl.slice(KANJI_BUCKET.length + 1);
  }

  const ext = memoryImageUrl.match(/\.([a-z0-9]+)(?:$|[?#])/i)?.[1] ?? "png";
  return `memory/${kanjiId}.${ext.toLowerCase()}`;
}

export async function getKanjiMemoryImage(kanjiId: string) {
  const kanji = await db.kanji.findUnique({
    where: { id: kanjiId },
    select: { memoryImageUrl: true },
  });
  if (!kanji?.memoryImageUrl) {
    throw new AppError("Kanji memory image not found", 404, "NOT_FOUND");
  }

  const objectKey = getObjectKeyFromMemoryImageUrl(kanji.memoryImageUrl, kanjiId);
  const s3 = getS3Client();
  const object = await s3
    .send(
      new GetObjectCommand({
        Bucket: KANJI_BUCKET,
        Key: objectKey,
      }),
    )
    .catch((error) => {
      if (
        error instanceof S3ServiceException &&
        (error.name === "NoSuchKey" || error.name === "NoSuchBucket" || error.$metadata.httpStatusCode === 404)
      ) {
        throw new AppError("Kanji memory image not found", 404, "NOT_FOUND");
      }
      throw error;
    });

  if (!object.Body) {
    throw new AppError("Kanji memory image is empty", 404, "NOT_FOUND");
  }

  return {
    body: object.Body,
    contentType: object.ContentType ?? "application/octet-stream",
    contentLength: object.ContentLength,
    cacheControl: "no-cache",
  };
}
