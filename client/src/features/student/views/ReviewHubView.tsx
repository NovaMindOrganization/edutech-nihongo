import { Link } from 'react-router-dom';

import { PageGrid, PageShell } from '@/components/usable/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

const items = [
  { to: paths.student.reviewKanji, title: 'Kanji', desc: 'Ôn kanji đã học trong các tiết' },
  { to: paths.student.reviewVocabulary, title: 'Từ vựng', desc: 'Flashcard từ vựng đã học' },
  { to: paths.student.reviewGrammar, title: 'Ngữ pháp', desc: 'Ôn mẫu ngữ pháp đã học' },
] as const;

export function ReviewHubView() {
  return (
    <PageShell
      eyebrow="Ôn tập"
      title="Ôn tập"
      description="Chỉ nội dung từ các tiết bạn đã hoàn thành."
    >
      <PageGrid>
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
