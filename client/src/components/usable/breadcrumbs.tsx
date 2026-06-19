import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

type Crumb = {
  label: string;
  to?: string;
};

const STATIC_LABELS: Record<string, string> = {
  [paths.home]: 'Trang chủ',
  [paths.learn.hub]: 'Học',
  [paths.learn.kanjiHub]: 'Kanji',
  [paths.learn.kanjiHandbook]: 'Sổ tay Kanji',
  [paths.learn.kanaQuiz]: 'Luyện kana',
  [paths.placementTest]: 'Kiểm tra trình độ',
  [paths.student.dashboard]: 'Dashboard',
  [paths.student.notebook]: 'Sổ tay',
  [paths.student.notebookLearned('kanji')]: 'Kanji',
  [paths.student.notebookLearned('vocabulary')]: 'Từ vựng',
  [paths.student.notebookLearned('grammar')]: 'Ngữ pháp',
  [paths.student.notebookCollected('kanji')]: 'Kanji',
  [paths.student.notebookCollected('vocabulary')]: 'Từ vựng',
  [paths.student.notebookCollected('grammar')]: 'Ngữ pháp',
  '/notebook/learned': 'Lộ trình học',
  '/notebook/collected': 'Sưu tập riêng',
  [paths.student.aiSpeaking]: 'Luyện nói AI',
  [paths.student.practice]: 'Luyện đề',
  [paths.student.jlptSim]: 'Đề JLPT',
  [paths.student.ocr]: 'OCR',
  [paths.student.studySets]: 'Study sets',
  [paths.student.studySetCreate]: 'Tạo study set',
  [paths.student.communityCall]: 'Gọi luyện nói',
  [paths.student.jlptHistory]: 'Lịch sử JLPT',
  [paths.student.mistakes]: 'Ôn lỗi sai',
  [paths.pricing]: 'Bảng giá',
  [paths.dictionary]: 'Từ điển',
  [paths.admin.dashboard]: 'Quản trị',
  [paths.admin.kanji]: 'Kanji',
  [paths.admin.radicals]: 'Bộ thủ',
  [paths.admin.vocabulary]: 'Từ vựng',
  [paths.admin.grammar]: 'Ngữ pháp',
  [paths.admin.courses]: 'Khóa học',
  [paths.admin.conversations]: 'Hội thoại',
  [paths.admin.mockExams]: 'Đề thi JLPT',
  [paths.admin.questions]: 'Câu hỏi',
  [paths.admin.studySets]: 'Study sets',
  [paths.admin.users]: 'Người dùng',
  [paths.admin.config]: 'Cấu hình',
  [paths.admin.pricing]: 'Gói & giá',
  [paths.admin.reports]: 'Báo cáo',
  [paths.admin.analytics]: 'Thống kê',
};

function labelFor(pathname: string, segment: string) {
  if (STATIC_LABELS[pathname]) return STATIC_LABELS[pathname];
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return 'Chi tiết';
  if (segment === 'courses') return 'Khóa học';
  if (segment === 'lessons') return 'Bài học';
  if (segment === 'preview') return 'Xem trước';
  if (segment === 'flashcards') return 'Flashcards';
  if (segment === 'mini-test') return 'MiniTest';
  if (segment === 'course') return 'Khóa';
  if (segment === 'study-sets') return 'Study sets';
  if (segment === 'mock-exams') return 'Đề thi JLPT';
  if (segment === 'jlpt-history') return 'Lịch sử JLPT';
  if (segment === 'learned') return 'Lộ trình học';
  if (segment === 'collected') return 'Sưu tập riêng';
  if (segment === 'kanji') return 'Kanji';
  if (segment === 'vocabulary') return 'Từ vựng';
  if (segment === 'grammar') return 'Ngữ pháp';
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === paths.home) return [{ label: 'Trang chủ' }];

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ label: 'Trang chủ', to: paths.home }];

  segments.forEach((segment, index) => {
    const to = `/${segments.slice(0, index + 1).join('/')}`;
    const current = index === segments.length - 1;
    crumbs.push({
      label: labelFor(to, segment),
      to: current ? undefined : to,
    });
  });

  return crumbs;
}

export function AppBreadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-bold text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
              {crumb.to && !current ? (
                <Link
                  to={crumb.to}
                  className="inline-flex min-w-0 items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-brand-soft hover:text-foreground"
                >
                  {index === 0 && <Home className="size-3.5" aria-hidden />}
                  <span className="truncate">{crumb.label}</span>
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="inline-flex min-w-0 items-center gap-1 rounded-full border border-border bg-surface-paper px-2 py-1 text-foreground shadow-premium"
                >
                  {index === 0 && <Home className="size-3.5" aria-hidden />}
                  <span className="truncate">{crumb.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
