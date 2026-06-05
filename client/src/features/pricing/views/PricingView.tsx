import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppHeader } from '@/components/usable/app-header';
import { useAuthStore } from '@/features/auth';
import { paths } from '@/router/paths';

import { PricingSection } from '../components/PricingSection';
import { createOrder } from '../services/pricingApi';
import type { PricingPlan } from '../types/pricing.types';

export function PricingView() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const preselectedPlanId = (location.state as { planId?: string } | null)?.planId;

  useEffect(() => {
    if (!preselectedPlanId || !user) return;
    createOrder(preselectedPlanId)
      .then((order) => {
        navigate(paths.checkout(order.orderId), { replace: true });
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tạo được đơn'));
  }, [preselectedPlanId, user, navigate]);

  async function handleSelect(plan: PricingPlan) {
    if (!user) {
      navigate(paths.login, { state: { returnTo: paths.pricing } });
      return;
    }
    try {
      const order = await createOrder(plan.id);
      navigate(paths.checkout(order.orderId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tạo được đơn thanh toán');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="w-full px-4 py-12 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <PricingSection onSelectPlan={handleSelect} showTitle />
      </main>
    </div>
  );
}
