import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/usable/app-header';
import { StudentNavMenu } from '@/components/usable/student-nav-menu';
import { useAuthStore } from '@/features/auth';
import { isStaffRole } from '@/features/auth/utils/auth-routes';

export function LearnLayout() {
  const user = useAuthStore((s) => s.user);
  const staff = user ? isStaffRole(user.role) : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--nc-cream)]/50 to-background">
      <AppHeader showNav nav={<StudentNavMenu />} />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {staff && (
          <p className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-muted-foreground">
            Chế độ học viên — menu theo cấu trúc: Học (khóa/tiết/kanji), Ôn tập, Luyện nói AI, Luyện đề, OCR,
            Cộng đồng.
          </p>
        )}
        <Outlet />
      </div>
    </div>
  );
}
