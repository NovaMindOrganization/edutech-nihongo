import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

import { getLesson } from '../services/learnApi';

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
    <div className="mx-auto max-w-3xl">
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
              className="rounded-lg border border-border/60 bg-gradient-to-br from-card to-[var(--nc-cream)]/40 p-4"
            >
              <p className="font-jp text-xl font-semibold">{v.word}</p>
              <p className="text-sm text-primary/80">{v.reading}</p>
              <p className="mt-1 text-sm">{v.meaning}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ngữ pháp ({data.grammar.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.grammar.map((g) => (
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
    </div>
  );
}
