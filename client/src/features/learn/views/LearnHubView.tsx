import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageGrid, PageShell } from '@/components/usable/page-shell';
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
    <PageShell
      eyebrow="Học"
      title="Khóa học JLPT"
      description="N5, N4, N3… Mỗi khóa gồm nhiều tiết: nghe nói AI, ngữ pháp, hội thoại, kanji."
    >
      <PageGrid cols="wide">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="h-full overflow-hidden border-primary/20">
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
      </PageGrid>

      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Bài bị khóa cho đến khi hoàn thành MiniTest bài trước (logic server-side).
      </p>
    </PageShell>
  );
}
