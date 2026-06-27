import express, { Router } from 'express';
import multer from 'multer';

import { db } from '../config/db.js';
import * as admin from '../controllers/admin.controller.js';
import * as auth from '../controllers/auth.controller.js';
import * as publicCtrl from '../controllers/public.controller.js';
import * as student from '../controllers/student.controller.js';
import * as studentExt from '../controllers/student-ext.controller.js';
import * as vocabularyCtrl from '../controllers/vocabulary.controller.js';
import * as systemAdmin from '../controllers/system-admin.controller.js';
import * as payment from '../controllers/payment.controller.js';
import { optionalAuth, requireAuth, requireRoles } from '../middlewares/auth.js';
import {
  assignIdsSchema,
  authForgotPasswordSchema,
  authLoginSchema,
  authRegisterSchema,
  authResetPasswordSchema,
  conversationSchema,
  courseSchema,
  grammarSchema,
  kanjiSchema,
  lessonSchema,
  paginationQuery,
  usersListQuery,
  questionSchema,
  mockExamSchema,
  mockExamImportSchema,
  mockExamListQuery,
  reviewGenerateSchema,
  miniTestSubmitSchema,
  validateBody,
  validateQuery,
  vocabSchema,
  radicalSchema,
} from '../validators/common.js';
import {
  studySetAddItemsSchema,
  studySetAdminListQuerySchema,
  studySetCreateSchema,
  studySetListQuerySchema,
  studySetModerateSchema,
  studySetUpdateSchema,
} from '../validators/study-set.validator.js';
import {
  createOrderSchema,
  pricingPlanSchema,
} from '../validators/pricing-plan.validator.js';
import { sepayConfigSchema } from '../validators/sepay-config.validator.js';
import {
  lessonVocabularyQuerySchema,
  vocabularyProgressPatchSchema,
} from '../validators/vocabulary.validator.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

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
router.post('/auth/forgot-password', validateBody(authForgotPasswordSchema), auth.forgotPassword);
router.post('/auth/reset-password', validateBody(authResetPasswordSchema), auth.resetPassword);
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
router.get('/public/study-sets/asset', publicCtrl.getStudySetAsset);
router.post('/public/placement-test/start', publicCtrl.placementStart);
router.post('/public/placement-test/submit', optionalAuth, publicCtrl.placementSubmit);
router.get('/public/dictionary/search', publicCtrl.dictionarySearch);
router.get('/public/pricing-plans', payment.listPublicPricingPlans);

// Student
const studentRouter = Router();
studentRouter.use(requireAuth, requireRoles('student', 'instructor', 'admin'));

