import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageHero, type PageHeroTone } from '@/components/usable/page-hero';
import { cn } from '@/lib/utils';

/** Khung nội dung chuẩn — đồng bộ Dashboard, OCR, Kanji course */
export const pageContentClass = 'mx-auto w-full max-w-7xl';

type PageShellProps = {
  eyebrow?: string;
  subtitle?: string;
  title: string;
  description?: string;
  chips?: string[];
  footer?: ReactNode;
  tone?: PageHeroTone;
  headerExtra?: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  badgeClassName?: string;
  backLink?: { to: string; label: string };
  /** Tab bar trong header — đồng bộ trang Bài học */
  headerNav?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Bỏ header khi view tự quản lý (vd. quiz nhiều phase) */
  hideHeader?: boolean;
};

export function PageShell({
  eyebrow,
  subtitle,
  title,
  description,
  chips,
  footer,
  tone,
  headerExtra,
  icon,
  iconClassName,
  badgeClassName,
  backLink,
  headerNav,
  children,
  className,
  hideHeader = false,
}: PageShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {!hideHeader && (
        <PageHero
          badge={eyebrow}
          subtitle={subtitle}
          title={title}
          description={description}
          chips={chips}
          footer={footer}
          tone={tone}
          aside={headerExtra}
          icon={icon}
          iconClassName={iconClassName}
          badgeClassName={badgeClassName}
          backLink={backLink}
          nav={headerNav}
        />
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}

/** Lưới nội dung học — card hub, danh sách khóa, v.v. */
export function PageGrid({
  children,
  className,
  cols = 'default',
}: {
  children: ReactNode;
  className?: string;
  cols?: 'default' | 'dense' | 'wide';
}) {
  return (
    <div
      className={cn(
        'grid w-full gap-6',
        cols === 'dense' && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        cols === 'wide' && 'lg:grid-cols-2 xl:grid-cols-3',
        cols === 'default' && 'md:grid-cols-2 xl:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
