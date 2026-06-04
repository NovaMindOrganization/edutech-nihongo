export type PricingPlanCourse = {
  id: string;
  title: string;
  jlptLevel: string;
  isPublished: boolean;
};

export type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number | null;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  courses: PricingPlanCourse[];
};

export type OrderStatus = 'pending' | 'paid' | 'expired' | 'failed';

export type CheckoutOrder = {
  orderId: string;
  planId: string;
  planName: string;
  status: OrderStatus;
  amount: number;
  paymentCode: string;
  paidAt: string | null;
  expiresAt: string;
  courseIds?: string[];
  bankName: string;
  bankAccount: string;
  accountName: string;
  qrUrl: string;
};

export type CreateOrderResponse = CheckoutOrder;