studentRouter.get('/dashboard', studentExt.dashboard);
studentRouter.get('/mistakes', studentExt.listMistakes);
studentRouter.post('/orders', validateBody(createOrderSchema), payment.createOrder);
studentRouter.get('/orders/:id', payment.getOrder);
studentRouter.post('/courses/:courseId/enroll', student.enrollCourse);
studentRouter.get('/courses/:courseId/lessons', student.getCourseLessons);
studentRouter.get('/lessons/:id', student.getLesson);
studentRouter.post('/lessons/:lessonId/speaking/start', studentExt.lessonSpeakingStart);
studentRouter.post('/lessons/:lessonId/speaking/message', studentExt.lessonSpeakingMessage);
studentRouter.get('/courses/:courseId/kanji', studentExt.courseKanji);
studentRouter.get('/kanji/handbook', studentExt.handbookKanji);
studentRouter.get('/kanji/learned-status', studentExt.kanjiLearnedStatus);
studentRouter.get('/lessons/:lessonId/minitest', studentExt.getMiniTest);
studentRouter.post(
  '/lessons/:lessonId/minitest/submit',
  validateBody(miniTestSubmitSchema),
  studentExt.submitMiniTest,
);
studentRouter.get('/notebook/vocabulary', studentExt.notebookVocabulary);
studentRouter.get('/notebook/learned/:type', studentExt.notebookLearned);
studentRouter.get('/notebook/collected/:type', studentExt.notebookCollected);
studentRouter.get('/notebook/lessons', studentExt.notebookLessons);
studentRouter.post('/mastery', studentExt.upsertMastery);
studentRouter.post('/review/generate', validateBody(reviewGenerateSchema), studentExt.reviewGenerate);
studentRouter.post('/review/submit', studentExt.reviewSubmit);
studentRouter.post('/ai-speaking/start', studentExt.aiSpeakingStart);
studentRouter.post('/ai-speaking/message', studentExt.aiSpeakingMessage);
studentRouter.get('/speech/stt/config', studentExt.speechSttConfig);
studentRouter.post('/speech/tts', studentExt.speechTts);
studentRouter.post('/speech/stt', studentExt.speechStt);
studentRouter.post('/speech/pronunciation/assess', studentExt.speechPronunciationAssess);
studentRouter.get('/jlpt-sim/exams', studentExt.jlptListExams);
studentRouter.get('/jlpt-sim/active', studentExt.jlptGetActiveSession);
studentRouter.get('/jlpt-sim/history', studentExt.jlptHistory);
studentRouter.post('/jlpt-sim/start', studentExt.jlptStart);
studentRouter.get('/jlpt-sim/:sessionId', studentExt.jlptGetSession);
studentRouter.post('/jlpt-sim/:sessionId/submit', studentExt.jlptSubmit);
studentRouter.get('/ocr/status', studentExt.ocrStatus);
studentRouter.post('/ocr/analyze', studentExt.ocrAnalyze);
studentRouter.post('/ocr/notebook/add', studentExt.ocrNotebookAdd);
studentRouter.post('/ocr/quiz/generate', studentExt.ocrQuizGenerate);
studentRouter.post('/ocr/grade', studentExt.ocrGrade);
studentRouter.get('/dictionary/search', studentExt.dictionarySearch);
studentRouter.get(
  '/studysets/public',
  validateQuery(studySetListQuerySchema),
  studentExt.studySetsPublic,
);
studentRouter.get('/studysets/mine', studentExt.studySetsMine);
studentRouter.post(
  '/studysets/upload',
  express.raw({
    type: ['image/*', 'audio/*', 'application/octet-stream'],
    limit: '25mb',
  }),
  studentExt.studySetUpload,
);
studentRouter.get('/studysets/:id', studentExt.studySetGet);
studentRouter.post('/studysets', validateBody(studySetCreateSchema), studentExt.studySetCreate);
studentRouter.put(
  '/studysets/:id',
  validateBody(studySetUpdateSchema),
  studentExt.studySetUpdate,
);
studentRouter.delete('/studysets/:id', studentExt.studySetDelete);
studentRouter.post('/studysets/:id/clone', studentExt.studySetClone);
studentRouter.post(
  '/studysets/:id/items',
  validateBody(studySetAddItemsSchema),
  studentExt.studySetAddItems,
);
studentRouter.delete('/studysets/:id/items/:itemId', studentExt.studySetRemoveItem);
studentRouter.post('/webrtc/match', studentExt.webrtcMatch);
studentRouter.post('/webrtc/leave', studentExt.webrtcLeave);
studentRouter.post('/community/translate', studentExt.communityTranslate);
studentRouter.post('/webrtc/evaluate', studentExt.webrtcEvaluate);
studentRouter.post('/webrtc/report', studentExt.webrtcReport);

router.use('/student', studentRouter);

// Vocabulary flashcards + progress (authenticated students)
const vocabularyRouter = Router();
vocabularyRouter.use(requireAuth, requireRoles('student', 'instructor', 'admin'));
vocabularyRouter.get(
  '/lesson/:id',
  validateQuery(lessonVocabularyQuerySchema),
  vocabularyCtrl.getLessonVocabulary,
);
vocabularyRouter.patch(
  '/progress',
  validateBody(vocabularyProgressPatchSchema),
  vocabularyCtrl.patchVocabularyProgress,
);
router.use('/vocabulary', vocabularyRouter);

