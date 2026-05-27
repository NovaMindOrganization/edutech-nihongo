import type { Request, Response } from 'express';

import { db } from '../config/db.js';
import * as dictionaryService from '../services/dictionary.service.js';
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
    where: { id: req.params.id, isPublished: true },
    include: {
      lessons: { orderBy: { orderIndex: 'asc' }, select: { id: true, title: true, orderIndex: true } },
    },
  });
  res.json({ success: true, data: course });
});

export const getLessonPreview = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await db.lesson.findFirst({
    where: { id: req.params.id, orderIndex: 1 },
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
