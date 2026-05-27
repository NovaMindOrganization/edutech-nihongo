import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLessonData } from '../context/lesson-context';

export function LessonVocabularyView() {
  const { vocabulary } = useLessonData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-jp">Từ vựng ({vocabulary.length})</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {vocabulary.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có từ vựng trong tiết.</p>
        )}
        {vocabulary.map((v) => (
          <div
            key={v.id}
            className="rounded-lg border border-border/60 bg-gradient-to-br from-card to-[var(--nc-cream)]/40 p-4"
          >
            <p className="font-jp text-xl font-semibold">{v.word}</p>
            {v.reading && <p className="text-sm text-primary/80">{v.reading}</p>}
            <p className="mt-1 text-sm">{v.meaning}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
