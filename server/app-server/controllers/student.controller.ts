import type { Request, Response } from 'express';

import * as courseService from '../services/course.service.js';
import * as lessonService from '../services/lesson.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const enrollCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.enrollAndInitProgress(req.user!.id, req.params.courseId);
  res.json({ success: true, data });
});

export const getCourseLessons = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.getStudentLessonsWithProgress(req.user!.id, req.params.courseId);
  res.json({ success: true, data });
});

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.getLessonContentForStudent(req.user!.id, req.params.id);
  res.json({ success: true, data });
});