// Instructor — quản lý nội dung học
const instructorRouter = Router();
instructorRouter.use(requireAuth, requireRoles('instructor'));

instructorRouter.get('/vocabulary', validateQuery(paginationQuery), admin.listVocabulary);
instructorRouter.get('/vocabulary/:id', admin.getVocabulary);
instructorRouter.post('/vocabulary', validateBody(vocabSchema), admin.createVocabulary);
instructorRouter.put('/vocabulary/:id', validateBody(vocabSchema.partial()), admin.updateVocabulary);
instructorRouter.delete('/vocabulary/:id', admin.deleteVocabulary);

instructorRouter.get('/grammar', validateQuery(paginationQuery), admin.listGrammar);
instructorRouter.get('/grammar/:id', admin.getGrammar);
instructorRouter.post('/grammar', validateBody(grammarSchema), admin.createGrammar);
instructorRouter.put('/grammar/:id', validateBody(grammarSchema.partial()), admin.updateGrammar);
instructorRouter.delete('/grammar/:id', admin.deleteGrammar);

instructorRouter.get('/courses', admin.listCourses);
instructorRouter.get('/courses-with-lessons', admin.listCoursesWithLessons);
instructorRouter.get('/courses/:id', admin.getCourse);
instructorRouter.post('/courses', validateBody(courseSchema), admin.createCourse);
instructorRouter.put('/courses/:id', validateBody(courseSchema.partial()), admin.updateCourse);
instructorRouter.delete('/courses/:id', admin.deleteCourse);

instructorRouter.get('/lessons/:id', admin.getLesson);
instructorRouter.post('/lessons', validateBody(lessonSchema), admin.createLesson);
instructorRouter.put('/lessons/:id', validateBody(lessonSchema.partial().omit({ courseId: true })), admin.updateLesson);
instructorRouter.delete('/lessons/:id', admin.deleteLesson);
instructorRouter.post('/lessons/:id/assign/vocabulary', validateBody(assignIdsSchema), admin.assignLessonVocabulary);
instructorRouter.post('/lessons/:id/assign/grammar', validateBody(assignIdsSchema), admin.assignLessonGrammar);
instructorRouter.post('/lessons/:id/assign/kanji', validateBody(assignIdsSchema), admin.assignLessonKanji);
instructorRouter.post('/lessons/:id/assign/questions', validateBody(assignIdsSchema), admin.assignLessonQuestions);
instructorRouter.post(
  '/lessons/:id/assign/conversations',
  validateBody(assignIdsSchema),
  admin.assignLessonConversations,
);

instructorRouter.get('/conversations', validateQuery(paginationQuery), admin.listConversations);
instructorRouter.get('/conversations/:id', admin.getConversation);
instructorRouter.post('/conversations', validateBody(conversationSchema), admin.createConversation);
instructorRouter.put('/conversations/:id', validateBody(conversationSchema.partial()), admin.updateConversation);
instructorRouter.delete('/conversations/:id', admin.deleteConversation);

instructorRouter.get('/mock-exams', validateQuery(mockExamListQuery), admin.listMockExams);
instructorRouter.post('/mock-exams', validateBody(mockExamSchema), admin.createMockExam);
instructorRouter.get('/mock-exams/:id', admin.getMockExam);
instructorRouter.put('/mock-exams/:id', validateBody(mockExamSchema.partial()), admin.updateMockExam);
instructorRouter.delete('/mock-exams/:id', admin.deleteMockExam);
instructorRouter.post(
  '/mock-exams/:id/import',
  validateBody(mockExamImportSchema),
  admin.importMockExamQuestions,
);
instructorRouter.delete('/mock-exams/:id/questions/:questionId', admin.removeMockExamQuestion);

instructorRouter.get('/questions', validateQuery(paginationQuery), admin.listQuestions);
instructorRouter.get('/questions/:id', admin.getQuestion);
instructorRouter.post('/questions', validateBody(questionSchema), admin.createQuestion);
instructorRouter.put('/questions/:id', validateBody(questionSchema.partial()), admin.updateQuestion);
instructorRouter.delete('/questions/:id', admin.deleteQuestion);

