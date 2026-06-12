import type { Request, Response } from 'express';

import * as aiClient from '../services/ai-client.service.js';
import * as kanjiStudentService from '../services/kanji-student.service.js';
import * as dashboardService from '../services/dashboard.service.js';
import * as dictionaryService from '../services/dictionary.service.js';
import * as jlptService from '../services/jlpt.service.js';
import * as mockExamService from '../services/mock-exam.service.js';
import * as minitestService from '../services/minitest.service.js';
import * as mistakesService from '../services/mistakes.service.js';
import * as notebookService from '../services/notebook.service.js';
import * as ocrNotebookService from '../services/ocr-notebook.service.js';
import * as reviewService from '../services/review.service.js';
import * as studySetMediaService from '../services/study-set-media.service.js';
import * as studySetService from '../services/study-set.service.js';
import * as webrtcService from '../services/webrtc.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getStudentDashboard(req.user!.id);
  res.json({ success: true, data });
});

export const getMiniTest = asyncHandler(async (req: Request, res: Response) => {
  const data = await minitestService.getMiniTestQuestions(req.user!.id, req.params.lessonId);
  res.json({ success: true, data });
});

export const submitMiniTest = asyncHandler(async (req: Request, res: Response) => {
  const body = (req.validatedBody ?? req.body) as {
    sessionId: string;
    answers: Array<{ questionId: string; answer: string }>;
  };
  const data = await minitestService.submitMiniTest(
    req.user!.id,
    req.params.lessonId,
    body,
  );
  res.json({ success: true, data });
});

export const listMistakes = asyncHandler(async (req: Request, res: Response) => {
  const data = await mistakesService.listUserMistakes(req.user!.id);
  res.json({ success: true, data });
});

export const notebookVocabulary = asyncHandler(async (req: Request, res: Response) => {
  const data = await notebookService.listNotebookVocabulary(req.user!.id, {
    level: String(req.query.level ?? 'N5'),
    topic: req.query.topic as string | undefined,
    learned: req.query.learned === 'true' ? true : req.query.learned === 'false' ? false : undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });
  res.json({ success: true, data });
});

export const upsertMastery = asyncHandler(async (req: Request, res: Response) => {
  const data = await notebookService.upsertMastery(req.user!.id, req.body);
  res.json({ success: true, data });
});

export const reviewGenerate = asyncHandler(async (req: Request, res: Response) => {
  const data = await reviewService.generateReview(
    req.user!.id,
    req.body.mode ?? 'random',
    req.body.count ?? 20,
    req.body.type ?? 'mixed',
  );
  res.json({ success: true, data });
});

export const courseKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await kanjiStudentService.getCourseKanji(req.user!.id, req.params.courseId);
  res.json({ success: true, data });
});

export const handbookKanji = asyncHandler(async (req: Request, res: Response) => {
  const level = req.query.level ? String(req.query.level) : undefined;
  const data = await kanjiStudentService.getHandbookKanji(req.user!.id, level);
  res.json({ success: true, data });
});

export const kanjiLearnedStatus = asyncHandler(async (req: Request, res: Response) => {
  const raw = String(req.query.ids ?? "");
  const itemIds = raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const data = await kanjiStudentService.getKanjiLearnedStatus(req.user!.id, itemIds);
  res.json({ success: true, data });
});

export const lessonSpeakingMessage = asyncHandler(async (req: Request, res: Response) => {
  const data = await aiClient.sendLessonSpeakingMessage(req.user!.id, req.params.lessonId, req.body);
  res.json({ success: true, data });
});

export const speechTts = asyncHandler(async (req: Request, res: Response) => {
  const buf = await aiClient.synthesizeSpeech(req.body.text, req.body.voice);
  res.json({
    success: true,
    data: {
      audioBase64: buf?.length ? buf.toString('base64') : '',
      contentType: 'audio/mpeg',
      fallback: !buf?.length,
    },
  });
});

export const speechSttConfig = asyncHandler(async (_req: Request, res: Response) => {
  const data = await aiClient.getSttConfig();
  res.json({ success: true, data });
});

export const speechStt = asyncHandler(async (req: Request, res: Response) => {
  const data = await aiClient.transcribeSpeech(
    req.body.audio,
    req.body.language ?? 'ja',
    req.body.mimeType ?? 'audio/webm',
    req.body.allowGeminiFallback !== false,
  );
  res.json({ success: true, data });
});

export const aiSpeakingStart = asyncHandler(async (req: Request, res: Response) => {
  const data = await aiClient.startSpeakingSession(req.user!.id);
  res.json({ success: true, data });
});

export const webrtcEvaluate = asyncHandler(async (req: Request, res: Response) => {
  const data = await aiClient.evaluateCallSpeaking(req.user!.id, req.body);
  res.json({ success: true, data });
});

export const reviewSubmit = asyncHandler(async (req: Request, res: Response) => {
  const data = await reviewService.submitReview(req.user!.id, req.body.results);
  res.json({ success: true, data });
});

export const aiSpeakingMessage = asyncHandler(async (req: Request, res: Response) => {
  const data = await aiClient.sendSpeakingMessage(req.user!.id, req.body);
  res.json({ success: true, data });
});

export const jlptListExams = asyncHandler(async (req: Request, res: Response) => {
  const level = typeof req.query.level === 'string' ? req.query.level : undefined;
  const data = await mockExamService.listExamsForStudent(level, req.user!.id);
  res.json({ success: true, data });
});

export const jlptGetActiveSession = asyncHandler(async (req: Request, res: Response) => {
  const mockExamId = typeof req.query.mockExamId === 'string' ? req.query.mockExamId : '';
  if (!mockExamId) {
    res.json({ success: true, data: null });
    return;
  }
  const data = await jlptService.getActiveSession(req.user!.id, mockExamId);
  res.json({ success: true, data });
});

