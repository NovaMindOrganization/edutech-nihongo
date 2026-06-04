import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/utils/cn';
import { paths } from '@/router/paths';

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
      { label: 'Kanji — khóa đang học', to: paths.learn.kanjiHub },
      { label: 'Sổ tay kanji', to: paths.learn.kanjiHandbook },
    ],
  },
  {
    label: 'Ôn tập',
    children: [
      { label: 'Kanji', to: paths.student.reviewKanji },
      { label: 'Từ vựng', to: paths.student.reviewVocabulary },
      { label: 'Ngữ pháp', to: paths.student.reviewGrammar },
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
  { label: 'OCR', to: paths.student.ocr },
  {
    label: 'Cộng đồng',
    children: [
      { label: 'Study sets', to: paths.student.studySets },
      { label: 'Gọi luyện nói', to: paths.student.communityCall },
    ],
  },
];

function pathMatches(pathname: string, to: string) {
  if (to === paths.learn.hub) {
    return pathname === to || pathname.startsWith('/learn/courses') || pathname.startsWith('/learn/lessons');
  }
  if (to === paths.learn.kanjiHub) {
    return pathname === to || pathname.startsWith('/learn/kanji/course');
  }
  if (to === paths.student.reviewKanji || to === paths.student.reviewVocabulary || to === paths.student.reviewGrammar) {
    return pathname.startsWith('/review');
  }
  if (to === paths.placementTest || to === paths.student.jlptSim) {
    return pathname === paths.placementTest || pathname.startsWith('/practice');
  }
  if (to === paths.student.studySets || to === paths.student.communityCall) {
    return pathname.startsWith('/community');
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function groupActive(pathname: string, group: NavGroup) {
  return group.children.some((c) => pathMatches(pathname, c.to));
}

function NavDropdown({ group }: { group: NavGroup }) {
  const { pathname } = useLocation();
  const active = groupActive(pathname, group);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-0.5 whitespace-nowrap rounded-md px-2 py-1 transition-colors hover:text-primary',
          active && 'font-medium text-primary',
        )}
      >
        {group.label}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            aria-hidden
            onClick={() => setOpen(false)}
            onPointerDown={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-40 mt-1 min-w-[200px] rounded-lg border border-border/80 bg-background py-1 shadow-lg">
            {group.children.map((child) => (
              <Link
                key={child.to}
                to={child.to}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-3 py-2 text-sm hover:bg-muted',
                  pathMatches(pathname, child.to) && 'bg-primary/10 font-medium text-primary',
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function StudentNavMenu() {
  const { pathname } = useLocation();

  return (
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
      {studentNavTree.map((entry) =>
        isGroup(entry) ? (
          <NavDropdown key={entry.label} group={entry} />
        ) : (
          <Link
            key={entry.to}
            to={entry.to}
            className={cn(
              'whitespace-nowrap rounded-md px-2 py-1 hover:text-primary',
              pathMatches(pathname, entry.to) && 'font-medium text-primary',
            )}
          >
            {entry.label}
          </Link>
        ),
      )}
    </nav>
  );
}
