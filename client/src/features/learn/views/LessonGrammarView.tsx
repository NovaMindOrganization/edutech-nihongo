import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLessonData } from '../context/lesson-context';

export function LessonGrammarView() {
  const { grammar } = useLessonData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ngữ pháp ({grammar.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {grammar.length === 0 && <p className="text-sm text-muted-foreground">Chưa có ngữ pháp.</p>}
        {grammar.map((g) => (
          <div key={g.id} className="border-b border-border/40 pb-3 last:border-0">
            <p className="font-jp font-medium text-primary">{g.pattern}</p>
            {g.structure && <p className="text-xs text-muted-foreground">{g.structure}</p>}
            <p className="mt-1 text-sm">{g.meaning}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
