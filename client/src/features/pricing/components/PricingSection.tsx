import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/auth';
import { paths } from '@/router/paths';

import { listPublicPricingPlans } from '../services/pricingApi';
import type { PricingPlan } from '../types/pricing.types';
import { N3_COMING_SOON_PLAN } from '../constants/coming-soon-plans';
import { PricingCard } from './PricingCard';
import { PricingComingSoonCard } from './PricingComingSoonCard';

type PricingSectionProps = {
  onSelectPlan?: (plan: PricingPlan) => void;
  showTitle?: boolean;
  sectionId?: string;
};

export function PricingSection({ onSelectPlan, showTitle = true, sectionId }: PricingSectionProps) {
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
    return (
      <section
        id={sectionId}
        className="mt-20 scroll-mt-28 rounded-xl border border-border bg-surface-paper px-6 py-10 text-center shadow-premium card-lift"
      >
        <p className="font-display text-sm font-extrabold uppercase tracking-widest text-primary">
          Đang tải gói học...
        </p>
      </section>
    );
  }

  return (
    <section id={sectionId} className="relative mt-20 scroll-mt-28 py-8">
      <div className="pointer-events-none absolute -left-8 top-24 hidden size-20 -rotate-12 rounded-xl border border-border bg-secondary/60 shadow-premium card-lift md:block" />
      <div className="pointer-events-none absolute -right-6 bottom-16 hidden size-16 rounded-full border border-border bg-quaternary/70 shadow-premium card-lift md:block" />
      {showTitle && (
        <div className="relative mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-border bg-tertiary px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-tertiary-foreground shadow-premium card-lift">
            Bảng giá
          </span>
          <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
            Pick a plan, unlock the next quest.
          </h2>
          <p className="mt-4 text-base font-medium leading-7 text-muted-foreground">
            Thanh toán chuyển khoản — tự động mở khóa sau khi SePAY xác nhận
          </p>
        </div>
      )}
      <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onSelect={handleSelect} />
        ))}
        <PricingComingSoonCard plan={N3_COMING_SOON_PLAN} />
      </div>
    </section>
  );
}
