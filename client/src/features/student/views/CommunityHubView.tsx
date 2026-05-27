import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

export function CommunityHubView() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Cộng đồng</h1>
      <div className="mt-8 grid gap-4">
        <Link to={paths.student.studySets}>
          <Card className="hover:border-primary/40">
            <CardHeader>
              <CardTitle>Study sets</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Bộ thẻ do học viên đăng, đã kiểm duyệt
            </CardContent>
          </Card>
        </Link>
        <Link to={paths.student.communityCall}>
          <Card className="hover:border-primary/40">
            <CardHeader>
              <CardTitle>Gọi luyện nói ngẫu nhiên</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Ghép cặp P2P + STT + đánh giá Gemini sau cuộc gọi
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
