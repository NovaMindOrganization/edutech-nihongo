import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { FadeUp } from '@/components/motion';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { paths } from '@/router/paths';
import { NotebookCollectedPanel } from './NotebookCollectedPanel';
import { NotebookLearnedPanel } from './NotebookLearnedPanel';
import { NotebookTypeTabs, POOL_CARD_META } from './notebook-shared';
import {
  isNotebookPool,
  isNotebookType,
  POOL_LABELS,
  POOL_TAGLINES,
  type NotebookPool,
  type NotebookType,
} from './notebook-types';

export function NotebookShellView() {
  const { pool: poolParam, type: typeParam } = useParams<{ pool: string; type: string }>();
  const navigate = useNavigate();
  const [itemCount, setItemCount] = useState<number | undefined>();

  const valid =
    Boolean(poolParam && typeParam && isNotebookPool(poolParam) && isNotebookType(typeParam));

  useEffect(() => {
    if (!valid) return;
    setItemCount(undefined);
  }, [poolParam, typeParam, valid]);

  if (!valid) {
    return <Navigate to={paths.student.notebook} replace />;
  }

  const pool = poolParam as NotebookPool;
  const type = typeParam as NotebookType;
  const poolMeta = POOL_CARD_META[pool];

  function goType(nextType: NotebookType) {
    navigate(paths.student.notebookSection(pool, nextType));
  }

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Sổ tay"
      title={POOL_LABELS[pool]}
      description={POOL_TAGLINES[pool]}
      icon={poolMeta.icon}
      iconClassName={poolMeta.accent}
      badgeClassName={poolMeta.accent}
      tone={pool === 'learned' ? 'brand' : 'secondary'}
      subtitle={itemCount != null ? `${itemCount} mục trong sổ tay` : undefined}
      chips={['Kanji', 'Từ vựng', 'Ngữ pháp']}
      footer={
        pool === 'learned'
          ? 'Nội dung xuất hiện khi bạn hoàn thành bài trong khóa học — chọn loại nội dung ở thanh tab bên dưới.'
          : 'Mục từ OCR hoặc đánh dấu yêu thích — lọc theo loại ở thanh tab bên dưới.'
      }
      backLink={{ to: paths.student.notebook, label: 'Sổ tay' }}
    >
      <FadeUp className="space-y-5">
        <section className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
          <NotebookTypeTabs type={type} onTypeChange={goType} />
        </section>
        <div className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
          {pool === 'learned' ? (
            <NotebookLearnedPanel type={type} onCountChange={setItemCount} />
          ) : (
            <NotebookCollectedPanel type={type} onCountChange={setItemCount} />
          )}
        </div>
      </FadeUp>
    </PageShell>
  );
}
