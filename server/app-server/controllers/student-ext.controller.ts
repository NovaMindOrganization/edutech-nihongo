import type { Request, Response } from 'express';

import * as aiClient from '../services/ai-client.service.js';
import * as kanjiStudentService from '../services/kanji-student.service.js';
import * as dashboardService from '../services/dashboard.service.js';
import * as dictionaryService from '../services/dictionary.service.js';
import * as jlptService from '../services/jlpt.service.js';
import * as minitestService from '../services/minitest.service.js';
import * as notebookService from '../services/notebook.service.js';
import * as reviewService from '../services/review.service.js';
import * as studySetService from '../services/study-set.service.js';
import * as webrtcService from '../services/webrtc.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  await dashboardService.touchStreak(req.user!.id);
  const data = await dashboardService.getStudentDashboard(req.user!.id);
  res.json({ success: true, data });
});

export const getMiniTest = asyncHandler(async (req: Request, res: Response) => {
  const data = await minitestService.getMiniTestQuestions(req.user!.id, req.params.lessonId);
  res.json({ success: true, data });
});

export const submitMiniTest = asyncHandler(async (req: Request, res: Response) => {
  const data = await minitestService.submitMiniTest(req.user!.id, req.params.lessonId, req.body.answers);
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
  const data = await kanjiStudentService.getHandbookKanji(req.user!.id);
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
  const data = await aiClient.analyzeOcr(req.body.image);
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

export const studySetsPublic = asyncHandler(async (_req: Request, res: Response) => {
  const data = await studySetService.listPublicStudySets();
  res.json({ success: true, data });
});

export const studySetsMine = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.listMyStudySets(req.user!.id);
  res.json({ success: true, data });
});

export const studySetCreate = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.createStudySet(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});

export const studySetUpdate = asyncHandler(async (req: Request, res: Response) => {
  const data = await studySetService.updateStudySet(req.user!.id, req.params.id, req.body);
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

export const webrtcReport = asyncHandler(async (req: Request, res: Response) => {
  const data = await webrtcService.reportAbuse(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});
