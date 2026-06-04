import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';

import { AppError } from '../utils/app-error.js';
import { getS3Client } from '../utils/s3.js';

const STUDY_SET_BUCKET = 'study-sets';

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
]);

function extFromContentType(contentType: string) {
  const normalized = contentType.split(';')[0]?.trim().toLowerCase();
  if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'jpg';
  if (normalized === 'image/png') return 'png';
  if (normalized === 'image/webp') return 'webp';
  if (normalized === 'image/gif') return 'gif';
  if (normalized === 'audio/mpeg' || normalized === 'audio/mp3') return 'mp3';
  if (normalized === 'audio/wav') return 'wav';
  if (normalized === 'audio/webm') return 'webm';
  if (normalized === 'audio/ogg') return 'ogg';
  if (normalized === 'audio/mp4' || normalized === 'audio/x-m4a') return 'm4a';
  throw new AppError('Unsupported file type', 415, 'UNSUPPORTED_MEDIA_TYPE');
}

async function ensureBucketExists() {
  const s3 = getS3Client();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: STUDY_SET_BUCKET }));
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === 'NotFound' ||
        error.name === 'NoSuchBucket' ||
        error.$metadata.httpStatusCode === 404)
    ) {
      await s3.send(new CreateBucketCommand({ Bucket: STUDY_SET_BUCKET }));
      return;
    }
    throw error;
  }
}

export async function uploadStudySetAsset(params: {
  userId: string;
  contentType: string;
  body: Buffer;
}) {
  if (!params.body.length) {
    throw new AppError('File is empty', 422, 'VALIDATION_ERROR');
  }

  const normalized = params.contentType.split(';')[0]?.trim().toLowerCase();
  const isImage = IMAGE_TYPES.has(normalized);
  const isAudio = AUDIO_TYPES.has(normalized);
  if (!isImage && !isAudio) {
    throw new AppError('Unsupported file type', 415, 'UNSUPPORTED_MEDIA_TYPE');
  }

  const ext = extFromContentType(params.contentType);
  const folder = isImage ? 'images' : 'audio';
  const objectKey = `${params.userId}/${folder}/${Date.now()}.${ext}`;
  const storagePath = `${STUDY_SET_BUCKET}/${objectKey}`;

  const s3 = getS3Client();
  await ensureBucketExists();
  await s3.send(
    new PutObjectCommand({
      Bucket: STUDY_SET_BUCKET,
      Key: objectKey,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: 'private, max-age=3600',
    }),
  );

  const assetUrl = `/api/public/study-sets/asset?key=${encodeURIComponent(objectKey)}`;

  return { storagePath, assetUrl, bucket: STUDY_SET_BUCKET, objectKey };
}

export async function getStudySetAsset(objectKey: string) {
  const safeKey = objectKey.replace(/\.\./g, '').replace(/^\/+/, '');
  if (!safeKey) {
    throw new AppError('Invalid asset key', 400, 'VALIDATION_ERROR');
  }

  const s3 = getS3Client();
  const object = await s3
    .send(
      new GetObjectCommand({
        Bucket: STUDY_SET_BUCKET,
        Key: safeKey,
      }),
    )
    .catch((error) => {
      if (
        error instanceof S3ServiceException &&
        (error.name === 'NoSuchKey' ||
          error.name === 'NoSuchBucket' ||
          error.$metadata.httpStatusCode === 404)
      ) {
        throw new AppError('Asset not found', 404, 'NOT_FOUND');
      }
      throw error;
    });

  if (!object.Body) {
    throw new AppError('Asset is empty', 404, 'NOT_FOUND');
  }

  return {
    body: object.Body,
    contentType: object.ContentType ?? 'application/octet-stream',
    contentLength: object.ContentLength,
    cacheControl: 'public, max-age=3600',
  };
}
