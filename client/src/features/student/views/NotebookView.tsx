import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getNotebookVocabulary, upsertMastery } from '@/features/student/services/studentApi';

export function NotebookView() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    getNotebookVocabulary({ level: 'N5' })
      .then((d) => setItems(d.items))
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, []);

  async function markLearned(itemId: string) {
    try {
      await upsertMastery({ itemId, itemType: 'vocabulary', isLearned: true });
      toast.success('Đã đánh dấu đã học');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Sổ tay từ vựng</h1>
      <Card className="mt-6">
        <CardContent className="divide-y p-0">
          {items.slice(0, 40).map((v) => (
            <div key={String(v.id)} className="flex items-center gap-3 px-4 py-3">
              <span className="font-jp font-medium">{String(v.word)}</span>
              <span className="flex-1 text-sm">{String(v.meaning)}</span>
              <Button size="sm" variant="outline" onClick={() => markLearned(String(v.id))}>
                Đã học
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
