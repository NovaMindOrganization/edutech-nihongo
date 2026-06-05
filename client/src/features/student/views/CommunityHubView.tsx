import { Link } from 'react-router-dom';

import { PageGrid, PageShell } from '@/components/usable/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/router/paths';

const items = [
  {
    to: paths.student.studySets,
    title: 'Study sets',
    desc: 'Bộ thẻ do học viên đăng, đã kiểm duyệt',
  },
  {
    to: paths.student.communityCall,
    title: 'Gọi luyện nói ngẫu nhiên',
    desc: 'Video/voice WebRTC — ghép ngẫu nhiên',
  },
] as const;

export function CommunityHubView() {
  return (
    <PageShell
      eyebrow="Cộng đồng"
      title="Cộng đồng"
      description="Học cùng học viên khác qua study sets và luyện nói trực tuyến."
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
