import { Star, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { PageShell } from '@/components/usable/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSpeech } from '@/hooks/use-speech';
import { kanjiHasMemoryImage, kanjiMemoryImageSrc } from '@/services/httpClient';
import { cn } from '@/utils/cn';

import {
  getHandbookKanji,
  getNotebookVocabulary,
  upsertMastery,
} from '../services/studentApi';

const JLPT_LEVELS = ['N5', 'N4'] as const;
type JlptLevel = (typeof JLPT_LEVELS)[number];
type Tab = 'vocabulary' | 'kanji';

type VocabItem = {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  mastery: {
    isLearned: boolean;
    isFavorite: boolean;
    note: string | null;
  } | null;
};

export function NotebookHubView() {
  const [tab, setTab] = useState<Tab>('vocabulary');
  const [level, setLevel] = useState<JlptLevel>('N5');
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [kanjiItems, setKanjiItems] = useState<
    Awaited<ReturnType<typeof getHandbookKanji>>['items']
  >([]);
  const [loading, setLoading] = useState(false);
  const { playTts, speaking } = useSpeech();

  const loadVocab = useCallback(async () => {
    const data = await getNotebookVocabulary({ level });
    setVocabItems(
      data.items.map((v) => ({
        id: String(v.id),
        word: String(v.word),
        reading: v.reading != null ? String(v.reading) : null,
        meaning: String(v.meaning ?? ''),
        mastery: (v.mastery as VocabItem['mastery']) ?? null,
      })),
    );
  }, [level]);

  const loadKanji = useCallback(async () => {
    const res = await getHandbookKanji(level);
    setKanjiItems(res.items);
  }, [level]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'vocabulary') await loadVocab();
      else await loadKanji();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được sổ tay');
    } finally {
      setLoading(false);
    }
  }, [tab, loadVocab, loadKanji]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveVocabNote(itemId: string, note: string) {
    try {
      await upsertMastery({ itemId, itemType: 'vocabulary', note });
      toast.success('Đã lưu ghi chú');
      await loadVocab();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <PageShell
      eyebrow="Sổ tay"
      title="Notebook — Từ vựng & Kanji"
      description="Tổng hợp từ vựng và kanji theo cấp JLPT. Gắn sao và ghi chú cá nhân."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border/70 p-0.5">
          {(['vocabulary', 'kanji'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'vocabulary' ? 'Từ vựng' : 'Kanji'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {JLPT_LEVELS.map((l) => (
            <Button
              key={l}
              size="sm"
              variant={level === l ? 'default' : 'outline'}
              onClick={() => setLevel(l)}
            >
              {l}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : tab === 'vocabulary' ? (
        vocabItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có từ vựng {level} trong sổ tay — học bài hoặc thêm từ OCR.
          </p>
        ) : (
          <Card>
            <CardContent className="divide-y p-0">
              {vocabItems.map((v) => {
                const primaryText = v.reading ?? v.word;
                const kanjiText = v.reading ? v.word : null;
                const starred = v.mastery?.isFavorite ?? false;
                return (
                  <div key={v.id} className="space-y-2 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-jp text-lg font-bold">{primaryText}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            disabled={speaking}
                            onClick={() => playTts(primaryText)}
                          >
                            <Volume2 className="size-4" />
                          </Button>
                        </div>
                        {kanjiText && (
                          <p className="font-jp text-sm text-muted-foreground">{kanjiText}</p>
                        )}
                        <p className="text-sm">{v.meaning}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="icon"
                          variant={starred ? 'default' : 'outline'}
                          onClick={() =>
                            upsertMastery({
                              itemId: v.id,
                              itemType: 'vocabulary',
                              isFavorite: !starred,
                            }).then(loadVocab)
                          }
                        >
                          <Star className={cn('size-4', starred && 'fill-current')} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            upsertMastery({
                              itemId: v.id,
                              itemType: 'vocabulary',
                              isLearned: true,
                            }).then(loadVocab)
                          }
                        >
                          Đã học
                        </Button>
                      </div>
                    </div>
                    <Input
                      placeholder="Ghi chú cá nhân…"
                      defaultValue={v.mastery?.note ?? ''}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next !== (v.mastery?.note ?? '')) {
                          void saveVocabNote(v.id, next);
                        }
                      }}
                      className="text-sm"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )
      ) : kanjiItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có kanji {level} — thêm từ bài học hoặc OCR.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {kanjiItems.map((row) => (
            <Card key={row.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-jp text-3xl font-bold">{row.kanji.character}</p>
                    <p className="text-sm">{row.kanji.meaning}</p>
                    {kanjiHasMemoryImage(row.kanji) && (
                      <img
                        src={kanjiMemoryImageSrc(row.kanji)}
                        alt={`Mnemonic ${row.kanji.character}`}
                        className="mt-2 h-20 w-40 rounded border border-border/60 bg-muted/20 object-contain p-1"
                      />
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant={row.isFavorite ? 'default' : 'outline'}
                    onClick={() =>
                      upsertMastery({
                        itemId: row.itemId,
                        itemType: 'kanji',
                        isFavorite: !row.isFavorite,
                      }).then(loadKanji)
                    }
                  >
                    <Star className={cn('size-4', row.isFavorite && 'fill-current')} />
                  </Button>
                </div>
                <Input
                  placeholder="Ghi chú cá nhân…"
                  defaultValue={row.note ?? ''}
                  onBlur={(e) => {
                    const next = e.target.value.trim();
                    if (next !== (row.note ?? '')) {
                      upsertMastery({
                        itemId: row.itemId,
                        itemType: 'kanji',
                        note: next,
                      }).then(loadKanji);
                    }
                  }}
                  className="text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
