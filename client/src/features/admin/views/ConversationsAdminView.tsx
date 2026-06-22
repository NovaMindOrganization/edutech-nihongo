import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InsetEmpty } from '@/components/usable/inset-empty';
import { Input } from '@/components/ui/input';

import {
  AdminListPanel,
  AdminPagination,
  AdminSection,
  StaffListPageShell,
} from '../components/admin-page-shell';
import { AdminListFilters, JlptLevelFilter } from '../components/admin-list-filters';
import { JLPT_ALL } from '../constants';
import { createConversation, listConversations } from '../services/adminApi';

export function ConversationsAdminView() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listConversations>>['items']>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [jlptLevel, setJlptLevel] = useState(JLPT_ALL);
  const [title, setTitle] = useState('Hội thoại mới');
  const [createJlpt, setCreateJlpt] = useState('N5');
  const [lines, setLines] = useState(
    '[{"speaker":"A","text":"こんにちは。","translation":"Xin chào."},{"speaker":"B","text":"こんにちは。","translation":"Xin chào."}]',
  );

  const load = useCallback(async () => {
    const res = await listConversations({
      page: String(page),
      limit: '50',
      ...(jlptLevel ? { jlptLevel } : {}),
    });
    setItems(res.items);
    setTotal(res.total);
  }, [page, jlptLevel]);

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, [load]);

  async function handleCreate() {
    try {
      const dialogue = JSON.parse(lines) as Array<{ speaker: string; text: string }>;
      await createConversation({ title, dialogue, jlptLevel: createJlpt });
      toast.success('Đã tạo hội thoại');
      load();
    } catch {
      toast.error('JSON dialogue không hợp lệ');
    }
  }

  return (
    <StaffListPageShell
      title="Hội thoại"
      description="Dialogue tiết học — gán vào lesson qua Khóa học → chi tiết tiết."
      icon={MessageSquare}
      iconClassName="bg-quaternary/50"
      chips={['Speaking', 'JSON', 'JLPT']}
      total={total}
      secondaryStat={{ label: 'Trang này', value: items.length }}
      filters={
        <AdminListFilters className="mt-0 border-0 bg-transparent p-0 shadow-none">
          <JlptLevelFilter
            value={jlptLevel}
            onChange={(v) => {
              setJlptLevel(v);
              setPage(1);
            }}
          />
        </AdminListFilters>
      }
      pagination={
        <AdminPagination
          page={page}
          total={total}
          pageSize={50}
          onPrevious={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      }
    >
      <AdminSection
        title="Tạo hội thoại mới"
        description="Nhập tiêu đề và JSON dialogue (speaker, text, translation)."
        icon={MessageSquare}
        iconClassName="bg-secondary"
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />
        <select
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm"
          value={createJlpt}
          onChange={(e) => setCreateJlpt(e.target.value)}
        >
          {['N5', 'N4', 'N3', 'N2', 'N1'].map((lv) => (
            <option key={lv} value={lv}>
              {lv}
            </option>
          ))}
        </select>
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-border bg-background p-3 font-mono text-xs shadow-sm"
          value={lines}
          onChange={(e) => setLines(e.target.value)}
        />
        <Button onClick={handleCreate}>Tạo hội thoại</Button>
      </AdminSection>

      <AdminListPanel>
        {items.length === 0 ? (
          <InsetEmpty
            tone="speaking"
            title="Không có hội thoại phù hợp"
            description="Tạo hội thoại mới hoặc đổi bộ lọc JLPT."
          />
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="font-display text-sm font-extrabold">{c.title ?? c.id}</p>
                <p className="text-xs font-medium text-muted-foreground">ID: {c.id.slice(0, 8)}…</p>
              </div>
              {c.jlptLevel ? (
                <Badge className="border-0 bg-secondary text-secondary-foreground">{c.jlptLevel}</Badge>
              ) : null}
            </div>
          ))
        )}
      </AdminListPanel>
    </StaffListPageShell>
  );
}
