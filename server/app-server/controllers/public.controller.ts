import type { Request, Response } from 'express';
import { Readable } from 'node:stream';

import { db } from '../config/db.js';
import * as dictionaryService from '../services/dictionary.service.js';
import * as kanjiMediaService from '../services/kanji-media.service.js';
import * as studySetMediaService from '../services/study-set-media.service.js';
import * as placementService from '../services/placement.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getLanding = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    take: 3,
    select: { id: true, title: true, jlptLevel: true, description: true },
  });
  res.json({
    success: true,
    data: {
      tagline: 'Học tiếng Nhật có lộ trình JLPT',
      courses,
      features: ['Sequential learning', 'AI Speaking', 'JLPT Simulator', 'Community'],
    },
  });
});

export const listCourses = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      lessons: {
        orderBy: { orderIndex: 'asc' },
        select: { id: true, title: true, orderIndex: true, isBonus: true },
      },
    },
  });
  res.json({ success: true, data: courses });
});

export const getCourseOutline = asyncHandler(async (req: Request, res: Response) => {
  const course = await db.course.findUnique({
    where: { id: String(req.params.id), isPublished: true },
    include: {
      lessons: { orderBy: { orderIndex: 'asc' }, select: { id: true, title: true, orderIndex: true } },
    },
  });
  res.json({ success: true, data: course });
});

export const getLessonPreview = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await db.lesson.findFirst({
    where: { id: String(req.params.id), orderIndex: 1 },
    include: {
      vocabulary: { take: 5, include: { vocabulary: { select: { word: true, reading: true, meaning: true } } } },
    },
  });
  res.json({ success: true, data: lesson });
});

export const placementStart = asyncHandler(async (_req: Request, res: Response) => {
  const data = await placementService.startPlacementTest();
  res.json({ success: true, data });
});

export const placementSubmit = asyncHandler(async (req: Request, res: Response) => {
  const data = await placementService.submitPlacementTest(req.user?.id, req.body.answers);
  res.json({ success: true, data });
});

export const dictionarySearch = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? '');
  const ip = req.ip;
  const data = await dictionaryService.searchDictionary(q, { ip });
  res.json({ success: true, data });
});

export const getStudySetAsset = asyncHandler(async (req: Request, res: Response) => {
  const key = String(req.query.key ?? '');
  const asset = await studySetMediaService.getStudySetAsset(key);
  res.setHeader('Content-Type', asset.contentType);
  res.setHeader('Cache-Control', asset.cacheControl);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (asset.contentLength != null) {
    res.setHeader('Content-Length', String(asset.contentLength));
  }

  const body = asset.body;
  if (body instanceof Readable) {
    body.pipe(res);
    return;
  }

  if (typeof body.transformToByteArray === 'function') {
    const bytes = await body.transformToByteArray();
    res.end(Buffer.from(bytes));
    return;
  }

  Readable.from(body as AsyncIterable<Uint8Array>).pipe(res);
});

export const getKanjiMemoryImage = asyncHandler(async (req: Request, res: Response) => {
  const ifNoneMatch = req.headers['if-none-match'];
  const image = await kanjiMediaService.getKanjiMemoryImage(
    String(req.params.id),
    typeof ifNoneMatch === 'string' ? ifNoneMatch : undefined,
  );

  res.setHeader('Cache-Control', image.cacheControl);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (image.etag) {
    res.setHeader('ETag', image.etag);
  }

  if (image.notModified) {
    res.status(304).end();
    return;
  }

  res.setHeader('Content-Type', image.contentType);
  if (image.contentLength != null) {
    res.setHeader('Content-Length', String(image.contentLength));
  }

  const body = image.body;
  if (body instanceof Readable) {
    body.pipe(res);
    return;
  }

  if (typeof body.transformToByteArray === 'function') {
    const bytes = await body.transformToByteArray();
    res.end(Buffer.from(bytes));
    return;
  }

  Readable.from(body as AsyncIterable<Uint8Array>).pipe(res);
});
