import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getHandbookKanji, upsertMastery } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';
import { kanjiMemoryImageAssetUrl } from '@/services/httpClient';

export function KanjiHandbookView() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof getHandbookKanji>>['items']>([]);

  async function load() {
    try {
      const res = await getHandbookKanji();
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <Link to={paths.learn.kanjiHub} className="text-sm text-primary hover:underline">
        ← Kanji
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">Sổ tay kanji</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Chưa có kanji — thêm từ bài học hoặc trang kanji khóa.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="font-jp text-3xl font-bold">{row.kanji.character}</p>
                  <p className="text-sm">{row.kanji.meaning}</p>
                  {row.kanji.memoryImageUrl && (
                    <img
                      src={kanjiMemoryImageAssetUrl(row.kanji.id)}
                      alt={`Memoric ${row.kanji.character}`}
                      className="mt-2 h-20 w-40 rounded object-contain border border-border/60 bg-muted/20 p-1"
                    />
                  )}
                  {row.kanji.radical && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Bộ thủ:{" "}
                      <span className="font-jp text-base">{row.kanji.radical}</span>
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={row.isFavorite ? 'default' : 'outline'}
                  onClick={() =>
                    upsertMastery({
                      itemId: row.itemId,
                      itemType: 'kanji',
                      isFavorite: !row.isFavorite,
                    }).then(load)
                  }
                >
                  ★
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
