import express, { Router } from 'express';

import { db } from '../config/db.js';
import * as admin from '../controllers/admin.controller.js';
import * as auth from '../controllers/auth.controller.js';
import * as publicCtrl from '../controllers/public.controller.js';
import * as student from '../controllers/student.controller.js';
import * as studentExt from '../controllers/student-ext.controller.js';
import * as systemAdmin from '../controllers/system-admin.controller.js';
import { optionalAuth, requireAuth, requireRoles } from '../middlewares/auth.js';
import {
  assignIdsSchema,
  authLoginSchema,
  authRegisterSchema,
  conversationSchema,
  courseSchema,
  grammarSchema,
  kanjiSchema,
  lessonSchema,
  paginationQuery,
  usersListQuery,
  questionSchema,
  reviewGenerateSchema,
  validateBody,
  validateQuery,
  vocabSchema,
  radicalSchema,
} from '../validators/common.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'app-server' } });
});

router.get('/health/ready', async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: 'ok', database: 'connected' } });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: err instanceof Error ? err.message : 'Database unreachable',
      },
    });
  }
});

// Auth
router.post('/auth/register', validateBody(authRegisterSchema), auth.register);
router.post('/auth/login', validateBody(authLoginSchema), auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAuth, auth.me);

// Public
router.get('/public/landing', publicCtrl.getLanding);
router.get('/public/courses', publicCtrl.listCourses);
router.get('/public/courses/:id/outline', publicCtrl.getCourseOutline);
router.get('/public/courses/:id/lessons', publicCtrl.getCourseOutline);
router.get('/public/lessons/:id/preview', publicCtrl.getLessonPreview);
router.get('/public/kanji/:id/memory-image', publicCtrl.getKanjiMemoryImage);
router.post('/public/placement-test/start', publicCtrl.placementStart);
router.post('/public/placement-test/submit', optionalAuth, publicCtrl.placementSubmit);
router.get('/public/dictionary/search', publicCtrl.dictionarySearch);

// Student
const studentRouter = Router();
studentRouter.use(requireAuth, requireRoles('student', 'instructor', 'admin'));

studentRouter.get('/dashboard', studentExt.dashboard);
studentRouter.post('/courses/:courseId/enroll', student.enrollCourse);
studentRouter.get('/courses/:courseId/lessons', student.getCourseLessons);
studentRouter.get('/lessons/:id', student.getLesson);
studentRouter.post('/lessons/:lessonId/speaking/message', studentExt.lessonSpeakingMessage);
studentRouter.get('/courses/:courseId/kanji', studentExt.courseKanji);
studentRouter.get('/kanji/handbook', studentExt.handbookKanji);
studentRouter.get('/lessons/:lessonId/minitest', studentExt.getMiniTest);
studentRouter.post('/lessons/:lessonId/minitest/submit', studentExt.submitMiniTest);
studentRouter.get('/notebook/vocabulary', studentExt.notebookVocabulary);
studentRouter.post('/mastery', studentExt.upsertMastery);
studentRouter.post('/review/generate', validateBody(reviewGenerateSchema), studentExt.reviewGenerate);
studentRouter.post('/review/submit', studentExt.reviewSubmit);
studentRouter.post('/ai-speaking/start', studentExt.aiSpeakingStart);
studentRouter.post('/ai-speaking/message', studentExt.aiSpeakingMessage);
studentRouter.get('/speech/stt/config', studentExt.speechSttConfig);
studentRouter.post('/speech/tts', studentExt.speechTts);
studentRouter.post('/speech/stt', studentExt.speechStt);
studentRouter.post('/jlpt-sim/start', studentExt.jlptStart);
studentRouter.post('/jlpt-sim/:sessionId/submit', studentExt.jlptSubmit);
studentRouter.get('/jlpt-sim/history', studentExt.jlptHistory);
studentRouter.get('/ocr/status', studentExt.ocrStatus);
studentRouter.post('/ocr/analyze', studentExt.ocrAnalyze);
studentRouter.get('/dictionary/search', studentExt.dictionarySearch);
studentRouter.get('/studysets/public', studentExt.studySetsPublic);
studentRouter.get('/studysets/mine', studentExt.studySetsMine);
studentRouter.post('/studysets', studentExt.studySetCreate);
studentRouter.put('/studysets/:id', studentExt.studySetUpdate);
studentRouter.delete('/studysets/:id', studentExt.studySetDelete);
studentRouter.post('/studysets/:id/clone', studentExt.studySetClone);
studentRouter.post('/webrtc/match', studentExt.webrtcMatch);
studentRouter.post('/webrtc/evaluate', studentExt.webrtcEvaluate);
studentRouter.post('/webrtc/report', studentExt.webrtcReport);

router.use('/student', studentRouter);

// Instructor + Admin content CRUD
const contentRouter = Router();
contentRouter.use(requireAuth, requireRoles('admin', 'instructor'));

contentRouter.get('/vocabulary', validateQuery(paginationQuery), admin.listVocabulary);
contentRouter.get('/vocabulary/:id', admin.getVocabulary);
contentRouter.post('/vocabulary', validateBody(vocabSchema), admin.createVocabulary);
contentRouter.put('/vocabulary/:id', validateBody(vocabSchema.partial()), admin.updateVocabulary);
contentRouter.delete('/vocabulary/:id', admin.deleteVocabulary);

