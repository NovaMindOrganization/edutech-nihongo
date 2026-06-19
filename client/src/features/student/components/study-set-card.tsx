import { ArrowRight, BookOpen, Copy, Eye, Sparkles, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { paths } from '@/router/paths';
import { studySetAssetUrl } from '@/features/student/services/studySetApi';
import { cn } from '@/lib/utils';

import {
  type StudySetContentType,
  type StudySetListRow,
  type StudySetModerationStatus,
} from '../types/study-set.types';
import { StudySetTypeBadges } from './study-set-type-badges';

const TYPE_ICON_BG: Record<StudySetContentType, string> = {
  vocabulary: 'bg-quaternary',
  grammar: 'bg-secondary',
  kanji: 'bg-tertiary',
  listening: 'bg-brand-soft',
  speaking: 'bg-pink-soft',
};

function dominantType(set: StudySetListRow): StudySetContentType | null {
  const entries = Object.entries(set.typeCounts) as Array<[StudySetContentType, number]>;
  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function statusBadge(set: StudySetListRow): { label: string; className: string } {
  if (!set.isPublic) {
    return { label: 'Riêng tư', className: 'bg-muted text-muted-foreground' };
  }
  const map: Record<StudySetModerationStatus, { label: string; className: string }> = {
    approved: { label: 'Cộng đồng', className: 'bg-quaternary text-quaternary-foreground' },
    pending: { label: 'Chờ duyệt', className: 'bg-tertiary text-tertiary-foreground' },
    rejected: { label: 'Từ chối', className: 'bg-destructive/15 text-destructive' },
  };
  return map[set.moderationStatus];
}

type StudySetCardProps = {
  set: StudySetListRow;
};

export function StudySetCard({ set }: StudySetCardProps) {
  const cover = set.coverImageUrl ? studySetAssetUrl(set.coverImageUrl) : null;
  const author = set.owner?.displayName ?? set.owner?.email ?? 'Cộng đồng';
  const type = dominantType(set);
  const iconBg = type ? TYPE_ICON_BG[type] : 'bg-quaternary';
  const status = statusBadge(set);

  return (
    <Link
      to={paths.student.studySetDetail(set.id)}
      className="sticker-lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-paper shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border/70 bg-surface-sunken">
        {cover ? (
          <>
            <img src={cover} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div
              className={cn(
                'pointer-events-none absolute -right-6 -top-6 size-24 rounded-full border border-border opacity-80',
                iconBg,
              )}
            />
            <div className="flex size-full items-center justify-center">
              <AppIcon icon={Sparkles} size="lg" className={iconBg} />
            </div>
          </>
        )}
        <Badge className={cn('absolute left-3 top-3 border-0 font-display text-[10px] font-extrabold uppercase tracking-wide', status.className)}>
          {status.label}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-extrabold leading-snug tracking-tight text-foreground group-hover:text-primary">
          {set.title}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <UserRound className="size-3.5 shrink-0" />
          <span className="truncate">{author}</span>
        </p>

        {set.description ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm font-medium leading-6 text-muted-foreground">
            {set.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <StudySetTypeBadges typeCounts={set.typeCounts} className="mt-3" />

        {set.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {set.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1">
            <BookOpen className="size-3" />
            {set.itemCount} mục
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1">
            <Eye className="size-3" />
            {set.viewCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1">
            <Copy className="size-3" />
            {set.cloneCount}
          </span>
        </div>

        <span className="mt-4 inline-flex items-center gap-2 font-display text-sm font-extrabold text-primary">
          Xem bộ học
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
