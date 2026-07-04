import type { Request, Response } from 'express';

import * as feedbackService from '../services/feedback.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type { FeedbackListQuery } from '../validators/feedback.validator.js';

function viewerFromReq(req: Request) {
  return { id: req.user!.id, role: req.user!.role };
}

export const createFeedback = asyncHandler(async (req: Request, res: Response) => {
  const data = await feedbackService.createFeedback(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});

export const listFeedbacks = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.validatedQuery ?? req.query) as FeedbackListQuery;
  const data = await feedbackService.listFeedbacks(viewerFromReq(req), query);
  res.json({ success: true, data });
});

export const getFeedback = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await feedbackService.getFeedbackDetail(id, viewerFromReq(req));
  res.json({ success: true, data });
});

export const addMessage = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const viewer = viewerFromReq(req);
  const isInternal =
    viewer.role !== 'student' ? Boolean(req.body.isInternal) : false;
  const data = await feedbackService.addMessage(
    id,
    viewer,
    req.body.body,
    isInternal,
  );
  res.json({ success: true, data });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await feedbackService.updateFeedbackStatus(
    id,
    viewerFromReq(req),
    req.body.status,
  );
  res.json({ success: true, data });
});

export const closeFeedback = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await feedbackService.closeFeedback(id, req.user!.id);
  res.json({ success: true, data });
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await feedbackService.getFeedbackStats();
  res.json({ success: true, data });
});
