import { Clock, Target } from 'lucide-react';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
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
      <div className="space-y-3">
        {lesson.objective ? (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
            <AppIcon icon={Target} size="md" className="bg-brand-soft" active />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Mục tiêu
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                {lesson.objective}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {lesson.lessonType === 'support' || lesson.isBonus ? (
            <Badge variant="outline">Bài phụ trợ</Badge>
          ) : (
            <Badge className="bg-brand-soft text-brand">Bài chính</Badge>
          )}
          {lesson.estimatedMinutes ? (
            <Badge variant="outline" className="gap-1">
              <Clock className="size-3.5" strokeWidth={2} />
              ~{lesson.estimatedMinutes} phút
            </Badge>
          ) : null}
          <Badge variant="outline">{lesson.course.jlptLevel}</Badge>
        </div>

        {lesson.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{lesson.description}</p>
        ) : null}
      </div>

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

      {lesson.speakingPrompt ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Gợi ý luyện nói
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{lesson.speakingPrompt}</p>
        </div>
      ) : null}
    </div>
  );
}
