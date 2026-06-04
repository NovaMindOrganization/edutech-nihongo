import type { Request, Response } from 'express';

import * as adminUsers from '../services/admin-users.service.js';
import * as configService from '../services/config.service.js';
import * as llmConfigService from '../services/llm-config.service.js';
import * as sepayConfigService from '../services/sepay-config.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type { UserRole } from '@prisma/client';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.validatedQuery ?? req.query) as {
    page?: number;
    limit?: number;
    role?: UserRole;
    q?: string;
    status?: 'active' | 'banned' | 'suspended';
  };
  const data = await adminUsers.listUsers(q);
  res.json({ success: true, data });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminUsers.updateUserRole(req.params.id, req.body.role as UserRole);
  res.json({ success: true, data });
});

export const banUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminUsers.setUserBanned(req.params.id, true);
  res.json({ success: true, data });
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminUsers.setUserSuspended(req.params.id, true);
  res.json({ success: true, data });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminUsers.resetUserPassword(req.params.id, req.body.password);
  res.json({ success: true, data });
});

export const getConfig = asyncHandler(async (_req: Request, res: Response) => {
  const data = await configService.getAllConfig();
  res.json({ success: true, data });
});

export const setConfig = asyncHandler(async (req: Request, res: Response) => {
  await configService.setConfig(req.params.key, req.body.value);
  res.json({ success: true, data: null });
});

export const getLlmConfig = asyncHandler(async (_req: Request, res: Response) => {
  const data = await llmConfigService.getLlmAdminConfig();
  res.json({ success: true, data });
});

export const saveLlmConfig = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    provider: 'gemini' | 'agent_router';
    geminiModel: string;
    geminiApiKey?: string;
    openaiBaseUrl: string;
    openaiModel: string;
    openaiApiKey?: string;
    temperature: string;
  };
  if (body.provider !== 'gemini' && body.provider !== 'agent_router') {
    res.status(422).json({ success: false, error: { message: 'Invalid provider' } });
    return;
  }
  await llmConfigService.saveLlmAdminConfig(body);
  res.json({ success: true, data: null });
});

export const getSepayConfig = asyncHandler(async (_req: Request, res: Response) => {
  const data = await sepayConfigService.getSepayAdminConfig();
  res.json({ success: true, data });
});

export const saveSepayConfig = asyncHandler(async (req: Request, res: Response) => {
  await sepayConfigService.saveSepayAdminConfig(req.body);
  const data = await sepayConfigService.getSepayAdminConfig();
  res.json({ success: true, data });
});

export const testLlmConfig = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as llmConfigService.LlmTestDraft;
  if (body.testProvider !== 'gemini' && body.testProvider !== 'agent_router') {
    res.status(422).json({ success: false, error: { message: 'Invalid testProvider' } });
    return;
  }
  const data = await llmConfigService.testLlmDraft(body);
  res.json({ success: true, data });
});

export const listReports = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminUsers.listReports();
  res.json({ success: true, data });
});

export const resolveReport = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminUsers.resolveReport(req.params.id, req.body.status);
  res.json({ success: true, data });
});

export const analytics = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminUsers.getAnalytics();
  res.json({ success: true, data });
});

export const adminHealth = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', maintenance: await configService.getConfigValue('maintenance_mode', 'false') } });
});
