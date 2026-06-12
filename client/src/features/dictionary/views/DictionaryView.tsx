import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageShell } from '@/components/usable/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/features/auth';

import { searchDictionary, type DictionaryResult } from '../services/dictionaryApi';

type Tab = 'all' | 'vocabulary' | 'grammar' | 'kanji';

export function DictionaryView() {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryResult | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const data = await searchDictionary(q, Boolean(user));
      if (data.rateLimited) {
        toast.error('Đã vượt giới hạn tra cứu — hãy đăng nhập hoặc thử lại sau.');
      }
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tra cứu thất bại');
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'vocabulary', label: 'Từ vựng' },
    { id: 'grammar', label: 'Ngữ pháp' },
    { id: 'kanji', label: 'Kanji' },
  ];

  return (
    <PageShell
      eyebrow="Từ điển"
      title="Tra cứu tiếng Nhật"
      description="Tìm từ vựng, ngữ pháp và kanji — dùng được khi chưa đăng nhập."
    >
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ, kanji hoặc nghĩa tiếng Việt…"
          className="max-w-xl"
        />
        <Button type="submit" disabled={loading}>
          <Search className="mr-1 size-4" />
          {loading ? 'Đang tìm…' : 'Tìm'}
        </Button>
      </form>

      {result && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={tab === t.id ? 'default' : 'outline'}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {(tab === 'all' || tab === 'vocabulary') && result.vocabulary.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 font-semibold">Từ vựng</h2>
              <div className="space-y-2">
                {result.vocabulary.map((v) => {
                  const primary = v.reading ?? v.word;
                  const kanji = v.reading ? v.word : null;
                  return (
                    <Card key={v.id}>
                      <CardContent className="py-3">
                        <p className="font-jp font-bold">{primary}</p>
                        {kanji && <p className="font-jp text-sm text-muted-foreground">{kanji}</p>}
                        <p className="text-sm">{v.meaning}</p>
                        <p className="text-xs text-muted-foreground">{v.jlptLevel}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'grammar') && result.grammar.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 font-semibold">Ngữ pháp</h2>
              <div className="space-y-2">
                {result.grammar.map((g) => (
                  <Card key={g.id}>
                    <CardContent className="py-3">
                      <p className="font-medium">{g.title}</p>
                      <p className="font-jp text-primary">{g.pattern}</p>
                      <p className="text-sm">{g.meaningVi}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'kanji') && result.kanji.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold">Kanji</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {result.kanji.map((k) => (
                  <Card key={k.id}>
                    <CardContent className="py-3">
                      <p className="font-jp text-2xl font-bold">{k.character}</p>
                      <p className="text-sm">{k.meaning}</p>
                      {k.hanVietPronunciation && (
                        <p className="text-xs text-muted-foreground">Hán Việt: {k.hanVietPronunciation}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        On: {k.readingsOn.join(', ') || '—'} · Kun: {k.readingsKun.join(', ') || '—'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {result.vocabulary.length === 0 &&
            result.grammar.length === 0 &&
            result.kanji.length === 0 && (
              <p className="text-sm text-muted-foreground">Không có kết quả.</p>
            )}
        </div>
      )}
    </PageShell>
  );
}
