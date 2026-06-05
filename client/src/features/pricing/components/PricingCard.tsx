import { Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';

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
    <Card
      className={cn(
        'relative flex h-full flex-col border-border/70 bg-card/90 backdrop-blur',
        plan.isPopular && 'border-primary shadow-lg shadow-primary/10',
      )}
    >
      {plan.isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Phổ biến</Badge>
      )}
      <CardHeader>
        <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
        {plan.description && (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <p className="font-display text-3xl font-bold text-primary">
            {isFree ? 'Miễn phí' : formatVnd(plan.price)}
          </p>
          <p className="text-xs text-muted-foreground">{formatDuration(plan.durationDays)}</p>
        </div>
        {plan.courses.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {plan.courses.length} khóa:{' '}
            {plan.courses.map((c) => c.jlptLevel).join(', ')}
          </p>
        )}
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 w-full"
          variant={plan.isPopular ? 'default' : 'outline'}
          disabled={disabled || isFree}
          onClick={() => onSelect(plan)}
        >
          {isFree ? 'Miễn phí' : 'Đăng ký gói'}
        </Button>
      </CardContent>
    </Card>
  );
}
