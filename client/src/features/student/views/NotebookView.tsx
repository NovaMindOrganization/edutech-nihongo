import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookMarked, Volume2 } from "lucide-react";

import { AppIcon } from "@/components/usable/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSpeech } from "@/hooks/use-speech";
import {
  getNotebookVocabulary,
  upsertMastery,
} from "@/features/student/services/studentApi";

export function NotebookView() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const { playTts, speaking } = useSpeech();

  useEffect(() => {
    getNotebookVocabulary({ level: "N5" })
      .then((d) => setItems(d.items))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Lỗi"));
  }, []);

  async function markLearned(itemId: string) {
    try {
      await upsertMastery({ itemId, itemType: "vocabulary", isLearned: true });
      toast.success("Đã đánh dấu đã học");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  }

  return (
    <div className="w-full space-y-6">
      <header className="rounded-xl border border-border bg-surface-paper p-5 shadow-premium card-lift">
        <div className="flex items-start gap-3">
          <AppIcon icon={BookMarked} size="lg" className="bg-quaternary" />
          <div>
            <Badge className="bg-tertiary text-tertiary-foreground">Vocabulary Notebook</Badge>
            <h1 className="mt-2 font-display text-3xl font-extrabold">Sổ tay từ vựng</h1>
            <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
              Từ đã lưu được trình bày theo thẻ để dễ quét nhanh, nghe lại và đánh dấu đã học.
            </p>
          </div>
        </div>
      </header>
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2">
          {items.slice(0, 40).map((v) => (
            <div
              key={String(v.id)}
              className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:shadow-premium card-lift"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-brand-soft text-brand">
                      {String(v.jlptLevel ?? v.level ?? "JLPT")}
                    </Badge>
                    {v.reading ? (
                      <span className="rounded-full border border-border bg-surface-paper px-3 py-1 text-xs font-bold text-muted-foreground shadow-premium card-lift">
                        {String(v.reading)}
                      </span>
                    ) : null}
                  </div>
                  <span className="block truncate font-jp text-2xl font-bold">{String(v.word)}</span>
                  <span className="mt-2 block text-base font-bold leading-snug">
                    {String(v.meaning)}
                  </span>
                  {v.exampleSentence || v.exampleTranslation ? (
                    <div className="mt-3 rounded-2xl border border-dashed border-border bg-surface-paper p-3">
                      {v.exampleSentence ? (
                        <p className="font-jp text-sm font-semibold leading-7">{String(v.exampleSentence)}</p>
                      ) : null}
                      {v.exampleTranslation ? (
                        <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
                          {String(v.exampleTranslation)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={speaking}
                    onClick={() => playTts(String(v.reading ?? v.word))}
                    aria-label={`Phát âm ${String(v.reading ?? v.word)}`}
                  >
                    <Volume2 className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markLearned(String(v.id))}
                    className="flex-1 whitespace-nowrap sm:flex-none"
                  >
                    Đã học
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
