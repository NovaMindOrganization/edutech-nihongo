import { ClipboardCheck, Trophy } from 'lucide-react';

import { HubLinkCard } from '@/components/usable/hub-link-card';
import { PageShell } from '@/components/usable/page-shell';
import { paths } from '@/router/paths';

const items = [
  {
    to: paths.placementTest,
    icon: ClipboardCheck,
    accent: 'bg-tertiary',
    title: 'Kiểm tra trình độ',
    description: 'Placement test — xác định N5/N4/N3 phù hợp trước khi chọn lộ trình.',
    cta: 'Làm bài test',
  },
  {
    to: paths.student.jlptSim,
    icon: Trophy,
    accent: 'bg-secondary',
    title: 'Đề JLPT',
    description: 'Thi thử JLPT có giới hạn thời gian — quen format đề thật.',
    cta: 'Chọn đề thi',
  },
] as const;

export function PracticeHubView() {
  return (
    <PageShell
      eyebrow="Luyện đề"
      title="Luyện đề"
      description="Kiểm tra trình độ và thi thử theo format JLPT."
      icon={ClipboardCheck}
      iconClassName="bg-secondary"
      tone="secondary"
      chips={['Placement test', 'JLPT mock', 'Có giới hạn thời gian']}
      footer="Bắt đầu bằng placement test nếu chưa biết trình độ — sau đó thử đề JLPT để quen format thi."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <HubLinkCard
            key={item.to}
            to={item.to}
            icon={item.icon}
            accent={item.accent}
            title={item.title}
            description={item.description}
            cta={item.cta}
          />
        ))}
      </div>
    </PageShell>
  );
}