instructorRouter.get('/kanji', validateQuery(paginationQuery), admin.listKanji);
instructorRouter.get('/kanji/:id', admin.getKanji);
instructorRouter.post('/kanji', validateBody(kanjiSchema), admin.createKanji);
instructorRouter.put('/kanji/:id', validateBody(kanjiSchema.partial()), admin.updateKanji);
instructorRouter.delete('/kanji/:id', admin.deleteKanji);
instructorRouter.post(
  '/kanji/:id/memory-image',
  upload.single('image'),
  admin.uploadKanjiMemoryImage,
);

instructorRouter.get('/radicals', validateQuery(paginationQuery), admin.listRadicals);
instructorRouter.get('/radicals/:id', admin.getRadical);
instructorRouter.post('/radicals', validateBody(radicalSchema), admin.createRadical);
instructorRouter.put('/radicals/:id', validateBody(radicalSchema.partial()), admin.updateRadical);
instructorRouter.delete('/radicals/:id', admin.deleteRadical);

instructorRouter.get(
  '/studysets/pending',
  validateQuery(studySetAdminListQuerySchema),
  admin.listPendingStudySets,
);
instructorRouter.get('/studysets/:id', admin.getStudySetAdmin);
instructorRouter.post(
  '/studysets/:id/moderate',
  validateBody(studySetModerateSchema),
  admin.moderateStudySet,
);

router.use('/instructor', instructorRouter);

// System admin only
const sysAdminRouter = Router();
sysAdminRouter.use(requireAuth, requireRoles('admin'));

sysAdminRouter.get('/courses', admin.listCourses);
sysAdminRouter.get('/pricing-plans', payment.listAdminPricingPlans);
sysAdminRouter.get('/pricing-plans/:id', payment.getAdminPricingPlan);
sysAdminRouter.post('/pricing-plans', validateBody(pricingPlanSchema), payment.createAdminPricingPlan);
sysAdminRouter.put(
  '/pricing-plans/:id',
  validateBody(pricingPlanSchema.partial()),
  payment.updateAdminPricingPlan,
);
sysAdminRouter.delete('/pricing-plans/:id', payment.deleteAdminPricingPlan);

sysAdminRouter.get('/users', validateQuery(usersListQuery), systemAdmin.listUsers);
sysAdminRouter.put('/users/:id/role', systemAdmin.updateUserRole);
sysAdminRouter.post('/users/:id/ban', systemAdmin.banUser);
sysAdminRouter.post('/users/:id/unban', systemAdmin.unbanUser);
sysAdminRouter.post('/users/:id/suspend', systemAdmin.suspendUser);
sysAdminRouter.post('/users/:id/unsuspend', systemAdmin.unsuspendUser);
sysAdminRouter.post('/users/:id/reset-password', systemAdmin.resetPassword);
sysAdminRouter.get('/config/llm', systemAdmin.getLlmConfig);
sysAdminRouter.put('/config/llm', systemAdmin.saveLlmConfig);
sysAdminRouter.post('/config/llm/test', systemAdmin.testLlmConfig);
sysAdminRouter.get('/config/sepay', systemAdmin.getSepayConfig);
sysAdminRouter.put('/config/sepay', validateBody(sepayConfigSchema), systemAdmin.saveSepayConfig);
sysAdminRouter.get('/config', systemAdmin.getConfig);
sysAdminRouter.put('/config/:key', systemAdmin.setConfig);
sysAdminRouter.get('/reports', systemAdmin.listReports);
sysAdminRouter.put('/reports/:id/resolve', systemAdmin.resolveReport);
sysAdminRouter.get('/analytics/dau', systemAdmin.analytics);
sysAdminRouter.get('/health', systemAdmin.adminHealth);

router.use('/admin', sysAdminRouter);

export { router as apiRouter };
