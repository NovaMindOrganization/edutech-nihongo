import { Link, Outlet } from 'react-router-dom';

import { paths } from '@/router/paths';

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--nc-cream)] via-background to-[var(--nc-sakura)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, var(--nc-sakura) 0%, transparent 40%), radial-gradient(circle at 85% 10%, var(--nc-indigo-soft) 0%, transparent 35%)',
        }}
      />
      <header className="relative z-10 px-6 py-5">
        <Link to={paths.home} className="font-display text-sm font-bold tracking-wide text-primary">
          日本語 Coach
        </Link>
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-12">
        <Outlet />
      </div>
    </div>
  );
}
