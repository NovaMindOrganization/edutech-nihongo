import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

export function PracticeHubView() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Luyện đề</h1>
      <div className="mt-8 grid gap-4">
        <Link to={paths.placementTest}>
          <Card className="hover:border-primary/40">
            <CardHeader>
              <CardTitle>Kiểm tra trình độ</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Placement test — xác định N5/N4/N3 phù hợp
            </CardContent>
          </Card>
        </Link>
        <Link to={paths.student.jlptSim}>
          <Card className="hover:border-primary/40">
            <CardHeader>
              <CardTitle>Đề JLPT</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Thi thử JLPT có giới hạn thời gian
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
