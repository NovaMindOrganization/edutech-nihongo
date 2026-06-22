import { Check, Sparkles } from 'lucide-react';

import { AppIcon } from '@/components/usable/app-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ComingSoonPricingPlan } from '../constants/coming-soon-plans';

type PricingComingSoonCardProps = {
  plan: ComingSoonPricingPlan;
};

export function PricingComingSoonCard({ plan }: PricingComingSoonCardProps) {
  return (
    <Card className="relative flex h-full flex-col overflow-hidden border-dashed bg-surface-paper opacity-95">
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-border bg-brand-soft/80" />
      <CardHeader className="relative">
        <div className="mb-4 flex items-start justify-between gap-4">
          <span className="rounded-full border border-brand-muted/60 bg-brand-soft px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-brand shadow-premium card-lift">
            {plan.statusLabel}
          </span>
          <AppIcon icon={Sparkles} size="md" className="bg-brand-soft text-brand" />
        </div>
        <CardTitle className="break-words font-display text-2xl [overflow-wrap:anywhere]">{plan.name}</CardTitle>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{plan.description}</p>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col space-y-4">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">
            Sắp công bố
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Giá sẽ được thông báo
          </p>
        </div>
        <p className="rounded-lg border border-border bg-brand-soft/50 px-3 py-2 text-xs font-bold text-brand shadow-premium card-lift">
          Khóa học {plan.jlptLevel}
        </p>
        <ul className="flex-1 space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm font-medium">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-brand-soft shadow-premium card-lift">
                <Check className="size-3 text-brand" strokeWidth={3} />
              </span>
              <span className="leading-6 text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full" variant="secondary" disabled>
          {plan.statusLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
