import { createHmac, timingSafeEqual } from 'node:crypto';

import type { OrderStatus } from '@prisma/client';

import { env } from '../config/env.js';
import { db } from '../config/db.js';
import { enrollAndInitProgress } from './lesson.service.js';
import { AppError } from '../utils/app-error.js';

const ORDER_TTL_MS = env.orderExpiryMinutes * 60 * 1000;

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

function buildPaymentCode(orderId: string): string {
  const suffix = orderId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${env.paymentCodePrefix}${suffix}`;
}

export function generatePaymentQrUrl(amount: number, addInfo: string): string {
  const account = env.sepayAccountNumber;
  const bin = env.sepayBankBin;
  const accountName = encodeURIComponent(env.sepayAccountName);
  const info = encodeURIComponent(addInfo);
  return `https://img.vietqr.io/image/${bin}-${account}-compact2.jpg?amount=${Math.round(amount)}&addInfo=${info}&accountName=${accountName}`;
}

function bankTransferInfo(paymentCode: string, amount: number) {
  return {
    bankName: env.sepayBankName,
    bankAccount: env.sepayAccountNumber,
    accountName: env.sepayAccountName,
    amount: Math.round(amount),
    paymentCode,
    qrUrl: generatePaymentQrUrl(amount, paymentCode),
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
  const plan = await db.pricingPlan.findUnique({
    where: { id: planId, isActive: true },
    include: { courses: { select: { courseId: true } } },
  });
  if (!plan) throw new AppError('Pricing plan not found or inactive', 404, 'NOT_FOUND');

  const amount = Number(plan.price);
  if (amount <= 0) {
    throw new AppError('This plan is free; enroll directly from the course', 400, 'FREE_PLAN');
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
  const paymentCode = buildPaymentCode(orderId);
  const expiresAt = new Date(Date.now() + ORDER_TTL_MS);

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
    ...bankTransferInfo(order.paymentCode, amount),
  };
}

export async function getOrderForUser(orderId: string, userId: string) {
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
    ...bankTransferInfo(order.paymentCode, amount),
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

function extractPaymentCode(payload: SePayWebhookPayload): string | null {
  if (payload.code && payload.code.trim()) return payload.code.trim().toUpperCase();
  const prefix = env.paymentCodePrefix;
  const match = payload.content.toUpperCase().match(new RegExp(`${prefix}[A-Z0-9]{6}`));
  return match?.[0] ?? null;
}

export function verifySePaySignature(rawBody: Buffer, signatureHeader?: string): boolean {
  if (!env.sepaySecret) {
    return env.nodeEnv !== 'production';
  }
  if (!signatureHeader) return false;
  const expected = createHmac('sha256', env.sepaySecret).update(rawBody).digest('hex');
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return expected === signatureHeader;
  }
}

export async function processSePayWebhook(payload: SePayWebhookPayload) {
  if (payload.transferType !== 'in') {
    return { processed: false, reason: 'not_incoming' };
  }

  const existingTx = await db.order.findUnique({
    where: { sepayTransactionId: payload.id },
  });
  if (existingTx?.status === 'paid') {
    return { processed: true, reason: 'duplicate' };
  }

  const paymentCode = extractPaymentCode(payload);
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

  if (env.sepayAccountNumber && payload.accountNumber !== env.sepayAccountNumber) {
    return { processed: false, reason: 'account_mismatch' };
  }

  await fulfillPaidOrder(order.id, payload.id);
  return { processed: true, reason: 'paid', orderId: order.id };
}
