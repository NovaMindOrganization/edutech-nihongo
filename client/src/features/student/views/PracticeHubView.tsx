import { Link } from 'react-router-dom';

import { PageGrid, PageShell } from '@/components/usable/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

const items = [
  {
    to: paths.placementTest,
    title: 'Kiểm tra trình độ',
    desc: 'Placement test — xác định N5/N4/N3 phù hợp',
  },
  {
    to: paths.student.jlptSim,
    title: 'Đề JLPT',
    desc: 'Thi thử JLPT có giới hạn thời gian',
  },
] as const;

export function PracticeHubView() {
  return (
    <PageShell
      eyebrow="Luyện đề"
      title="Luyện đề"
      description="Kiểm tra trình độ và thi thử theo format JLPT."
    >
      <PageGrid cols="wide">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="block h-full">
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.desc}</CardContent>
            </Card>
          </Link>
        ))}
      </PageGrid>
    </PageShell>
  );
}
