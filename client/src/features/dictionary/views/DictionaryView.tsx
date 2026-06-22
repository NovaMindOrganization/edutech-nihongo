import { BookOpen, Layers3, Search, ScrollText, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/usable/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/features/auth';
import { useSpeech } from '@/hooks/use-speech';

import { searchDictionary, type DictionaryResult } from '../services/dictionaryApi';

type Tab = 'all' | 'vocabulary' | 'grammar' | 'kanji';

export function DictionaryView() {
  const user = useAuthStore((s) => s.user);
  const { playTts, speaking } = useSpeech();
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
              <div className="mb-3 flex items-center gap-3">
                <AppIcon icon={Volume2} size="md" className="bg-tertiary" />
                <div>
                  <h2 className="font-display text-xl font-extrabold">Từ vựng</h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    Quét nhanh từ, nghĩa, cấp JLPT và nghe phát âm bằng TTS.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {result.vocabulary.map((v) => {
                  const primary = v.reading ?? v.word;
                  const kanji = v.reading ? v.word : null;
                  return (
                    <Card key={v.id} className="depth-interactive">
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <Badge className="bg-brand-soft text-brand">{v.jlptLevel}</Badge>
                          <p className="mt-3 truncate font-jp text-2xl font-bold">{primary}</p>
                          {kanji && <p className="mt-1 truncate font-jp text-base font-medium text-muted-foreground">{kanji}</p>}
                          <p className="mt-3 text-base font-bold leading-snug">{v.meaning}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          disabled={speaking}
                          onClick={() => playTts(primary)}
                          aria-label={`Phát âm ${primary}`}
                        >
                          <Volume2 className="size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'grammar') && result.grammar.length > 0 && (
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <AppIcon icon={ScrollText} size="md" className="bg-secondary" />
                <div>
                  <h2 className="font-display text-xl font-extrabold">Ngữ pháp</h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    Mỗi mẫu được tách rõ pattern, ý nghĩa và cấp độ để đọc nhanh.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {result.grammar.map((g) => (
                  <Card key={g.id} className="depth-interactive overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-brand-soft text-brand">{g.jlpt}</Badge>
                        <Badge variant="outline">Grammar</Badge>
                      </div>
                      <p className="mt-3 font-display text-lg font-extrabold leading-snug">{g.title}</p>
                      <div className="mt-3 rounded-lg border border-border bg-surface-paper p-3 shadow-premium card-lift">
                        <div className="mb-1 flex items-center gap-2">
                          <AppIcon icon={Layers3} size="sm" className="bg-tertiary" />
                          <span className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                            Pattern
                          </span>
                        </div>
                        <p className="font-jp text-lg font-bold leading-8 text-primary">{g.pattern}</p>
                      </div>
                      <div className="mt-3 rounded-2xl border border-dashed border-border bg-background/75 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <AppIcon icon={BookOpen} size="sm" className="bg-quaternary" />
                          <span className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                            Meaning
                          </span>
                        </div>
                        <p className="text-sm font-semibold leading-6">{g.meaningVi}</p>
                      </div>
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