export const jlptGetSession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = String(req.params.sessionId);
  const data = await jlptService.getSession(req.user!.id, sessionId);
  res.json({ success: true, data });
});

export const jlptStart = asyncHandler(async (req: Request, res: Response) => {
  const data = await jlptService.startExam(req.user!.id, req.body.level, req.body.mockExamId);
  res.json({ success: true, data });
});

export const jlptSubmit = asyncHandler(async (req: Request, res: Response) => {
  const data = await jlptService.submitExam(
    req.user!.id,
    req.params.sessionId,
    req.body.answers,
    req.body.autoSubmit,
  );
  res.json({ success: true, data });
});

export const jlptHistory = asyncHandler(async (req: Request, res: Response) => {
  const data = await jlptService.getExamHistory(req.user!.id);
  res.json({ success: true, data });
});

export const ocrAnalyze = asyncHandler(async (req: Request, res: Response) => {
  const ai = await aiClient.analyzeOcr(req.body.image);
  const notebook = await ocrNotebookService.discoverNotInNotebook(
    req.user!.id,
    ai.extracted_text ?? '',
  );
  res.json({
    success: true,
    data: {
      extracted_text: ai.extracted_text ?? '',
      grammar_explanation: ai.grammar_explanation ?? null,
      meta: ai.meta ?? null,
      suggested_vocabulary: notebook.suggested_vocabulary,
      suggested_kanji: notebook.suggested_kanji,
    },
  });
});

export const ocrNotebookAdd = asyncHandler(async (req: Request, res: Response) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const data = await ocrNotebookService.addItemsToNotebook(req.user!.id, items);
  res.json({ success: true, data });
});

export const ocrQuizGenerate = asyncHandler(async (req: Request, res: Response) => {
  const questionCount = Math.min(20, Math.max(3, Number(req.body.questionCount ?? 5)));
  const data = await aiClient.generateOcrQuiz(req.body.image, questionCount);
  res.json({ success: true, data });
});

export const ocrGrade = asyncHandler(async (req: Request, res: Response) => {
  const data = await aiClient.gradeOcrHomework(req.body.image, req.body.context);
  res.json({ success: true, data });
});

export const ocrStatus = asyncHandler(async (_req: Request, res: Response) => {
  const data = await aiClient.getOcrStatus();
  res.json({ success: true, data });
});

export const dictionarySearch = asyncHandler(async (req: Request, res: Response) => {
  const data = await dictionaryService.searchDictionary(String(req.query.q ?? ''), {
    userId: req.user!.id,
  });
  res.json({ success: true, data });
});

export const studySetsPublic = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.validatedQuery ?? req.query) as {
    page?: number;
    limit?: number;
    search?: string;
    contentType?: 'vocabulary' | 'grammar' | 'kanji' | 'listening' | 'speaking';
  };
  const data = await studySetService.listPublicStudySets(q);
  res.json({ success: true, data });
});

export const studySetGet = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.getStudySetById(
    String(req.params.id),
    req.user!.id,
    { incrementView: true },
  );
  res.json({ success: true, data });
});

export const studySetAddItems = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as { items: Parameters<typeof studySetService.addStudySetItems>[2] };
  const data = await studySetService.addStudySetItems(
    req.user!.id,
    String(req.params.id),
    body.items,
  );
  res.json({ success: true, data });
});

export const studySetRemoveItem = asyncHandler(async (req: Request, res: Response) => {
  await studySetService.removeStudySetItem(
    req.user!.id,
    String(req.params.id),
    String(req.params.itemId),
  );
  res.json({ success: true, data: null });
});

export const studySetUpload = asyncHandler(async (req: Request, res: Response) => {
  const contentType = String(req.headers['content-type'] ?? '');
  const body = req.body;
  if (!Buffer.isBuffer(body) || !body.length) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'File body required' },
    });
    return;
  }
  const data = await studySetMediaService.uploadStudySetAsset({
    userId: req.user!.id,
    contentType,
    body,
  });
  res.status(201).json({ success: true, data });
});

export const studySetsMine = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.listMyStudySets(req.user!.id);
  res.json({ success: true, data });
});

export const studySetCreate = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.createStudySet(
    req.user!.id,
    req.validatedBody as Parameters<typeof studySetService.createStudySet>[1],
  );
  res.status(201).json({ success: true, data });
});

export const studySetUpdate = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.updateStudySet(
    req.user!.id,
    String(req.params.id),
    req.validatedBody as Parameters<typeof studySetService.updateStudySet>[2],
  );
  res.json({ success: true, data });
});

export const studySetDelete = asyncHandler(async (req: Request, res: Response) => {
  await studySetService.deleteStudySet(req.user!.id, req.params.id);
  res.json({ success: true, data: null });
});

export const studySetClone = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.cloneStudySet(req.user!.id, req.params.id);
  res.status(201).json({ success: true, data });
});

export const webrtcMatch = asyncHandler(async (req: Request, res: Response) => {
  const data = await webrtcService.matchPeer(req.user!.id);
  res.json({ success: true, data });
});

export const webrtcLeave = asyncHandler(async (req: Request, res: Response) => {
  const data = await webrtcService.leaveMatch(req.user!.id);
  res.json({ success: true, data });
});

export const communityTranslate = asyncHandler(async (req: Request, res: Response) => {
  const text = String(req.body?.text ?? '');
  const targetLang = String(req.body?.targetLang ?? 'vi');
  const data = await aiClient.translateCommunityText(text, targetLang);
  res.json({ success: true, data });
});

export const webrtcReport = asyncHandler(async (req: Request, res: Response) => {
  const data = await webrtcService.reportAbuse(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});
