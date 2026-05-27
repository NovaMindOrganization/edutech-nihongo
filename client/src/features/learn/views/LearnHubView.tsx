import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

import { listPublicCourses, type PublicCourse } from '../services/learnApi';

export function LearnHubView() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);

  useEffect(() => {
    listPublicCourses()
      .then(setCourses)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải được khóa học'));
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-display text-sm tracking-widest text-primary uppercase">Học → Khóa học</p>
        <h1 className="font-display text-3xl font-bold">Khóa học JLPT</h1>
        <p className="mt-2 text-muted-foreground">
          N5, N4, N3… Mỗi khóa gồm nhiều tiết: nghe nói AI, ngữ pháp, hội thoại, kanji.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-4">
        {courses.map((course, i) => (
          <motion.div key={course.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
                <div>
                  <Badge className="mb-2">{course.jlptLevel}</Badge>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{course.lessons.length} bài học</p>
                </div>
                <Sparkles className="size-8 text-primary/60" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link to={paths.learn.course(course.id)}>
                  <Button>Xem lộ trình</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Bài bị khóa cho đến khi hoàn thành MiniTest bài trước (logic server-side).
      </p>
    </div>
  );
}
