import { apiFetch } from '@/services/httpClient';

import type { CreateOrderResponse, CheckoutOrder, PricingPlan } from '../types/pricing.types';

export function listPublicPricingPlans() {
  return apiFetch<PricingPlan[]>('/public/pricing-plans');
}

export function createOrder(planId: string) {
  return apiFetch<CreateOrderResponse>('/student/orders', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  });
}

export function getOrder(orderId: string) {
  return apiFetch<CheckoutOrder>(`/student/orders/${orderId}`);
}
