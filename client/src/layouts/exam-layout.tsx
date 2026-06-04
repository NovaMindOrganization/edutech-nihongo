import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout phòng thi — full viewport, không header/menu học tập.
 */
export function ExamLayout() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-slate-200 dark:bg-zinc-900">
      <Outlet />
    </div>
  );
}
