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
            <p className="font-medium text-primary">{g.title}</p>
            <p className="font-jp text-sm text-muted-foreground">{g.pattern}</p>
            <p className="mt-1 text-sm">{g.meaningVi}</p>
            {g.usage && <p className="mt-1 text-xs text-muted-foreground">{g.usage}</p>}
            {g.notes && <p className="mt-1 text-xs text-muted-foreground">{g.notes}</p>}
            {g.examples && g.examples.length > 0 && (
              <div className="mt-2 space-y-1 text-sm">
                {g.examples.map((ex, idx) => (
                  <div key={`${g.id}-ex-${idx}`}>
                    <p className="font-jp">{ex.jp}</p>
                    <p className="text-muted-foreground">{ex.vi}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
