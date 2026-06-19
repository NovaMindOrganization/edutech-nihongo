import { Check } from 'lucide-react';

import { AppIcon } from '@/components/usable/app-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { PricingPlan } from '../types/pricing.types';

function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDuration(days: number | null) {
  if (!days) return 'Trọn đời';
  if (days >= 365) return `${Math.round(days / 365)} năm`;
  if (days >= 30) return `${Math.round(days / 30)} tháng`;
  return `${days} ngày`;
}

type PricingCardProps = {
  plan: PricingPlan;
  onSelect: (plan: PricingPlan) => void;
  disabled?: boolean;
};

export function PricingCard({ plan, onSelect, disabled }: PricingCardProps) {
  const isFree = plan.price <= 0;

  return (
    <Card className="depth-interactive relative flex h-full flex-col overflow-hidden bg-surface-paper">
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border bg-secondary/50" />
      <CardHeader className="relative">
        <div className="mb-4 flex items-start justify-between gap-4">
          <span className="rounded-full border border-border bg-tertiary px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-tertiary-foreground shadow-premium card-lift">
            {isFree ? 'Starter' : 'Premium'}
          </span>
          <AppIcon icon={Check} size="md" className={isFree ? 'bg-quaternary' : 'bg-secondary'} />
        </div>
        <CardTitle className="break-words font-display text-2xl [overflow-wrap:anywhere]">{plan.name}</CardTitle>
        {plan.description && (
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{plan.description}</p>
        )}
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col space-y-4">
        <div>
          <p className="break-words font-display text-3xl font-extrabold tracking-tight text-primary [overflow-wrap:anywhere] sm:text-4xl">
            {isFree ? 'Miễn phí' : formatVnd(plan.price)}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {formatDuration(plan.durationDays)}
          </p>
        </div>
        {plan.courses.length > 0 && (
          <p className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-bold text-muted-foreground shadow-premium card-lift">
            {plan.courses.length} khóa:{' '}
            {plan.courses.map((c) => c.jlptLevel).join(', ')}
          </p>
        )}
        <ul className="flex-1 space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm font-medium">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-quaternary shadow-premium card-lift">
                <Check className="size-3 text-quaternary-foreground" strokeWidth={3} />
              </span>
              <span className="leading-6">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 w-full"
          disabled={disabled || isFree}
          onClick={() => onSelect(plan)}
        >
          {isFree ? 'Miễn phí' : 'Đăng ký gói'}
        </Button>
      </CardContent>
    </Card>
  );
}
