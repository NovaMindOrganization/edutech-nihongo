import { useLessonData } from '../context/lesson-context';

export function LessonOverviewView() {
  const { lesson, vocabulary, grammar, kanji, conversations } = useLessonData();
  const sections = [
    { label: 'Từ vựng', count: vocabulary.length },
    { label: 'Ngữ pháp', count: grammar.length },
    { label: 'Hội thoại', count: conversations.length },
    { label: 'Kanji', count: kanji.length },
  ].filter((s) => s.count > 0);

  return (
    <div className="space-y-6">
      {sections.length > 0 ? (
        <div>
          <h3 className="mb-3 font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
            Nội dung bài học
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map((section) => (
              <div
                key={section.label}
                className="rounded-xl border border-border bg-surface-paper px-4 py-3 shadow-premium card-lift"
              >
                <p className="text-sm font-bold text-foreground">{section.label}</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-primary">
                  {section.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}