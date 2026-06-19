import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { InsetEmpty } from '@/components/usable/states/inset-empty';
import { AdminListSkeleton } from '@/components/usable/states/state-skeletons';
import { ViewState } from '@/components/usable/states/view-state';
import type { StateTone } from '@/components/usable/states/learning-illustration';
import { cn } from '@/lib/utils';

type AdminListStateProps = {
  loading: boolean;
  empty: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyTone?: StateTone;
  emptyAction?: ReactNode;
  onCreate?: () => void;
  createLabel?: string;
  skeletonCount?: number;
  className?: string;
  children: ReactNode;
};

/** Standard admin list loading / empty / content wrapper. */
export function AdminListState({
  loading,
  empty,
  loadingLabel = 'Đang tải dữ liệu…',
  emptyTitle = 'Không có kết quả',
  emptyDescription = 'Thử đổi bộ lọc hoặc thêm mục mới.',
  emptyTone = 'admin',
  emptyAction,
  onCreate,
  createLabel = 'Thêm mới',
  skeletonCount = 5,
  className,
  children,
}: AdminListStateProps) {
  const action =
    emptyAction ??
    (onCreate ? (
      <Button type="button" size="sm" onClick={onCreate}>
        {createLabel}
      </Button>
    ) : undefined);

  return (
    <ViewState
      loading={loading}
      empty={empty}
      loadingLabel={loadingLabel}
      loadingSkeleton={
        <div className={cn('p-5', className)}>
          <AdminListSkeleton count={skeletonCount} />
        </div>
      }
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyTone={emptyTone}
      emptyAction={action}
      className={className}
    >
      {empty ? null : children}
    </ViewState>
  );
}

/** Compact empty for card/table bodies without ViewState wrapper. */
export function AdminInsetEmpty({
  title,
  description,
  tone = 'admin',
  action,
}: {
  title: string;
  description?: string;
  tone?: StateTone;
  action?: ReactNode;
}) {
  return <InsetEmpty tone={tone} title={title} description={description} action={action} />;
}
