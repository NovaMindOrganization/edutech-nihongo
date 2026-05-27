import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

const items = [
  { to: paths.student.reviewKanji, title: 'Kanji', desc: 'Ôn kanji đã học trong các tiết' },
  { to: paths.student.reviewVocabulary, title: 'Từ vựng', desc: 'Flashcard từ vựng đã học' },
  { to: paths.student.reviewGrammar, title: 'Ngữ pháp', desc: 'Ôn mẫu ngữ pháp đã học' },
] as const;

export function ReviewHubView() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Ôn tập</h1>
      <p className="mt-2 text-sm text-muted-foreground">Chỉ nội dung từ các tiết đã hoàn thành</p>
      <div className="mt-8 grid gap-4">
        {items.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="hover:border-primary/40">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.desc}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
