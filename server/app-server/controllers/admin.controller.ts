import type { Request, Response } from 'express';

import * as conversationService from '../services/conversation.service.js';
import * as courseService from '../services/course.service.js';
import * as studySetService from '../services/study-set.service.js';
import * as grammarService from '../services/grammar.service.js';
import * as kanjiService from '../services/kanji.service.js';
import * as lessonService from '../services/lesson.service.js';
import * as questionService from '../services/question.service.js';
import * as vocabService from '../services/vocabulary.service.js';
import { asyncHandler } from '../utils/async-handler.js';

// Vocabulary
export const listVocabulary = asyncHandler(async (req: Request, res: Response) => {
  const data = await vocabService.listVocabulary((req.validatedQuery ?? req.query) as never);
  res.json({ success: true, data });
});

export const getVocabulary = asyncHandler(async (req: Request, res: Response) => {
  const data = await vocabService.getVocabulary(req.params.id);
  res.json({ success: true, data });
});

export const createVocabulary = asyncHandler(async (req: Request, res: Response) => {
  const data = await vocabService.createVocabulary((req.validatedBody ?? req.body) as never, req.user?.id);
  res.status(201).json({ success: true, data });
});

export const updateVocabulary = asyncHandler(async (req: Request, res: Response) => {
  const data = await vocabService.updateVocabulary(req.params.id, (req.validatedBody ?? req.body) as never);
  res.json({ success: true, data });
});

export const deleteVocabulary = asyncHandler(async (req: Request, res: Response) => {
  await vocabService.deleteVocabulary(req.params.id);
  res.json({ success: true, data: null });
});

// Grammar
export const listGrammar = asyncHandler(async (req: Request, res: Response) => {
  const data = await grammarService.listGrammar((req.validatedQuery ?? req.query) as never);
  res.json({ success: true, data });
});

export const getGrammar = asyncHandler(async (req: Request, res: Response) => {
  const data = await grammarService.getGrammar(req.params.id);
  res.json({ success: true, data });
});

export const createGrammar = asyncHandler(async (req: Request, res: Response) => {
  const data = await grammarService.createGrammar(req.body, req.user?.id);
  res.status(201).json({ success: true, data });
});

export const updateGrammar = asyncHandler(async (req: Request, res: Response) => {
  const data = await grammarService.updateGrammar(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteGrammar = asyncHandler(async (req: Request, res: Response) => {
  await grammarService.deleteGrammar(req.params.id);
  res.json({ success: true, data: null });
});

// Courses
export const listCourses = asyncHandler(async (_req: Request, res: Response) => {
  const data = await courseService.listAllCourses();
  res.json({ success: true, data });
});

export const listCoursesWithLessons = asyncHandler(async (_req: Request, res: Response) => {
  const data = await courseService.listAllCoursesWithLessons();
  res.json({ success: true, data });
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await courseService.getCourse(req.params.id);
  res.json({ success: true, data });
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await courseService.createCourse({ ...req.body, createdById: req.user?.id });
  res.status(201).json({ success: true, data });
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const data = await courseService.updateCourse(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  await courseService.deleteCourse(req.params.id);
  res.json({ success: true, data: null });
});

// Lessons
export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.createLesson(req.body);
  res.status(201).json({ success: true, data });
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.updateLesson(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  await lessonService.deleteLesson(req.params.id);
  res.json({ success: true, data: null });
});

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.getLessonForAdmin(req.params.id);
  res.json({ success: true, data });
});

export const assignLessonVocabulary = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.assignVocabularyToLesson(req.params.id, req.body.ids);
  res.json({ success: true, data });
});

export const assignLessonGrammar = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.assignGrammarToLesson(req.params.id, req.body.ids);
  res.json({ success: true, data });
});

export const assignLessonKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.assignKanjiToLesson(req.params.id, req.body.ids);
  res.json({ success: true, data });
});

export const assignLessonQuestions = asyncHandler(async (req: Request, res: Response) => {
  const data = await lessonService.assignQuestionsToLesson(req.params.id, req.body.ids);
  res.json({ success: true, data });
});

export const assignLessonConversations = asyncHandler(async (req: Request, res: Response) => {
  const data = await conversationService.assignConversationsToLesson(req.params.id, req.body.ids);
  res.json({ success: true, data });
});

// Conversations
export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const data = await conversationService.listConversations((req.validatedQuery ?? req.query) as never);
  res.json({ success: true, data });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const data = await conversationService.getConversation(req.params.id);
  res.json({ success: true, data });
});

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const data = await conversationService.createConversation(req.body, req.user?.id);
  res.status(201).json({ success: true, data });
});

export const updateConversation = asyncHandler(async (req: Request, res: Response) => {
  const data = await conversationService.updateConversation(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  await conversationService.deleteConversation(req.params.id);
  res.json({ success: true, data: null });
});

export const listPendingStudySets = asyncHandler(async (_req: Request, res: Response) => {
  const data = await studySetService.listPendingStudySets();
  res.json({ success: true, data });
});

export const moderateStudySet = asyncHandler(async (req: Request, res: Response) => {
  const status = req.body.status as 'approved' | 'rejected';
  const data = await studySetService.moderateStudySet(req.params.id, status);
  res.json({ success: true, data });
});

// Questions
export const listQuestions = asyncHandler(async (req: Request, res: Response) => {
  const data = await questionService.listQuestions((req.validatedQuery ?? req.query) as never);
  res.json({ success: true, data });
});

export const getQuestion = asyncHandler(async (req: Request, res: Response) => {
  const data = await questionService.getQuestion(req.params.id);
  res.json({ success: true, data });
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const data = await questionService.createQuestion(req.body, req.user?.id);
  res.status(201).json({ success: true, data });
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const data = await questionService.updateQuestion(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  await questionService.deleteQuestion(req.params.id);
  res.json({ success: true, data: null });
});

// Kanji
export const listKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await kanjiService.listKanji((req.validatedQuery ?? req.query) as never);
  res.json({ success: true, data });
});

export const getKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await kanjiService.getKanji(req.params.id);
  res.json({ success: true, data });
});

export const createKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await kanjiService.createKanji(req.body, req.user?.id);
  res.status(201).json({ success: true, data });
});

export const updateKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await kanjiService.updateKanji(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteKanji = asyncHandler(async (req: Request, res: Response) => {
  await kanjiService.deleteKanji(req.params.id);
  res.json({ success: true, data: null });
});
