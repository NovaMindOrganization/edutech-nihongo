import { NotebookPen } from 'lucide-react';

import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { NotebookPoolHub } from './notebook-shared';

export function NotebookHubView() {
  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Sổ tay"
      title="Sổ tay & ôn tập"
      description="Kanji, từ vựng và ngữ pháp — chọn nguồn bên dưới."
      icon={NotebookPen}
      iconClassName="bg-brand-soft"
      badgeClassName="bg-brand-soft text-brand"
      tone="brand"
      chips={['Kanji', 'Từ vựng', 'Ngữ pháp', 'Ôn tập']}
      footer="Lộ trình học lấy từ khóa bạn đang theo; Sưu tập riêng gom mục từ OCR và yêu thích."
    >
      <NotebookPoolHub />
    </PageShell>
  );
}
