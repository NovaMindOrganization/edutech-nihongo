import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { MotionDropdownPanel } from '@/components/motion';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';
import { studentNavPathMatches } from '@/components/usable/student-nav-paths';

type NavLink = { label: string; to: string };

type NavGroup = {
  label: string;
  children: NavLink[];
};

type NavEntry = NavLink | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

/** Menu tree aligned with product IA */
export const studentNavTree: NavEntry[] = [
  { label: 'Dashboard', to: paths.student.dashboard },
  {
    label: 'Học',
    children: [
      { label: 'Khóa học', to: paths.learn.hub },
      { label: 'Sổ tay', to: paths.student.notebook },
      { label: 'Luyện kana', to: paths.learn.kanaQuiz },
    ],
  },
  { label: 'Luyện nói với AI', to: paths.student.aiSpeaking },
  {
    label: 'Luyện đề',
    children: [
      { label: 'Kiểm tra trình độ', to: paths.placementTest },
      { label: 'Đề JLPT', to: paths.student.jlptSim },
    ],
  },
  {
    label: 'Theo dõi',
    children: [
      { label: 'Lịch sử JLPT', to: paths.student.jlptHistory },
      { label: 'Ôn lỗi sai', to: paths.student.mistakes },
    ],
  },
  { label: 'OCR', to: paths.student.ocr },
  {
    label: 'Cộng đồng',
    children: [
      { label: 'Study sets', to: paths.student.studySets },
      { label: 'Gọi luyện nói', to: paths.student.communityCall },
    ],
  },
];

function groupActive(pathname: string, group: NavGroup) {
  return group.children.some((c) => studentNavPathMatches(pathname, c.to));
}

function NavDropdown({ group }: { group: NavGroup }) {
  const { pathname } = useLocation();
  const active = groupActive(pathname, group);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex min-h-11 items-center gap-0.5 whitespace-nowrap rounded-xl px-3 py-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25',
          active && 'font-medium text-primary',
        )}
      >
        {group.label}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-30"
          aria-hidden
          onClick={() => setOpen(false)}
          onPointerDown={() => setOpen(false)}
        />
      )}
      <MotionDropdownPanel open={open} id={menuId}>
        {group.children.map((child) => (
          <Link
            key={child.to}
            to={child.to}
            onClick={() => setOpen(false)}
            role="menuitem"
            className={cn(
              'block min-h-11 px-3 py-2.5 text-sm hover:bg-muted',
              studentNavPathMatches(pathname, child.to) && 'bg-primary/10 font-medium text-primary',
            )}
          >
            {child.label}
          </Link>
        ))}
      </MotionDropdownPanel>
    </div>
  );
}

export function StudentNavMenu() {
  const { pathname } = useLocation();

  return (
    <nav className="flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto pb-1 text-sm sm:flex-wrap sm:overflow-visible sm:pb-0">
      {studentNavTree.map((entry) =>
        isGroup(entry) ? (
          <NavDropdown key={entry.label} group={entry} />
        ) : (
          <Link
            key={entry.to}
            to={entry.to}
            className={cn(
              'inline-flex min-h-11 items-center whitespace-nowrap rounded-xl px-3 py-2 hover:text-primary',
              studentNavPathMatches(pathname, entry.to) && 'font-medium text-primary',
            )}
          >
            {entry.label}
          </Link>
        ),
      )}
    </nav>
  );
}
