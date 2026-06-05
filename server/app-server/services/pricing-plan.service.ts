import { Prisma } from '@prisma/client';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import type { PricingPlanInput } from '../validators/pricing-plan.validator.js';

const planInclude = {
  courses: {
    include: {
      course: {
        select: { id: true, title: true, jlptLevel: true, isPublished: true },
      },
    },
  },
} satisfies Prisma.PricingPlanInclude;

function serializePlan(plan: Prisma.PricingPlanGetPayload<{ include: typeof planInclude }>) {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price),
    durationDays: plan.durationDays,
    features: plan.features,
    isActive: plan.isActive,
    isPopular: plan.isPopular,
    sortOrder: plan.sortOrder,
    createdAt: plan.createdAt.toISOString(),
    courses: plan.courses.map((row) => row.course),
  };
}

export async function listActivePlans() {
  const plans = await db.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: planInclude,
  });
  return plans.map(serializePlan);
}

export async function listAllPlans() {
  const plans = await db.pricingPlan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: planInclude,
  });
  return plans.map(serializePlan);
}

export async function getPlan(id: string) {
  const plan = await db.pricingPlan.findUnique({
    where: { id },
    include: planInclude,
  });
  if (!plan) throw new AppError('Pricing plan not found', 404, 'NOT_FOUND');
  return serializePlan(plan);
}

async function syncPlanCourses(planId: string, courseIds: string[]) {
  await db.coursePricingPlan.deleteMany({ where: { planId } });
  if (!courseIds.length) return;

  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true },
  });
  if (courses.length !== courseIds.length) {
    throw new AppError('One or more courses not found', 400, 'INVALID_COURSES');
  }

  await db.coursePricingPlan.createMany({
    data: courseIds.map((courseId) => ({ planId, courseId })),
  });
}

export async function createPlan(data: PricingPlanInput) {
  const { courseIds, ...rest } = data;
  const plan = await db.pricingPlan.create({
    data: {
      name: rest.name,
      description: rest.description ?? null,
      price: rest.price,
      durationDays: rest.durationDays ?? null,
      features: rest.features,
      isActive: rest.isActive ?? true,
      isPopular: rest.isPopular ?? false,
      sortOrder: rest.sortOrder ?? 0,
    },
  });
  await syncPlanCourses(plan.id, courseIds);
  return getPlan(plan.id);
}

export async function updatePlan(id: string, data: Partial<PricingPlanInput>) {
  await getPlan(id);
  const { courseIds, ...rest } = data;

  await db.pricingPlan.update({
    where: { id },
    data: {
      ...(rest.name !== undefined ? { name: rest.name } : {}),
      ...(rest.description !== undefined ? { description: rest.description ?? null } : {}),
      ...(rest.price !== undefined ? { price: rest.price } : {}),
      ...(rest.durationDays !== undefined ? { durationDays: rest.durationDays ?? null } : {}),
      ...(rest.features !== undefined ? { features: rest.features } : {}),
      ...(rest.isActive !== undefined ? { isActive: rest.isActive } : {}),
      ...(rest.isPopular !== undefined ? { isPopular: rest.isPopular } : {}),
      ...(rest.sortOrder !== undefined ? { sortOrder: rest.sortOrder } : {}),
    },
  });

  if (courseIds !== undefined) {
    await syncPlanCourses(id, courseIds);
  }

  return getPlan(id);
}

export async function deletePlan(id: string) {
  const paidOrders = await db.order.count({
    where: { planId: id, status: 'paid' },
  });
  if (paidOrders > 0) {
    throw new AppError('Cannot delete plan with paid orders', 409, 'PLAN_HAS_ORDERS');
  }
  await db.order.deleteMany({ where: { planId: id, status: { in: ['pending', 'expired', 'failed'] } } });
  await db.pricingPlan.delete({ where: { id } });
}

export async function courseRequiresPaidAccess(courseId: string): Promise<boolean> {
  const link = await db.coursePricingPlan.findFirst({
    where: {
      courseId,
      plan: { isActive: true, price: { gt: 0 } },
    },
  });
  return Boolean(link);
}

export async function userHasPaidAccessToCourse(userId: string, courseId: string): Promise<boolean> {
  const paid = await db.order.findFirst({
    where: {
      userId,
      status: 'paid',
      plan: {
        isActive: true,
        courses: { some: { courseId } },
      },
    },
  });
  return Boolean(paid);
}

export async function assertCourseEnrollmentAllowed(userId: string, courseId: string) {
  const requiresPayment = await courseRequiresPaidAccess(courseId);
  if (!requiresPayment) return;

  const hasAccess = await userHasPaidAccessToCourse(userId, courseId);
  if (!hasAccess) {
    throw new AppError(
      'Payment required for this course. Purchase a pricing plan first.',
      402,
      'PAYMENT_REQUIRED',
    );
  }
}
