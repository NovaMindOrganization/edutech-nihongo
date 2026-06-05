import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

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
    setLoading(true);
    Promise.all([loadCommunity(), loadMine()])
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi tải'))
      .finally(() => setLoading(false));
  }, [loadCommunity, loadMine]);

  const rows = tab === 'community' ? community : mine;

  return (
    <div className="w-full pb-12">
      <Link to={paths.student.community} className="text-sm text-primary hover:underline">
        ← Cộng đồng
      </Link>

      <section className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 text-primary-foreground shadow-lg sm:p-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Study Sets</h1>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          Khám phá bộ học do cộng đồng chia sẻ — từ vựng, ngữ pháp, kanji, luyện nghe và giao
          tiếp.
        </p>
        <Link
          to={paths.student.studySetCreate}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-sm font-medium text-primary hover:bg-white/90"
        >
          <Plus className="mr-2 size-4" />
          Tạo bộ mới
        </Link>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={tab === 'community' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('community')}
        >
          Cộng đồng
        </Button>
        <Button
          type="button"
          variant={tab === 'mine' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('mine')}
        >
          Của tôi
        </Button>
      </div>

      {tab === 'community' && (
        <>
          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm theo tiêu đề…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  filter === f.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      {loading && <p className="mt-8 text-sm text-muted-foreground">Đang tải…</p>}
      {!loading && rows.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          {tab === 'mine' ? 'Bạn chưa có study set nào.' : 'Chưa có bộ công khai phù hợp.'}
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((s) => (
          <StudySetCard key={s.id} set={s} />
        ))}
      </div>
    </div>
  );
}