contentRouter.get('/grammar', validateQuery(paginationQuery), admin.listGrammar);
contentRouter.get('/grammar/:id', admin.getGrammar);
contentRouter.post('/grammar', validateBody(grammarSchema), admin.createGrammar);
contentRouter.put('/grammar/:id', validateBody(grammarSchema.partial()), admin.updateGrammar);
contentRouter.delete('/grammar/:id', admin.deleteGrammar);

contentRouter.get('/courses', admin.listCourses);
contentRouter.get('/courses/:id', admin.getCourse);
contentRouter.post('/courses', validateBody(courseSchema), admin.createCourse);
contentRouter.put('/courses/:id', validateBody(courseSchema.partial()), admin.updateCourse);
contentRouter.delete('/courses/:id', admin.deleteCourse);

contentRouter.get('/lessons/:id', admin.getLesson);
contentRouter.post('/lessons', validateBody(lessonSchema), admin.createLesson);
contentRouter.put('/lessons/:id', validateBody(lessonSchema.partial().omit({ courseId: true })), admin.updateLesson);
contentRouter.delete('/lessons/:id', admin.deleteLesson);
contentRouter.post('/lessons/:id/assign/vocabulary', validateBody(assignIdsSchema), admin.assignLessonVocabulary);
contentRouter.post('/lessons/:id/assign/grammar', validateBody(assignIdsSchema), admin.assignLessonGrammar);
contentRouter.post('/lessons/:id/assign/kanji', validateBody(assignIdsSchema), admin.assignLessonKanji);
contentRouter.post('/lessons/:id/assign/questions', validateBody(assignIdsSchema), admin.assignLessonQuestions);
contentRouter.post(
  '/lessons/:id/assign/conversations',
  validateBody(assignIdsSchema),
  admin.assignLessonConversations,
);

contentRouter.get('/conversations', validateQuery(paginationQuery), admin.listConversations);
contentRouter.get('/conversations/:id', admin.getConversation);
contentRouter.post('/conversations', validateBody(conversationSchema), admin.createConversation);
contentRouter.put('/conversations/:id', validateBody(conversationSchema.partial()), admin.updateConversation);
contentRouter.delete('/conversations/:id', admin.deleteConversation);

contentRouter.get('/questions', validateQuery(paginationQuery), admin.listQuestions);
contentRouter.get('/questions/:id', admin.getQuestion);
contentRouter.post('/questions', validateBody(questionSchema), admin.createQuestion);
contentRouter.put('/questions/:id', validateBody(questionSchema.partial()), admin.updateQuestion);
contentRouter.delete('/questions/:id', admin.deleteQuestion);

contentRouter.get('/kanji', validateQuery(paginationQuery), admin.listKanji);
contentRouter.get('/kanji/:id', admin.getKanji);
contentRouter.post('/kanji', validateBody(kanjiSchema), admin.createKanji);
contentRouter.put('/kanji/:id', validateBody(kanjiSchema.partial()), admin.updateKanji);
contentRouter.delete('/kanji/:id', admin.deleteKanji);
contentRouter.post(
  '/kanji/:id/memory-image',
  express.raw({ type: 'image/*', limit: '10mb' }),
  admin.uploadKanjiMemoryImage,
);

contentRouter.get('/radicals', validateQuery(paginationQuery), admin.listRadicals);
contentRouter.get('/radicals/:id', admin.getRadical);
contentRouter.post('/radicals', validateBody(radicalSchema), admin.createRadical);
contentRouter.put('/radicals/:id', validateBody(radicalSchema.partial()), admin.updateRadical);
contentRouter.delete('/radicals/:id', admin.deleteRadical);

router.use('/instructor', contentRouter);
router.use('/admin', contentRouter);

// System admin only
const sysAdminRouter = Router();
sysAdminRouter.use(requireAuth, requireRoles('admin'));

sysAdminRouter.get('/users', validateQuery(usersListQuery), systemAdmin.listUsers);
sysAdminRouter.put('/users/:id/role', systemAdmin.updateUserRole);
sysAdminRouter.post('/users/:id/ban', systemAdmin.banUser);
sysAdminRouter.post('/users/:id/suspend', systemAdmin.suspendUser);
sysAdminRouter.post('/users/:id/reset-password', systemAdmin.resetPassword);
sysAdminRouter.get('/config', systemAdmin.getConfig);
sysAdminRouter.put('/config/:key', systemAdmin.setConfig);
sysAdminRouter.get('/reports', systemAdmin.listReports);
sysAdminRouter.put('/reports/:id/resolve', systemAdmin.resolveReport);
sysAdminRouter.get('/analytics/dau', systemAdmin.analytics);
sysAdminRouter.get('/health', systemAdmin.adminHealth);
sysAdminRouter.get('/studysets/pending', admin.listPendingStudySets);
sysAdminRouter.post('/studysets/:id/moderate', admin.moderateStudySet);

router.use('/admin', sysAdminRouter);

export { router as apiRouter };
