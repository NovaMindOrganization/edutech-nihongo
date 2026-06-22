import { AnimatedOutlet } from '@/components/motion';
import { Link } from 'react-router-dom';

import { paths } from '@/router/paths';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, var(--color-brand-soft) 0%, transparent 40%), radial-gradient(circle at 85% 15%, var(--color-brand-muted) 0%, transparent 35%), radial-gradient(circle at 70% 85%, rgb(var(--color-brand-light-rgb) / 0.08) 0%, transparent 30%)',
        }}
      />
      <div className="pointer-events-none absolute right-8 top-24 hidden opacity-[0.04] md:block">
        <img src="/brand-logo.png" alt="" className="size-64 object-contain" aria-hidden />
      </div>
      <header className="relative z-10 px-6 py-5">
        <Link
          to={paths.home}
          className="inline-flex items-center gap-2.5 rounded-lg border border-border bg-surface-paper px-3 py-2 font-display text-sm font-semibold tracking-tight text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-premium-hover"
        >
          <img src="/brand-mark.png" alt="" className="size-8 rounded-lg object-cover" />
          NihongoCoach
        </Link>
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-12 pt-4">
        <AnimatedOutlet className="mx-auto w-full max-w-md view-transition" />
      </div>
    </div>
  );
}
