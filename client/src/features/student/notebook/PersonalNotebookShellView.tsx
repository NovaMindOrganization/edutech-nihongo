import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { FadeUp } from '@/components/motion';
import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { LoadingState } from '@/components/usable/states';
import { listUserNotebooks } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { PersonalNotebookPanel } from './PersonalNotebookPanel';
import { NotebookTypeTabs, POOL_CARD_META } from './notebook-shared';
import { isNotebookType, type NotebookType } from './notebook-types';
import { isNotebookTypeParam, isNotebookUuid } from './personal-notebook-utils';

type UserNotebookSummary = {
  id: string;
  title: string;
  description: string | null;
};

export function LegacyCollectedRedirect({ type }: { type: NotebookType }) {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      void listUserNotebooks().then((res) => {
        const defaultNb =
          (res.notebooks as { id: string; isDefault: boolean }[]).find((n) => n.isDefault) ??
          (res.notebooks as { id: string }[])[0];
        if (defaultNb) setTarget(paths.student.notebookPersonal(defaultNb.id, type));
      });
    });
  }, [type]);

  if (!target) return <LoadingState label="Đang chuyển hướng…" variant="page" />;
  return <Navigate to={target} replace />;
}

export function PersonalNotebookShellView() {
  const { notebookId: notebookIdParam, type: typeParam } = useParams<{
    notebookId: string;
    type: string;
  }>();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState<UserNotebookSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState<number | undefined>();

  const legacyType =
    notebookIdParam && isNotebookTypeParam(notebookIdParam) ? notebookIdParam : null;

  useEffect(() => {
    if (!notebookIdParam || legacyType) return;
    if (!isNotebookUuid(notebookIdParam)) return;

    let cancelled = false;
    queueMicrotask(() => {
      void (async () => {
        setLoading(true);
        try {
          const res = await listUserNotebooks();
          const found = (res.notebooks as UserNotebookSummary[]).find(
            (n) => n.id === notebookIdParam,
          );
          if (!cancelled) setNotebook(found ?? null);
        } catch (e) {
          if (!cancelled) {
            toast.error(e instanceof Error ? e.message : 'Không tải được sổ tay');
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [notebookIdParam, legacyType]);

  useEffect(() => {
    setItemCount(undefined);
  }, [notebookIdParam, typeParam]);

  if (legacyType) {
    return <LegacyCollectedRedirect type={legacyType} />;
  }

  if (!notebookIdParam || !typeParam || !isNotebookType(typeParam)) {
    return <Navigate to={paths.student.notebookCollectedList} replace />;
  }

  if (!isNotebookUuid(notebookIdParam)) {
    return <Navigate to={paths.student.notebookCollectedList} replace />;
  }

  const type = typeParam as NotebookType;
  const poolMeta = POOL_CARD_META.collected;

  function goType(nextType: NotebookType) {
    navigate(paths.student.notebookPersonal(notebookIdParam, nextType));
  }

  if (loading) {
    return <LoadingState label="Đang tải sổ tay…" variant="page" />;
  }

  if (!notebook) {
    return <Navigate to={paths.student.notebookCollectedList} replace />;
  }

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Sưu tập riêng"
      title={notebook.title}
      description={notebook.description ?? 'Ghi chú và ôn tập kanji, từ vựng, ngữ pháp bạn đã lưu.'}
      icon={poolMeta.icon}
      iconClassName={poolMeta.accent}
      badgeClassName={poolMeta.accent}
      tone="secondary"
      subtitle={itemCount != null ? `${itemCount} mục trong tab này` : undefined}
      chips={['Kanji', 'Từ vựng', 'Ngữ pháp']}
      backLink={{ to: paths.student.notebookCollectedList, label: 'Các sổ tay' }}
    >
      <FadeUp className="space-y-5">
        <section className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
          <NotebookTypeTabs type={type} onTypeChange={goType} />
        </section>
        <div className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
          <PersonalNotebookPanel
            notebookId={notebookIdParam}
            type={type}
            onCountChange={setItemCount}
          />
        </div>
      </FadeUp>
    </PageShell>
  );
}
