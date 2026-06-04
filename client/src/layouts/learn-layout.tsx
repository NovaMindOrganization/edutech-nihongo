import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/usable/app-header';
import { StudentNavMenu } from '@/components/usable/student-nav-menu';

export function LearnLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--nc-cream)]/40 via-background to-background">
      <AppHeader showNav nav={<StudentNavMenu />} />
      <div className="w-full px-4 py-8 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <Outlet />
      </div>
    </div>
  );
}
