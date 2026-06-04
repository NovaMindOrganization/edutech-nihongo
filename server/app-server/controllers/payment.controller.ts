import type { Request, Response } from 'express';

import * as paymentService from '../services/payment.service.js';
import * as pricingPlanService from '../services/pricing-plan.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type { SePayWebhookPayload } from '../services/payment.service.js';

export const listPublicPricingPlans = asyncHandler(async (_req: Request, res: Response) => {
  const data = await pricingPlanService.listActivePlans();
  res.json({ success: true, data });
});

export const listAdminPricingPlans = asyncHandler(async (_req: Request, res: Response) => {
  const data = await pricingPlanService.listAllPlans();
  res.json({ success: true, data });
});

export const getAdminPricingPlan = asyncHandler(async (req: Request, res: Response) => {
  const data = await pricingPlanService.getPlan(String(req.params.id));
  res.json({ success: true, data });
});

export const createAdminPricingPlan = asyncHandler(async (req: Request, res: Response) => {
  const data = await pricingPlanService.createPlan(req.body);
  res.status(201).json({ success: true, data });
});

export const updateAdminPricingPlan = asyncHandler(async (req: Request, res: Response) => {
  const data = await pricingPlanService.updatePlan(String(req.params.id), req.body);
  res.json({ success: true, data });
});

export const deleteAdminPricingPlan = asyncHandler(async (req: Request, res: Response) => {
  await pricingPlanService.deletePlan(String(req.params.id));
  res.json({ success: true, data: null });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const data = await paymentService.createOrder(req.user!.id, req.body.planId);
  res.status(201).json({ success: true, data });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const data = await paymentService.getOrderForUser(String(req.params.id), req.user!.id);
  res.json({ success: true, data });
});

export const sePayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const rawBody = req.body as Buffer;
  const signature = req.headers['x-sepay-signature'] as string | undefined;

  if (!paymentService.verifySePaySignature(rawBody, signature)) {
    res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } });
    return;
  }

  let payload: SePayWebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString('utf8')) as SePayWebhookPayload;
  } catch {
    res.status(400).json({ success: false, error: { code: 'INVALID_PAYLOAD', message: 'Invalid JSON' } });
    return;
  }

  await paymentService.processSePayWebhook(payload);
  res.status(200).json({ success: true });
});
