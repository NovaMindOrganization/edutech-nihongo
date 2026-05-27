import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div>
      <h1 className="font-display text-2xl font-bold">Hội thoại (tiết học)</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} hội thoại — gán vào tiết qua Khóa học → lesson assign
      </p>

      <AdminListFilters>
        <JlptLevelFilter
          value={jlptLevel}
          onChange={(v) => {
            setJlptLevel(v);
            setPage(1);
          }}
        />
      </AdminListFilters>

      <div className="mt-6 max-w-xl space-y-2 rounded-lg border p-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />
        <select
          className="rounded-lg border bg-background px-3 py-2 text-sm"
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
          className="min-h-[120px] w-full rounded-md border bg-background p-2 font-mono text-xs"
          value={lines}
          onChange={(e) => setLines(e.target.value)}
        />
        <Button onClick={handleCreate}>Tạo hội thoại</Button>
      </div>
      <ul className="mt-8 space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Không có hội thoại phù hợp.</p>
        )}
        {items.map((c) => (
          <li key={c.id} className="rounded-lg border px-4 py-3 text-sm">
            <p className="font-medium">{c.title ?? c.id}</p>
            <p className="text-muted-foreground">{c.jlptLevel ?? '—'}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </Button>
        <span className="flex items-center text-sm">
          Trang {page} / {Math.max(1, Math.ceil(total / 50))}
        </span>
        <Button variant="outline" disabled={page * 50 >= total} onClick={() => setPage((p) => p + 1)}>
          Sau
        </Button>
      </div>
    </div>
  );
}
