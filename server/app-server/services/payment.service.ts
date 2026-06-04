import { createHmac, timingSafeEqual } from 'node:crypto';

import type { OrderStatus } from '@prisma/client';

import { env } from '../config/env.js';
import { db } from '../config/db.js';
import { enrollAndInitProgress } from './lesson.service.js';
import {
  getSepayRuntimeConfig,
  verifySepayApiKey,
  type SepayRuntimeConfig,
} from './sepay-config.service.js';
import { AppError } from '../utils/app-error.js';

export type SePayWebhookPayload = {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount?: string;
  code: string | null;
  content: string;
  transferType: string;
  description?: string;
  transferAmount: number;
  accumulated?: number;
  referenceCode?: string;
};

function buildPaymentCode(orderId: string, prefix: string): string {
  const suffix = orderId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

function generatePaymentQrUrl(cfg: SepayRuntimeConfig, amount: number, addInfo: string): string {
  const accountName = encodeURIComponent(cfg.accountName);
  const info = encodeURIComponent(addInfo);
  return `https://img.vietqr.io/image/${cfg.bankBin}-${cfg.accountNumber}-compact2.jpg?amount=${Math.round(amount)}&addInfo=${info}&accountName=${accountName}`;
}

function bankTransferInfo(cfg: SepayRuntimeConfig, paymentCode: string, amount: number) {
  return {
    bankName: cfg.bankName,
    bankAccount: cfg.accountNumber,
    accountName: cfg.accountName,
    amount: Math.round(amount),
    paymentCode,
    qrUrl: generatePaymentQrUrl(cfg, amount, paymentCode),
  };
}

async function expireOrderIfNeeded(order: { id: string; status: OrderStatus; expiresAt: Date }) {
  if (order.status !== 'pending') return order.status;
  if (order.expiresAt.getTime() > Date.now()) return order.status;
  await db.order.update({
    where: { id: order.id },
    data: { status: 'expired' },
  });
  return 'expired' as OrderStatus;
}

export async function createOrder(userId: string, planId: string) {
  const cfg = await getSepayRuntimeConfig();
  const plan = await db.pricingPlan.findUnique({
    where: { id: planId, isActive: true },
    include: { courses: { select: { courseId: true } } },
  });
  if (!plan) throw new AppError('Pricing plan not found or inactive', 404, 'NOT_FOUND');

  const amount = Number(plan.price);
  if (amount <= 0) {
    throw new AppError('This plan is free; enroll directly from the course', 400, 'FREE_PLAN');
  }

  if (!cfg.accountNumber) {
    throw new AppError('Payment is not configured', 503, 'PAYMENT_NOT_CONFIGURED');
  }

  const existingPaid = await db.order.findFirst({
    where: { userId, planId, status: 'paid' },
  });
  if (existingPaid) {
    throw new AppError('You already own this plan', 409, 'ALREADY_PURCHASED');
  }

  await db.order.updateMany({
    where: { userId, planId, status: 'pending' },
    data: { status: 'expired' },
  });

  const orderId = crypto.randomUUID();
  const paymentCode = buildPaymentCode(orderId, cfg.paymentCodePrefix);
  const expiresAt = new Date(Date.now() + cfg.orderExpiryMinutes * 60 * 1000);

  const order = await db.order.create({
    data: {
      id: orderId,
      userId,
      planId,
      amount,
      paymentCode,
      expiresAt,
    },
    include: {
      plan: { select: { id: true, name: true } },
    },
  });

  return {
    orderId: order.id,
    planId: order.planId,
    planName: order.plan.name,
    status: order.status,
    amount,
    paymentCode: order.paymentCode,
    expiresAt: order.expiresAt.toISOString(),
    ...bankTransferInfo(cfg, order.paymentCode, amount),
  };
}

export async function getOrderForUser(orderId: string, userId: string) {
  const cfg = await getSepayRuntimeConfig();
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          courses: { select: { courseId: true } },
        },
      },
    },
  });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

  const status = await expireOrderIfNeeded(order);
  const amount = Number(order.amount);

  return {
    orderId: order.id,
    planId: order.planId,
    planName: order.plan.name,
    status,
    amount,
    paymentCode: order.paymentCode,
    paidAt: order.paidAt?.toISOString() ?? null,
    expiresAt: order.expiresAt.toISOString(),
    courseIds: order.plan.courses.map((c) => c.courseId),
    ...bankTransferInfo(cfg, order.paymentCode, amount),
  };
}

async function fulfillPaidOrder(orderId: string, sepayTransactionId: number) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      plan: { include: { courses: { select: { courseId: true } } } },
    },
  });
  if (!order || order.status === 'paid') return;

  await db.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      paidAt: new Date(),
      sepayTransactionId,
    },
  });

  for (const { courseId } of order.plan.courses) {
    await enrollAndInitProgress(order.userId, courseId);
  }
}

function verifyHmacSignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string): boolean {
  if (!secret || !signatureHeader) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return expected === signatureHeader;
  }
}

export async function verifySePayWebhookRequest(opts: {
  rawBody: Buffer;
  authorization?: string;
  signature?: string;
}): Promise<boolean> {
  const cfg = await getSepayRuntimeConfig();

  if (cfg.authMode === 'api_key') {
    if (!cfg.apiKey) return env.nodeEnv !== 'production';
    return verifySepayApiKey(opts.authorization, cfg.apiKey);
  }

  if (cfg.authMode === 'hmac') {
    if (!cfg.webhookSecret) return env.nodeEnv !== 'production';
    return verifyHmacSignature(opts.rawBody, opts.signature, cfg.webhookSecret);
  }

  return env.nodeEnv !== 'production';
}

export async function processSePayWebhook(payload: SePayWebhookPayload) {
  const cfg = await getSepayRuntimeConfig();

  if (payload.transferType !== 'in') {
    return { processed: false, reason: 'not_incoming' };
  }

  const existingTx = await db.order.findUnique({
    where: { sepayTransactionId: payload.id },
  });
  if (existingTx?.status === 'paid') {
    return { processed: true, reason: 'duplicate' };
  }

  const prefix = cfg.paymentCodePrefix;
  let paymentCode: string | null = null;
  if (payload.code?.trim()) {
    paymentCode = payload.code.trim().toUpperCase();
  } else {
    const match = payload.content.toUpperCase().match(new RegExp(`${prefix}[A-Z0-9]{6}`));
    paymentCode = match?.[0] ?? null;
  }

  if (!paymentCode) {
    return { processed: false, reason: 'no_payment_code' };
  }

  const order = await db.order.findUnique({
    where: { paymentCode },
    include: { plan: true },
  });
  if (!order) {
    return { processed: false, reason: 'order_not_found' };
  }

  if (order.status === 'paid') {
    return { processed: true, reason: 'already_paid' };
  }

  const status = await expireOrderIfNeeded(order);
  if (status === 'expired') {
    return { processed: false, reason: 'order_expired' };
  }

  const expectedAmount = Math.round(Number(order.amount));
  if (Math.round(payload.transferAmount) !== expectedAmount) {
    await db.order.update({
      where: { id: order.id },
      data: { status: 'failed' },
    });
    return { processed: false, reason: 'amount_mismatch' };
  }

  if (cfg.accountNumber && payload.accountNumber !== cfg.accountNumber) {
    return { processed: false, reason: 'account_mismatch' };
  }

  await fulfillPaidOrder(order.id, payload.id);
  return { processed: true, reason: 'paid', orderId: order.id };
}
