import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/usable/app-header';
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
    <div className="min-h-screen bg-gradient-to-b from-[var(--nc-cream)]/40 via-background to-background">
      <AppHeader />
      <div className="w-full px-4 py-8 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <Outlet />
      </div>
    </div>
  );
}
