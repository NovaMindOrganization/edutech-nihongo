import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLessonData } from '../context/lesson-context';

export function LessonKanjiView() {
  const { kanji } = useLessonData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-jp">Kanji tiết học ({kanji.length})</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {kanji.length === 0 && <p className="text-sm text-muted-foreground">Chưa có kanji.</p>}
        {kanji.map((k) => (
          <div key={k.id} className="rounded-lg border p-4 text-center">
            <p className="font-jp text-4xl font-bold">{k.character}</p>
            <p className="mt-2 text-sm">{k.meaning}</p>
            <p className="text-xs text-muted-foreground">
              On: {k.readingsOn.join(', ')} · Kun: {k.readingsKun.join(', ')}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
