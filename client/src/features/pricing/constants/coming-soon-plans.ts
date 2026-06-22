export type ComingSoonPricingPlan = {
  id: string;
  name: string;
  description: string;
  jlptLevel: string;
  features: string[];
  statusLabel: string;
};

export const N3_COMING_SOON_PLAN: ComingSoonPricingPlan = {
  id: 'coming-soon-n3',
  name: 'Gói N3 — Trọn khóa',
  description: 'Khóa trung cấp JLPT N3 — ngữ pháp nâng cao, đọc hiểu và luyện đề có hệ thống.',
  jlptLevel: 'N3',
  features: [
    'Lộ trình bài học tuần tự',
    'MiniTest mở khóa từng chặng',
    'AI Speaking & OCR',
    'Mô phỏng đề JLPT N3',
  ],
  statusLabel: 'Chuẩn bị ra mắt',
};
