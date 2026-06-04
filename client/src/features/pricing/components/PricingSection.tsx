import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/auth';
import { paths } from '@/router/paths';

import { listPublicPricingPlans } from '../services/pricingApi';
import type { PricingPlan } from '../types/pricing.types';
import { PricingCard } from './PricingCard';

type PricingSectionProps = {
  onSelectPlan?: (plan: PricingPlan) => void;
  showTitle?: boolean;
};

export function PricingSection({ onSelectPlan, showTitle = true }: PricingSectionProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicPricingPlans()
      .then(setPlans)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải được bảng giá'))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(plan: PricingPlan) {
    if (onSelectPlan) {
      onSelectPlan(plan);
      return;
    }
    if (!user) {
      navigate(paths.login, { state: { returnTo: paths.pricing } });
      return;
    }
    navigate(paths.pricing, { state: { planId: plan.id } });
  }

  if (loading) {
    return <p className="text-center text-sm text-muted-foreground">Đang tải gói học…</p>;
  }

  if (!plans.length) return null;

  return (
    <section className="mt-20">
      {showTitle && (
        <div className="mb-8 text-center">
          <p className="font-display text-sm tracking-[0.2em] text-primary uppercase">Bảng giá</p>
          <h2 className="font-display mt-2 text-3xl font-bold">Chọn gói phù hợp</h2>
          <p className="mt-2 text-muted-foreground">
            Thanh toán chuyển khoản — tự động mở khóa sau khi SePAY xác nhận
          </p>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onSelect={handleSelect} />
        ))}
      </div>
    </section>
  );
}
