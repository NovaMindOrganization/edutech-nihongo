import { Compass, LibraryBig, Plus, Search, Sparkles, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import {
  emptyStatePresets,
  StudySetGridSkeleton,
  ViewState,
} from '@/components/usable/states';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

import { StudySetCard } from '../components/study-set-card';
import { listMyStudySets, listPublicStudySets } from '../services/studySetApi';
import {
  STUDY_SET_CONTENT_LABELS,
  type StudySetContentType,
  type StudySetListRow,
} from '../types/study-set.types';

const FILTERS: Array<{ id: 'all' | StudySetContentType; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  ...(
    Object.entries(STUDY_SET_CONTENT_LABELS) as [StudySetContentType, string][]
  ).map(([id, label]) => ({ id, label })),
];

const TABS = [
  { id: 'community', label: 'Cộng đồng', icon: Compass },
  { id: 'mine', label: 'Của tôi', icon: UserRound },
] as const;

export function StudySetsView() {
  const [tab, setTab] = useState<'community' | 'mine'>('community');
  const [filter, setFilter] = useState<'all' | StudySetContentType>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mine, setMine] = useState<StudySetListRow[]>([]);
  const [community, setCommunity] = useState<StudySetListRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadCommunity = useCallback(async () => {
    const data = await listPublicStudySets({
      search: debouncedSearch || undefined,
      contentType: filter === 'all' ? undefined : filter,
      limit: 48,
    });
    setCommunity(data.items);
  }, [debouncedSearch, filter]);

  const loadMine = useCallback(async () => {
    setMine(await listMyStudySets());
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setLoading(true);
      Promise.all([loadCommunity(), loadMine()])
        .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi tải'))
        .finally(() => setLoading(false));
    });
  }, [loadCommunity, loadMine]);

  const rows = tab === 'community' ? community : mine;
  const totalItems = rows.reduce((sum, row) => sum + row.itemCount, 0);

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Cộng đồng"
      title="Study Sets"
      description="Khám phá bộ học từ cộng đồng, lọc theo kỹ năng, hoặc chia sẻ bộ của bạn sau kiểm duyệt."
      icon={LibraryBig}
      iconClassName="bg-quaternary"
      tone="quaternary"
      chips={['Flashcard', 'Quiz', 'Cộng đồng', 'Của tôi']}
      footer="Bộ công khai cần được kiểm duyệt trước khi hiện trong tab Cộng đồng."
      headerExtra={
        <Link
          to={paths.student.studySetCreate}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-xl border border-border bg-brand px-4 text-sm font-extrabold text-primary-foreground shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium-hover',
          )}
        >
          <Plus className="mr-2 size-4" />
          Tạo bộ mới
        </Link>
      }
    >
      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav
              className="flex w-fit rounded-lg border border-border bg-surface-paper p-1 shadow-premium card-lift"
              aria-label="Nguồn study set"
            >
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors',
                    tab === id
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              {tab === 'community' && (
                <label className="relative min-w-[220px] flex-1 lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-11 rounded-xl border-border bg-surface-paper pl-10 shadow-sm"
                    placeholder="Tìm theo tiêu đề…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              )}
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <span className="rounded-lg border border-border bg-surface-paper px-3 py-2 font-mono text-foreground">
                  {rows.length}
                </span>
                <span>bộ</span>
                <span className="text-border">·</span>
                <span className="rounded-lg border border-border bg-quaternary/20 px-3 py-2 font-mono text-foreground">
                  {totalItems}
                </span>
                <span>mục</span>
              </div>
            </div>
          </div>

          {tab === 'community' && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-extrabold transition-colors',
                    filter === f.id
                      ? 'border-brand/30 bg-brand text-white'
                      : 'bg-surface-paper text-muted-foreground hover:text-foreground',
                  )}
                >
                  {filter === f.id && <Sparkles className="size-3" />}
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </section>

        <ViewState
          loading={loading}
          empty={!loading && rows.length === 0}
          loadingSkeleton={<StudySetGridSkeleton count={6} />}
          loadingLabel="Đang tải study sets…"
          {...(tab === 'mine' ? emptyStatePresets.communityMine : emptyStatePresets.community)}
          emptyAction={
            tab === 'mine' ? (
              <Link
                to={paths.student.studySetCreate}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-brand px-4 text-sm font-extrabold text-primary-foreground shadow-premium card-lift"
              >
                <Plus className="mr-2 size-4" />
                Tạo bộ mới
              </Link>
            ) : undefined
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((s) => (
              <StudySetCard key={s.id} set={s} />
            ))}
          </div>
        </ViewState>
      </div>
    </PageShell>
  );
}
