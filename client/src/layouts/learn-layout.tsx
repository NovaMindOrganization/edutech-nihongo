import { Outlet } from 'react-router-dom';

import { AnimatedOutlet } from '@/components/motion';
import { AppHeader } from '@/components/usable/app-header';
import { AppBreadcrumbs } from '@/components/usable/breadcrumbs';
import { useAuthStore } from '@/features/auth';
import { StudentSidebarShell } from '@/layouts/student-sidebar';

export function LearnLayout() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return (
      <StudentSidebarShell>
        <Outlet />
      </StudentSidebarShell>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <AppHeader />
      <div className="w-full px-4 py-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mb-6 rounded-xl border border-border bg-surface-paper px-4 py-3 shadow-sm">
          <AppBreadcrumbs />
        </div>
        <AnimatedOutlet />
      </div>
    </div>
  );
}
