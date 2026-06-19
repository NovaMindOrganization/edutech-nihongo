import { motion } from 'framer-motion';
import { BookOpen, Layers3, Lightbulb, Quote, ScrollText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

import type { JapaneseSegment } from '@/features/student/services/studentApi';

import { getLesson } from '../services/learnApi';

function exampleJapanese(segments: JapaneseSegment[] = []) {
  return segments.map((segment) => ('kanji' in segment ? segment.kanji : segment.text)).join('');
}

export function LessonView() {
  const { lessonId = '' } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getLesson>> | null>(null);

  useEffect(() => {
    getLesson(lessonId)
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không mở được bài học'));
  }, [lessonId]);

  if (!data) {
    return <p className="text-muted-foreground">Đang tải bài học...</p>;
  }

  return (
    <div className="w-full">
      <Link to={paths.learn.hub} className="text-sm text-primary hover:underline">
        ← Lộ trình
      </Link>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <p className="text-sm text-muted-foreground">{data.lesson.course.title}</p>
        <h1 className="font-display text-2xl font-bold">{data.lesson.title}</h1>
        <Link to={paths.learn.miniTest(lessonId)} className="mt-4 inline-block">
          <Button>Làm MiniTest</Button>
        </Link>
      </motion.div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-jp">Từ vựng ({data.vocabulary.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {data.vocabulary.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-lg border border-border/60 bg-gradient-to-br from-card to-[var(--background)]/40 p-4"
            >
              <p className="font-jp text-xl font-semibold">{v.word}</p>
              <p className="text-sm text-primary/80">{v.reading}</p>
              <p className="mt-1 text-sm">{v.meaning}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="border-b border-border bg-surface-paper">
          <div className="flex items-center gap-3">
            <AppIcon icon={ScrollText} size="lg" className="bg-secondary" />
            <div>
              <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                Grammar
              </p>
              <CardTitle>Ngữ pháp ({data.grammar.length})</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 bg-background p-4 sm:p-6">
          {data.grammar.map((g) => (
            <div key={g.id} className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-brand-soft text-brand">{g.jlpt}</Badge>
                {g.type && <Badge variant="outline">{g.type}</Badge>}
              </div>
              <p className="mt-3 font-display text-lg font-extrabold text-primary">{g.title}</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface-paper p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <AppIcon icon={Layers3} size="sm" className="bg-tertiary" />
                    <span className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                      Pattern
                    </span>
                  </div>
                  <p className="font-jp text-lg font-bold leading-8">{g.pattern}</p>
                </div>
                <div className="rounded-lg border border-border bg-quaternary/15 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <AppIcon icon={BookOpen} size="sm" className="bg-quaternary" />
                    <span className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                      Ý nghĩa
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-6">{g.meaningVi}</p>
                </div>
              </div>
              {g.usage && (
                <p className="mt-3 rounded-2xl border border-dashed border-border bg-background/75 p-3 text-sm font-medium leading-6 text-muted-foreground">
                  {g.usage}
                </p>
              )}
              {g.notes && (
                <p className="mt-3 flex gap-2 rounded-lg border border-border bg-tertiary/20 p-3 text-sm font-medium leading-6 text-muted-foreground">
                  <AppIcon icon={Lightbulb} size="sm" className="bg-tertiary" />
                  <span>{g.notes}</span>
                </p>
              )}
              {g.examples && g.examples.length > 0 && (
                <div className="mt-3 space-y-2 text-sm">
                  {g.examples.map((ex, idx) => (
                    <div key={`${g.id}-ex-${idx}`} className="rounded-2xl border border-dashed border-border bg-background/75 p-3">
                      <p className="mb-1 flex items-center gap-2 font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                        <Quote className="size-3.5" />
                        Ví dụ {idx + 1}
                      </p>
                      <p className="font-jp text-base font-semibold">{exampleJapanese(ex.segments)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{ex.vi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
