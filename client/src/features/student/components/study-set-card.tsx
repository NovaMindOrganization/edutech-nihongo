import { BookOpen, Copy, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/router/paths';
import { studySetAssetUrl } from '@/features/student/services/studySetApi';

import type { StudySetListRow } from '../types/study-set.types';
import { StudySetTypeBadges } from './study-set-type-badges';

export function StudySetCard({ set }: { set: StudySetListRow }) {
  const cover = set.coverImageUrl ? studySetAssetUrl(set.coverImageUrl) : null;
  const author = set.owner?.displayName ?? set.owner?.email ?? 'Cộng đồng';

  return (
    <Link to={paths.student.studySetDetail(set.id)} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/70 transition hover:border-primary/40 hover:shadow-md">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/15 via-[var(--nc-cream)] to-primary/5">
          {cover ? (
            <img src={cover} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <BookOpen className="size-10 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3">
            <p className="line-clamp-2 font-display text-sm font-bold text-white">
              {set.title}
            </p>
          </div>
        </div>
        <CardContent className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">{author}</p>
          {set.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{set.description}</p>
          )}
          <StudySetTypeBadges typeCounts={set.typeCounts} />
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3" />
              {set.itemCount} mục
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              {set.viewCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Copy className="size-3" />
              {set.cloneCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
